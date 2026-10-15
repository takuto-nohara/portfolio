import {
  isCategory,
  toThumbnailFit,
  type GalleryImageInput,
  type ThumbnailInput,
  type UploadFile,
  type WorkFields,
} from "@/application/publicApi";

import { getCheckbox, getFiles, getNumber, getOptionalNumber, getOptionalText, getText } from "./form-helpers";

async function toUploadFile(file: File): Promise<UploadFile> {
  return {
    bytes: await file.arrayBuffer(),
    contentType: file.type,
    filename: file.name,
  };
}

/** 作品フォームの入力を WorkFields に変換する。必須項目が欠けていれば null。 */
export function readWorkFields(formData: FormData, fallbackSortOrder = 0): WorkFields | null {
  const title = getText(formData, "title");
  const category = getText(formData, "category");
  const description = getText(formData, "description");

  if (!title || !category || !description || !isCategory(category)) {
    return null;
  }

  return {
    title,
    category,
    contextCategoryId: getOptionalNumber(formData, "context_category_id"),
    lead: getOptionalText(formData, "lead"),
    role: getOptionalText(formData, "role"),
    description,
    techDescription: getOptionalText(formData, "tech_description"),
    background: getOptionalText(formData, "background"),
    techStack: getOptionalText(formData, "tech_stack") ?? "",
    thumbnailFit: toThumbnailFit(getOptionalText(formData, "thumbnail_fit")),
    videoUrl: getOptionalText(formData, "video_url"),
    url: getOptionalText(formData, "url"),
    githubUrl: getOptionalText(formData, "github_url"),
    publishedAt: getOptionalText(formData, "published_at"),
    isFeatured: getCheckbox(formData, "is_featured"),
    sortOrder: getText(formData, "sort_order") ? getNumber(formData, "sort_order") : fallbackSortOrder,
  };
}

/** サムネイル欄の入力。YouTube 指定は映像カテゴリで動画 URL があるときだけ有効。 */
export async function readThumbnailInput(formData: FormData, fields: WorkFields): Promise<ThumbnailInput | null> {
  const source = getOptionalText(formData, "thumbnail_source") ?? "upload";
  const file = getFiles(formData, "thumbnail")[0];

  if (source === "youtube") {
    return fields.category === "video" && fields.videoUrl ? { source: "youtube" } : null;
  }

  return file ? { source: "file", file: await toUploadFile(file) } : null;
}

export function readGalleryImages(formData: FormData): Promise<GalleryImageInput[]> {
  return Promise.all(getFiles(formData, "images").map(async (file) => ({ file: await toUploadFile(file) })));
}
