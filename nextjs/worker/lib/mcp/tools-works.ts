import { categories, thumbnailFits, toThumbnailFit, type Category, type ThumbnailInput, type WorkFields } from "@/application/publicApi";

import { imageSchema, loadImage, type ImageArg } from "./image-input";
import type { JsonSchema } from "./json-schema";
import {
  booleanArg,
  CREATE,
  DESTRUCTIVE,
  IDEMPOTENT_WRITE,
  idSchema,
  nullableString,
  nullableStringArg,
  numberArg,
  ok,
  stringArg,
  WRITE_SCOPE,
  type McpTool,
} from "./tool";
import { workDetail } from "./views";

/** 作品とギャラリー画像を登録・更新・削除するツール（portfolio:write） */

const workFieldProperties: Readonly<Record<string, JsonSchema>> = {
  title: { type: "string", minLength: 1, maxLength: 200, description: "作品名" },
  category: { type: "string", enum: categories, description: "媒体カテゴリ（app / web / video / graphic）" },
  description: { type: "string", minLength: 1, maxLength: 20000, description: "作品の説明（何を解決したか）" },
  contextCategoryId: { anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }], description: "制作区分 ID（list_context_categories）。null で未設定" },
  lead: nullableString("一覧に出す一言の説明", 500),
  role: nullableString("自分の担当", 1000),
  techDescription: nullableString("技術的な説明"),
  background: nullableString("制作の背景"),
  techStack: { type: "string", maxLength: 1000, description: "使った技術（カンマ区切り。例: Next.js, TypeScript）" },
  thumbnailFit: { type: "string", enum: thumbnailFits, description: "サムネイルの表示（cover: 切り抜き / contain: 全体を収める）" },
  videoUrl: nullableString("動画 URL（YouTube など。category が video のときだけ保存される）", 2048),
  url: nullableString("公開 URL", 2048),
  githubUrl: nullableString("GitHub の URL", 2048),
  publishedAt: nullableString("公開日（YYYY-MM-DD）", 40),
  isFeatured: { type: "boolean", description: "トップページの注目作品にするか" },
  sortOrder: { type: "integer", description: "表示順（小さいほど先）" },
};

const thumbnailSchema: JsonSchema = {
  ...imageSchema,
  description: "サムネイル。url か base64 で画像を渡すか、youtube: true で動画 URL（videoUrl）の YouTube サムネイルを使います。",
  properties: {
    ...imageSchema.properties,
    youtube: { type: "boolean", description: "true なら YouTube のサムネイルを使う（category が video で videoUrl があるとき）" },
  },
};

const galleryImagesSchema: JsonSchema = {
  type: "array",
  minItems: 1,
  maxItems: 10,
  description: "ギャラリーに追加する画像（最大 10 枚）",
  items: {
    type: "object",
    properties: { image: imageSchema, caption: nullableString("キャプション", 500) },
    required: ["image"],
    additionalProperties: false,
  },
};

/** 引数のうち指定された項目だけを WorkFields の形にする */
function workPatch(args: Record<string, unknown>): Partial<WorkFields> {
  const patch: Record<string, unknown> = {};
  const strings = ["title", "description", "techStack"] as const;
  const nullableStrings = ["lead", "role", "techDescription", "background", "videoUrl", "url", "githubUrl", "publishedAt"] as const;

  for (const key of strings) {
    const value = stringArg(args, key);
    if (value !== undefined) patch[key] = value;
  }

  for (const key of nullableStrings) {
    const value = nullableStringArg(args, key);
    if (value !== undefined) patch[key] = value;
  }

  if ("category" in args) patch.category = stringArg(args, "category") as Category;
  if ("contextCategoryId" in args) patch.contextCategoryId = numberArg(args, "contextCategoryId") ?? null;
  if ("thumbnailFit" in args) patch.thumbnailFit = toThumbnailFit(stringArg(args, "thumbnailFit"));
  if ("isFeatured" in args) patch.isFeatured = booleanArg(args, "isFeatured") ?? false;
  if ("sortOrder" in args) patch.sortOrder = numberArg(args, "sortOrder") ?? 0;

  return patch as Partial<WorkFields>;
}

async function thumbnailInput(value: unknown): Promise<ThumbnailInput | null> {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const arg = value as ImageArg & { readonly youtube?: boolean };

  if (arg.youtube) {
    return { source: "youtube" };
  }

  return { source: "file", file: await loadImage(arg) };
}

async function galleryImages(value: unknown) {
  const items = Array.isArray(value) ? (value as { readonly image: ImageArg; readonly caption?: string | null }[]) : [];
  return Promise.all(items.map(async (item) => ({ file: await loadImage(item.image), caption: item.caption ?? null })));
}

function workId(args: Record<string, unknown>): number {
  return numberArg(args, "workId") ?? 0;
}

