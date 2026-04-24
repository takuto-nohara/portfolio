"use client";

import Link from "next/link";
import { useState } from "react";

import type { Work } from "@/domain/publicApi";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

interface AdminWorkFormProps {
  readonly mode: "create" | "edit";
  readonly work?: Work;
  readonly status?: string;
}

function toDateInputValue(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.includes("T") ? value.split("T")[0] : value.split(" ")[0];
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const match = parsed.pathname.match(/\/(embed|shorts|v)\/([^/?]+)/);
      if (match) return match[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function AdminWorkForm({ mode, work, status }: AdminWorkFormProps) {
  const isEditing = mode === "edit" && work;
  const action = isEditing ? `/api/admin/works/${work.id}` : "/api/admin/works";

  const [category, setCategory] = useState(work?.category ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(work?.videoUrl ?? "");
  const [thumbnailSource, setThumbnailSource] = useState<"youtube" | "upload">(
    work?.thumbnail?.startsWith("https://img.youtube.com/") ? "youtube" : "upload",
  );

  const isVideo = category === "video";
  const youtubeVideoId = isVideo ? extractYouTubeVideoId(youtubeUrl) : null;
  const youtubeThumbnailPreview = youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg` : null;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/works" className="mb-6 inline-block text-xs text-accent-primary transition-colors hover:text-accent-secondary">
        {"< back_to_list"}
      </Link>

      {status === "updated" || status === "created" ? (
        <div className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {status === "created" ? "作品を作成しました。" : "作品を更新しました。"}
        </div>
      ) : null}

      {status === "caption-saved" ? (
        <div className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">画像キャプションを更新しました。</div>
      ) : null}

      {status === "image-deleted" ? (
        <div className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">画像を削除しました。</div>
      ) : null}

      {status === "error" ? (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">保存に失敗しました。入力内容を確認してください。</div>
      ) : null}

      <div className="rounded-lg border border-border-subtle bg-surface-primary p-8">
        <form action={action} method="post" encType="multipart/form-data" className="space-y-6">
          {isEditing ? <input type="hidden" name="intent" value="update" /> : null}

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-foreground-primary">{"> title"}</label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={work?.title ?? ""}
              required
              className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-foreground-primary">{"> category"}</label>
            <select
              id="category"
              name="category"
              defaultValue={work?.category ?? ""}
              required
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            >
              <option value="">select_category</option>
              <option value="app">output.app</option>
              <option value="web">output.web</option>
              <option value="video">output.video</option>
              <option value="graphic">output.graphic</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground-primary">{"> description"}</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={work?.description ?? ""}
              required
              className="w-full resize-none rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          <div>
            <label htmlFor="tech_stack" className="mb-2 block text-sm font-medium text-foreground-primary">{"> tech_stack"}</label>
            <input
              type="text"
              id="tech_stack"
              name="tech_stack"
              defaultValue={work?.techStack ?? ""}
              placeholder="PHP, Laravel, Tailwind CSS"
              className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {isVideo ? (
              <div className="col-span-2">
                <label htmlFor="video_url" className="mb-2 block text-sm font-medium text-foreground-primary">{"> video_url (YouTube)"}</label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
                <p className="mt-2 text-xs text-foreground-muted">YouTube の動画 URL を入力してください。</p>
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-primary">{"> thumbnail"}</label>

              {isVideo && youtubeVideoId ? (
                <div className="mb-3 flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="thumbnail_source"
                      value="youtube"
                      checked={thumbnailSource === "youtube"}
                      onChange={() => setThumbnailSource("youtube")}
                      className="accent-accent-primary"
                    />
                    <span className="text-xs text-foreground-secondary">YouTube サムネイルを使用</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="thumbnail_source"
                      value="upload"
                      checked={thumbnailSource === "upload"}
                      onChange={() => setThumbnailSource("upload")}
                      className="accent-accent-primary"
                    />
                    <span className="text-xs text-foreground-secondary">自分でアップロード</span>
                  </label>
                </div>
              ) : (
                <input type="hidden" name="thumbnail_source" value="upload" />
              )}

              {isVideo && youtubeVideoId && thumbnailSource === "youtube" ? (
                <div className="mt-2">
                  <input type="hidden" name="thumbnail_source" value="youtube" />
                  {youtubeThumbnailPreview ? (
                    <img
                      src={youtubeThumbnailPreview}
                      alt="YouTube thumbnail preview"
                      className="h-20 w-32 rounded border border-border-subtle object-cover"
                    />
                  ) : null}
                  <p className="mt-2 text-xs text-foreground-muted">動画のサムネイルを自動取得します。</p>
                </div>
              ) : (
                <>
                  {isVideo && youtubeVideoId ? <input type="hidden" name="thumbnail_source" value="upload" /> : null}
                  <input
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary file:mr-4 file:border-0 file:bg-accent-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-surface-primary"
                  />
                  <p className="mt-2 text-xs text-foreground-muted">一覧と詳細のメイン画像になります。</p>
                </>
              )}

              {work?.thumbnail ? (
                <div className="mt-3 flex items-center gap-3">
                  {resolveWorkAssetUrl(work.thumbnail) ? (
                    <img
                      src={resolveWorkAssetUrl(work.thumbnail) ?? undefined}
                      alt={work.title}
                      className="h-20 w-20 rounded border border-border-subtle object-cover"
                    />
                  ) : null}
                  <span className="break-all text-xs text-foreground-muted">{work.thumbnail}</span>
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="url" className="mb-2 block text-sm font-medium text-foreground-primary">{"> url"}</label>
              <input
                type="url"
                id="url"
                name="url"
                defaultValue={work?.url ?? ""}
                className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label htmlFor="github_url" className="mb-2 block text-sm font-medium text-foreground-primary">{"> github_url"}</label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                defaultValue={work?.githubUrl ?? ""}
                className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label htmlFor="published_at" className="mb-2 block text-sm font-medium text-foreground-primary">{"> published_at"}</label>
              <input
                type="date"
                id="published_at"
                name="published_at"
                defaultValue={toDateInputValue(work?.publishedAt ?? null)}
                className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-primary">{"> is_featured"}</label>
              <div className="flex h-11 items-center gap-3">
                <input type="checkbox" id="is_featured" name="is_featured" value="1" defaultChecked={work?.isFeatured ?? false} className="h-4 w-4 accent-accent-primary" />
                <label htmlFor="is_featured" className="text-sm text-foreground-secondary">トップに表示</label>
              </div>
            </div>

            <div>
              <label htmlFor="sort_order" className="mb-2 block text-sm font-medium text-foreground-primary">{"> sort_order"}</label>
              <input
                type="number"
                id="sort_order"
                name="sort_order"
                defaultValue={work?.sortOrder ?? 0}
                className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="images" className="mb-2 block text-sm font-medium text-foreground-primary">
              {isEditing ? "> add_gallery_images" : "> gallery_images"}
            </label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              className="w-full rounded border border-border-subtle bg-surface-secondary px-4 py-3 text-sm text-foreground-primary file:mr-4 file:border-0 file:bg-accent-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-surface-primary"
            />
            <p className="mt-2 text-xs text-foreground-muted">Ctrl/Cmd を押しながらクリックで複数選択できます。</p>
          </div>

          <div className="pt-4">
            <button type="submit" className="rounded bg-accent-primary px-8 py-3 text-sm font-medium text-surface-primary transition-colors hover:bg-accent-secondary">
              {isEditing ? "> update_work" : "> create_work"}
            </button>
          </div>
        </form>

        {isEditing ? (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-foreground-primary">{"> current_gallery"}</h2>

            {work.images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {work.images.map((image) => (
                  <div key={image.id ?? image.imagePath} className="space-y-3 rounded-lg border border-border-subtle bg-surface-secondary p-4">
                    {resolveWorkAssetUrl(image.imagePath) ? (
                      <img
                        src={resolveWorkAssetUrl(image.imagePath) ?? undefined}
                        alt={`${work.title} gallery image`}
                        className="aspect-video w-full rounded object-cover"
                      />
                    ) : null}

                    <form action={`/api/admin/works/${work.id}/images/${image.id}`} method="post" className="space-y-3">
                      <input type="hidden" name="intent" value="update-caption" />
                      <div>
                        <label htmlFor={`caption-${image.id}`} className="mb-2 block text-xs font-medium text-foreground-primary">
                          caption
                        </label>
                        <input
                          type="text"
                          id={`caption-${image.id}`}
                          name="caption"
                          defaultValue={image.caption ?? ""}
                          placeholder="画像説明を入力"
                          className="w-full rounded border border-border-subtle bg-surface-primary px-3 py-2 text-xs text-foreground-primary transition-colors focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-foreground-muted">{`order: ${image.sortOrder}`}</span>
                        <button type="submit" className="text-xs text-accent-primary transition-colors hover:text-accent-secondary">
                          save_caption
                        </button>
                      </div>
                    </form>

                    <form action={`/api/admin/works/${work.id}/images/${image.id}`} method="post" className="flex justify-end">
                      <input type="hidden" name="intent" value="delete-image" />
                      <button type="submit" className="text-xs text-red-500 transition-colors hover:text-red-700">
                        delete_image
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-foreground-muted">gallery_images_not_found</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}