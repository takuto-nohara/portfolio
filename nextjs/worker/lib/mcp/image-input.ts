import { AdminOperationError, type UploadFile } from "@/application/publicApi";

import type { JsonSchema } from "./json-schema";

/**
 * MCP から受け取る画像。公開 URL（https）を Worker が取りに行くか、base64 で直接受け取る。
 *
 * 形式は中身の先頭バイトで確かめ、PNG / JPEG / GIF / WebP / AVIF だけを受ける。
 * SVG はサイトと同じオリジンで配信するとスクリプトを実行できてしまうので受けない。
 */

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10 * 1000;

export interface ImageArg {
  readonly url?: string;
  readonly base64?: string;
  readonly filename?: string;
}

export const imageSchema: JsonSchema = {
  type: "object",
  description: "画像。url（https の公開 URL）か base64（data URL 可）のどちらか一方を指定します。PNG / JPEG / GIF / WebP / AVIF、10MB まで。",
  properties: {
    url: { type: "string", maxLength: 2048, description: "画像の公開 URL（https）" },
    base64: { type: "string", maxLength: 14_000_000, description: "画像の base64。data:image/png;base64,... の形でもよい" },
    filename: { type: "string", maxLength: 200, description: "ファイル名（拡張子の決定に使う。省略可）" },
  },
  additionalProperties: false,
};

const extensions: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};

function invalid(message: string): AdminOperationError {
  return new AdminOperationError("invalid_input", message);
}

/** 先頭バイトから画像の形式を判定する。対応していない形式なら null */
function sniffImageType(bytes: Uint8Array): string | null {
  const startsWith = (signature: readonly number[], offset = 0) => signature.every((byte, index) => bytes[offset + index] === byte);
  const ascii = (offset: number, length: number) => String.fromCharCode(...bytes.subarray(offset, offset + length));

  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (ascii(4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(8, 4))) return "image/avif";
  return null;
}

function decodeBase64(text: string): Uint8Array {
  const payload = text.replace(/^data:[^;,]*(;base64)?,/u, "").replace(/\s/gu, "");

  try {
    return Uint8Array.from(atob(payload), (char) => char.charCodeAt(0));
  } catch {
    throw invalid("base64 として読めませんでした。");
  }
}

/** 本文を最後まで読む。上限を超えたら読むのをやめてエラー */
async function readLimited(response: Response): Promise<Uint8Array> {
  const length = Number(response.headers.get("content-length") ?? "0");

  if (length > MAX_IMAGE_BYTES || !response.body) {
    await response.body?.cancel();
    throw invalid(response.body ? `画像は ${MAX_IMAGE_BYTES / 1024 / 1024}MB までです。` : "画像を受け取れませんでした。");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    total += value.byteLength;

    if (total > MAX_IMAGE_BYTES) {
      await reader.cancel();
      throw invalid(`画像は ${MAX_IMAGE_BYTES / 1024 / 1024}MB までです。`);
    }

    chunks.push(value);
  }

  const joined = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return joined;
}

async function fetchImage(rawUrl: string): Promise<{ bytes: Uint8Array; name: string }> {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw invalid("url が URL の形になっていません。");
  }

  if (url.protocol !== "https:") {
    throw invalid("url は https の公開 URL にしてください。");
  }

  let response: Response;

  try {
    // wrangler.toml の global_fetch_strictly_public により、内部アドレスには届かない
    response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch {
    throw invalid(`画像を取得できませんでした: ${url.toString()}`);
  }

  if (!response.ok) {
    await response.body?.cancel();
    throw invalid(`画像を取得できませんでした（HTTP ${response.status}）: ${url.toString()}`);
  }

  return { bytes: await readLimited(response), name: decodeURIComponent(url.pathname.split("/").pop() ?? "") };
}

/** 引数の画像を読み込み、R2 に置ける形にする */
export async function loadImage(arg: ImageArg): Promise<UploadFile> {
  if ((arg.url === undefined) === (arg.base64 === undefined)) {
    throw invalid("画像は url か base64 のどちらか一方を指定してください。");
  }

  const source = arg.url !== undefined ? await fetchImage(arg.url) : { bytes: decodeBase64(arg.base64 ?? ""), name: "" };

  if (source.bytes.byteLength === 0 || source.bytes.byteLength > MAX_IMAGE_BYTES) {
    throw invalid(`画像は 1 バイト以上 ${MAX_IMAGE_BYTES / 1024 / 1024}MB 以下にしてください。`);
  }

  const contentType = sniffImageType(source.bytes);

  if (contentType === null) {
    throw invalid("対応していない画像形式です（PNG / JPEG / GIF / WebP / AVIF のみ）。");
  }

  const base = (arg.filename ?? source.name).replace(/\.[^.]*$/u, "").replace(/[^A-Za-z0-9_-]/gu, "") || "image";
  return { bytes: source.bytes, contentType, filename: `${base}.${extensions[contentType] ?? "bin"}` };
}