export const WORK_TOOLS: readonly McpTool[] = [
  {
    name: "create_work",
    title: "作品を登録",
    description:
      "作品を新しく登録します。登録した時点で公開サイトに表示されます。title・category・description が必須です。サムネイルとギャラリー画像も同時に登録できます。",
    inputSchema: {
      type: "object",
      properties: { ...workFieldProperties, thumbnail: thumbnailSchema, images: galleryImagesSchema },
      required: ["title", "category", "description"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: CREATE,
    async run({ services, origin, args }) {
      const patch = workPatch(args);
      const fields: WorkFields = {
        title: "",
        category: "app",
        description: "",
        contextCategoryId: null,
        lead: null,
        role: null,
        techDescription: null,
        background: null,
        techStack: "",
        thumbnailFit: "contain",
        videoUrl: null,
        url: null,
        githubUrl: null,
        publishedAt: null,
        isFeatured: false,
        sortOrder: 0,
        ...patch,
      };
      const work = await services.admin.works.create(fields, {
        thumbnail: await thumbnailInput(args.thumbnail),
        images: await galleryImages(args.images),
      });

      return ok({ work: workDetail(work, origin) });
    },
  },
  {
    name: "update_work",
    title: "作品を更新",
    description: "作品の項目を更新します。指定した項目だけが変わります（null を渡すと空にできます）。サムネイルの差し替えとギャラリー画像の追加も同時にできます。",
    inputSchema: {
      type: "object",
      properties: { workId: idSchema("作品 ID"), ...workFieldProperties, thumbnail: thumbnailSchema, images: galleryImagesSchema },
      required: ["workId"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: IDEMPOTENT_WRITE,
    async run({ services, origin, args }) {
      const work = await services.admin.works.update(workId(args), workPatch(args), {
        thumbnail: await thumbnailInput(args.thumbnail),
        images: await galleryImages(args.images),
      });

      return ok({ work: workDetail(work, origin) });
    },
  },
  {
    name: "set_work_featured",
    title: "注目作品の切り替え",
    description: "作品をトップページの注目作品にする（featured: true）か、外します（false）。",
    inputSchema: {
      type: "object",
      properties: { workId: idSchema("作品 ID"), featured: { type: "boolean", description: "注目作品にするか" } },
      required: ["workId", "featured"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: IDEMPOTENT_WRITE,
    async run({ services, origin, args }) {
      const work = await services.admin.works.update(workId(args), { isFeatured: booleanArg(args, "featured") ?? false });
      return ok({ work: workDetail(work, origin) });
    },
  },
  {
    name: "set_work_thumbnail",
    title: "サムネイルを差し替え",
    description: "作品のサムネイルを差し替えます。古いサムネイル画像はストレージから削除されます。",
    inputSchema: {
      type: "object",
      properties: { workId: idSchema("作品 ID"), thumbnail: thumbnailSchema },
      required: ["workId", "thumbnail"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: IDEMPOTENT_WRITE,
    async run({ services, origin, args }) {
      const work = await services.admin.works.update(workId(args), {}, { thumbnail: await thumbnailInput(args.thumbnail) });
      return ok({ work: workDetail(work, origin) });
    },
  },
  {
    name: "add_work_images",
    title: "ギャラリー画像を追加",
    description: "作品のギャラリーに画像を追加します（末尾に並びます）。",
    inputSchema: {
      type: "object",
      properties: { workId: idSchema("作品 ID"), images: galleryImagesSchema },
      required: ["workId", "images"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: CREATE,
    async run({ services, origin, args }) {
      await services.admin.works.requireWork(workId(args));
      await services.admin.works.addImages(workId(args), await galleryImages(args.images));
      return ok({ work: workDetail(await services.admin.works.requireWork(workId(args)), origin) });
    },
  },
  {
    name: "update_work_image_caption",
    title: "画像のキャプションを更新",
    description: "ギャラリー画像のキャプションを更新します。null で空にします。",
    inputSchema: {
      type: "object",
      properties: { workId: idSchema("作品 ID"), imageId: idSchema("画像 ID（get_work の images[].id）"), caption: nullableString("キャプション", 500) },
      required: ["workId", "imageId", "caption"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: IDEMPOTENT_WRITE,
    async run({ services, args }) {
      await services.admin.works.updateImageCaption(workId(args), numberArg(args, "imageId") ?? 0, nullableStringArg(args, "caption") ?? null);
      return ok({ updated: true });
    },
  },
  {
    name: "delete_work_image",
    title: "ギャラリー画像を削除",
    description: "ギャラリー画像を削除します。画像ファイルもストレージから消え、取り消せません。必ず利用者に確認してから呼んでください。",
    inputSchema: {
      type: "object",
      properties: { workId: idSchema("作品 ID"), imageId: idSchema("画像 ID") },
      required: ["workId", "imageId"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: DESTRUCTIVE,
    async run({ services, args }) {
      const image = await services.admin.works.deleteImage(workId(args), numberArg(args, "imageId") ?? 0);
      return ok({ deleted: { id: image.id, workId: image.workId } });
    },
  },
  {
    name: "delete_work",
    title: "作品を削除",
    description: "作品を削除します。サムネイルとギャラリー画像もストレージから消え、取り消せません。必ず利用者に確認してから呼んでください。",
    inputSchema: {
      type: "object",
      properties: { workId: idSchema("作品 ID") },
      required: ["workId"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: DESTRUCTIVE,
    async run({ services, args }) {
      const work = await services.admin.works.delete(workId(args));
      return ok({ deleted: { id: work.id, title: work.title } });
    },
  },
];
