import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminOperationError } from "@/application/publicApi";

import { loadImage } from "./image-input";

// 1x1 の PNG
const PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const PNG_BYTES = Uint8Array.from(atob(PNG_BASE64), (char) => char.charCodeAt(0));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadImage（base64）", () => {
  it("中身から形式を判定し、拡張子を付け直す", async () => {
    const file = await loadImage({ base64: PNG_BASE64, filename: "../thumb.jpeg" });
    expect(file.contentType).toBe("image/png");
    expect(file.filename).toBe("thumb.png");
    expect(file.bytes.byteLength).toBe(PNG_BYTES.byteLength);
  });

  it("data URL も受ける", async () => {
    const file = await loadImage({ base64: `data:image/png;base64,${PNG_BASE64}` });
    expect(file.contentType).toBe("image/png");
    expect(file.filename).toBe("image.png");
  });

  it("画像でないもの（SVG を含む）は受けない", async () => {
    await expect(loadImage({ base64: btoa("<svg xmlns='http://www.w3.org/2000/svg'></svg>") })).rejects.toThrowError(AdminOperationError);
    await expect(loadImage({ base64: "%%%" })).rejects.toThrowError("base64 として読めませんでした。");
  });

  it("url と base64 はどちらか一方だけ", async () => {
    await expect(loadImage({})).rejects.toThrowError("どちらか一方");
    await expect(loadImage({ url: "https://example.com/a.png", base64: PNG_BASE64 })).rejects.toThrowError("どちらか一方");
  });
});

describe("loadImage（url）", () => {
  it("https の URL を取りに行く", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(PNG_BYTES, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const file = await loadImage({ url: "https://example.com/images/%E4%BD%9C%E5%93%81.png" });
    expect(file.contentType).toBe("image/png");
    expect(file.filename).toBe("image.png");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("http は取りに行かない", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadImage({ url: "http://127.0.0.1/a.png" })).rejects.toThrowError("https");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("取得に失敗したら理由を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not found", { status: 404 })));
    await expect(loadImage({ url: "https://example.com/a.png" })).rejects.toThrowError("HTTP 404");
  });

  it("10MB を超える画像は受けない", async () => {
    const big = new Response(new Uint8Array(1), { status: 200, headers: { "content-length": String(11 * 1024 * 1024) } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(big));
    await expect(loadImage({ url: "https://example.com/a.png" })).rejects.toThrowError("10MB");
  });
});
