/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";

import { categories, extractYouTubeVideoId, getMediumCategoryDefinition, thumbnailFits, type ThumbnailFit, type Work, type WorkContextCategory } from "@/application/publicApi";
import { resolveWorkAssetUrl } from "@/presentation/lib/work-assets";

import { AdminIcon } from "../AdminIcon";
import { adminInput, adminMonoInput, adminPill, adminTextarea } from "../adminStyles";
import { WorkFormAside } from "./WorkFormAside";
import { Field, WorkFormSection } from "./WorkFormSection";
import { WorkGalleryEditor, WorkGalleryForms } from "./WorkGalleryEditor";

interface AdminWorkFormProps {
  readonly contextCategories: readonly WorkContextCategory[];
  readonly work?: Work;
}

const WORK_FORM_ID = "work-form";
const LEAD_LIMIT = 60;

const sections = [
  ["f-basic", "基本情報"],
  ["f-body", "本文"],
  ["f-media", "メディア"],
  ["f-links", "リンク"],
  ["f-publish", "公開設定"],
] as const;

const fitHints: Record<ThumbnailFit, string> = { cover: "枠いっぱい", contain: "全体を表示" };

function toDateInputValue(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.includes("T") ? value.split("T")[0] : value.split(" ")[0];
}

function splitStack(value: string): string[] {
  return value
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);
}

export function AdminWorkForm({ contextCategories, work }: AdminWorkFormProps) {
  const isEditing = work !== undefined && work.id !== null;
  const [title, setTitle] = useState(work?.title ?? "");
  const [category, setCategory] = useState<string>(work?.category ?? "web");
  const [lead, setLead] = useState(work?.lead ?? "");
  const [stack, setStack] = useState<string[]>(splitStack(work?.techStack ?? ""));
  const [stackDraft, setStackDraft] = useState("");
  const [fit, setFit] = useState<ThumbnailFit>(work?.thumbnailFit ?? "contain");
  const [featured, setFeatured] = useState(work?.isFeatured ?? false);
  const [publishedAt, setPublishedAt] = useState(toDateInputValue(work?.publishedAt ?? null));
  const [youtubeUrl, setYoutubeUrl] = useState(work?.videoUrl ?? "");
  const [thumbnailSource, setThumbnailSource] = useState<"youtube" | "upload">(work?.thumbnail?.startsWith("https://img.youtube.com/") ? "youtube" : "upload");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => () => (uploadPreview ? URL.revokeObjectURL(uploadPreview) : undefined), [uploadPreview]);

  const isVideo = category === "video";
  const youtubeVideoId = isVideo ? extractYouTubeVideoId(youtubeUrl) : null;
  const useYoutubeThumbnail = isVideo && youtubeVideoId !== null && thumbnailSource === "youtube";
  const thumbnailPreview = useYoutubeThumbnail
    ? `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`
    : (uploadPreview ?? resolveWorkAssetUrl(work?.thumbnail ?? null));

  const addStack = () => {
    const additions = splitStack(stackDraft).filter((tech) => !stack.includes(tech));
    if (additions.length > 0) {
      setStack((current) => [...current, ...additions]);
    }
    setStackDraft("");
  };

  const onStackKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === "Enter" || event.key === ",") && !event.nativeEvent.isComposing) {
      event.preventDefault();
      addStack();
    } else if (event.key === "Backspace" && stackDraft === "" && stack.length > 0) {
      setStack((current) => current.slice(0, -1));
    }
  };

  return (
    <>
      <Link href="/admin/works" className="inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-ink-body hover:text-link">
        <AdminIcon name="chevron-left" className="h-4 w-4" />
        作品一覧
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line-strong pt-2 pb-5">
        <div className="min-w-0">
          <p className="m-0 font-mono text-[13px] tracking-[0.06em] text-link">
            <span className="text-sky">$</span> {isEditing ? `vim works/${work.id}` : "touch works/new"}
          </p>
          <h1 className="mt-1.5 mb-0 font-serif text-[28px] leading-[1.35] font-semibold tracking-[0.05em]">{isEditing ? "作品を編集" : "新しい作品"}</h1>
        </div>
        <nav aria-label="フォームのセクション" className="flex flex-wrap gap-1.5">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="inline-flex min-h-8 items-center rounded-full border border-line bg-white px-3 text-xs font-bold text-ink-body hover:border-sky hover:text-link">
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-2 flex flex-wrap items-start gap-x-10 gap-y-4">
        <form id={WORK_FORM_ID} action={isEditing ? `/api/admin/works/${work.id}` : "/api/admin/works"} method="post" encType="multipart/form-data" className="grid min-w-0 flex-[999_1_480px]">
          {isEditing ? <input type="hidden" name="intent" value="update" /> : null}
          {/* 入力途中の技術名も取りこぼさないよう、確定前の下書きも含めて送る */}
          <input type="hidden" name="tech_stack" value={[...stack, ...splitStack(stackDraft).filter((tech) => !stack.includes(tech))].join(", ")} />

          <WorkFormSection id="f-basic" index="01" title="基本情報" description="一覧とトップに出る情報です。">
            <Field id="title" label="タイトル" required>
              <input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} required className={`${adminInput} h-[46px] px-3.5 text-[15px]`} />
            </Field>
            <fieldset className="m-0 grid gap-1.5 border-0 p-0">
              <legend className="mb-1.5 p-0 text-[13px] font-bold">
                表示媒体<span className="ml-1 font-normal text-red-700">必須</span>
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((option) => {
                  const definition = getMediumCategoryDefinition(option);
                  return (
                    <label key={option} className={`${adminPill(category === option)} h-10 px-4 focus-within:ring-2 focus-within:ring-link focus-within:ring-offset-2`}>
                      <input type="radio" name="category" value={option} checked={category === option} onChange={() => setCategory(option)} required className="sr-only" />
                      {definition.nameJa}
                      <span className="font-mono text-[11px] font-normal opacity-75">{definition.nameEn}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <Field
              id="context_category_id"
              label="文脈カテゴリ"
              hint="公開サイトの「作品一覧」で見出しごとにまとまります。"
              action={
                <Link href="/admin/categories" className="text-xs font-bold text-link">
                  カテゴリを管理
                </Link>
              }
            >
              <select id="context_category_id" name="context_category_id" defaultValue={work?.contextCategoryId != null ? String(work.contextCategoryId) : ""} className={adminInput}>
                <option value="">未分類</option>
                {contextCategories.map((contextCategory) => (
                  <option key={contextCategory.id} value={String(contextCategory.id)}>{`${contextCategory.nameJa} / ${contextCategory.nameEn}`}</option>
                ))}
              </select>
            </Field>
            <Field
              id="lead"
              label="一行リード"
              hint={
                <span className="flex justify-between gap-3">
                  <span>一覧・トップ・詳細の冒頭に表示されます。</span>
                  <span className={`font-mono ${lead.length > LEAD_LIMIT ? "text-red-700" : ""}`}>{`${lead.length}/${LEAD_LIMIT}`}</span>
                </span>
              }
            >
              <input id="lead" name="lead" value={lead} onChange={(event) => setLead(event.target.value)} placeholder="何を解決したかを一文で" className={`${adminInput} h-[46px] px-3.5`} />
            </Field>
            <Field id="role" label="担当範囲">
              <input id="role" name="role" defaultValue={work?.role ?? ""} placeholder="フロント・バックエンド / PM（3人チーム）" className={`${adminInput} h-[46px] px-3.5`} />
            </Field>
          </WorkFormSection>

          <WorkFormSection id="f-body" index="02" title="本文" description="作品詳細ページの本文になります。">
            <Field id="description" label="作品概要" required>
              <textarea id="description" name="description" rows={5} defaultValue={work?.description ?? ""} required className={adminTextarea} />
            </Field>
            <Field id="tech_description" label="技術概要">
              <textarea id="tech_description" name="tech_description" rows={4} defaultValue={work?.techDescription ?? ""} className={adminTextarea} />
            </Field>
            <Field id="background" label="作成背景">
              <textarea id="background" name="background" rows={4} defaultValue={work?.background ?? ""} placeholder="なぜ作ったか、どんな課題があったか" className={adminTextarea} />
            </Field>
            <Field id="tech-stack-input" label="技術スタック" hint="Enter またはカンマで追加します。">
              <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded border border-line-strong bg-white px-2 py-1.5 focus-within:border-link focus-within:shadow-[0_0_0_3px_rgba(3,105,161,0.15)]">
                {stack.map((tech) => (
                  <span key={tech} className="inline-flex h-7 items-center gap-1 rounded-full bg-panel pr-1.5 pl-2.5 font-mono text-xs text-ink-body">
                    {tech}
                    <button
                      type="button"
                      onClick={() => setStack((current) => current.filter((item) => item !== tech))}
                      aria-label={`${tech} を外す`}
                      className="grid h-5 w-5 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink-muted hover:bg-sky-soft hover:text-link"
                    >
                      <AdminIcon name="x" className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  id="tech-stack-input"
                  value={stackDraft}
                  onChange={(event) => setStackDraft(event.target.value)}
                  onKeyDown={onStackKeyDown}
                  onBlur={addStack}
                  placeholder="追加して Enter"
                  className="h-[30px] min-w-[120px] flex-1 border-0 bg-transparent font-mono text-xs outline-none"
                />
              </div>
            </Field>
          </WorkFormSection>

          <WorkFormSection id="f-media" index="03" title="メディア" description="サムネイルとギャラリー画像。">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] items-start gap-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2px] border border-line bg-[repeating-linear-gradient(135deg,#e0f2fe_0_8px,#eef7fd_8px_16px)]">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="サムネイルのプレビュー" className={`absolute inset-0 h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
                ) : (
                  <span className="absolute inset-0 grid place-items-center font-mono text-[11px] text-ink-muted">thumbnail</span>
                )}
              </div>
              <div className="grid gap-2.5">
                {isVideo && youtubeVideoId ? (
                  <div role="radiogroup" aria-label="サムネイルの取得元" className="flex flex-wrap gap-1.5">
                    {(["youtube", "upload"] as const).map((source) => (
                      <label key={source} className={`${adminPill(thumbnailSource === source)} h-8 px-3 text-xs focus-within:ring-2 focus-within:ring-link`}>
                        <input type="radio" name="thumbnail_source" value={source} checked={thumbnailSource === source} onChange={() => setThumbnailSource(source)} className="sr-only" />
                        {source === "youtube" ? "YouTube の画像" : "アップロード"}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input type="hidden" name="thumbnail_source" value="upload" />
                )}
                {useYoutubeThumbnail ? <p className="m-0 text-xs text-ink-muted">動画のサムネイルを自動で使います。</p> : null}
                {/* 取得元を切り替えても選択済みのファイルを失わないよう、入力欄は常にマウントしておく */}
                <label
                  hidden={useYoutubeThumbnail}
                  className="flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-[rgba(12,74,110,0.3)] bg-white px-3 text-center text-[13px] text-ink-body transition-colors focus-within:border-sky hover:border-sky hover:bg-[#f5fbff] hover:text-link">
                  <AdminIcon name="upload" />
                  {uploadPreview ? "別の画像を選ぶ" : isEditing && work.thumbnail ? "画像を差し替える" : "クリックして画像を選択"}
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setUploadPreview(file ? URL.createObjectURL(file) : null);
                    }}
                    className="sr-only"
                  />
                </label>
                <div role="radiogroup" aria-label="サムネイルの表示方法" className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-bold text-ink-body">表示方法</span>
                  {thumbnailFits.map((option) => (
                    <label key={option} title={fitHints[option]} className={`${adminPill(fit === option)} h-8 px-3 font-mono text-xs font-normal focus-within:ring-2 focus-within:ring-link`}>
                      <input type="radio" name="thumbnail_fit" value={option} checked={fit === option} onChange={() => setFit(option)} className="sr-only" />
                      {option}
                      <span className="sr-only">（{fitHints[option]}）</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <WorkGalleryEditor work={work} workFormId={WORK_FORM_ID} />
          </WorkFormSection>

          <WorkFormSection id="f-links" index="04" title="リンク">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[18px]">
              <Field id="url" label="公開 URL">
                <input id="url" type="url" name="url" defaultValue={work?.url ?? ""} placeholder="https://" className={adminMonoInput} />
              </Field>
              <Field id="github_url" label="GitHub URL">
                <input id="github_url" type="url" name="github_url" defaultValue={work?.githubUrl ?? ""} placeholder="https://github.com/…" className={adminMonoInput} />
              </Field>
              {isVideo ? (
                <Field id="video_url" label="YouTube URL" hint="入力するとサムネイルに YouTube の画像を使えます。" className="col-span-full">
                  <input id="video_url" type="url" name="video_url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={adminMonoInput} />
                </Field>
              ) : null}
            </div>
          </WorkFormSection>

          <WorkFormSection id="f-publish" index="05" title="公開設定" last>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] items-start gap-[18px]">
              <Field id="published_at" label="公開日">
                <input id="published_at" type="date" name="published_at" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} className={adminInput} />
              </Field>
              <Field id="sort_order" label="表示順" hint="小さいほど上に表示されます。">
                <input id="sort_order" type="number" name="sort_order" defaultValue={work?.sortOrder ?? 0} className={adminMonoInput} />
              </Field>
              <label className="col-span-full flex min-h-[60px] cursor-pointer items-center justify-between gap-4 rounded border border-line bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-link">
                <span>
                  <span className="block text-sm font-bold">トップページに掲載</span>
                  <span className="block text-xs text-ink-muted">「まず見てほしい作品」に表示します。</span>
                </span>
                <input type="checkbox" role="switch" name="is_featured" value="1" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="peer sr-only" />
                <span aria-hidden="true" className={`relative h-[26px] w-11 shrink-0 rounded-full transition-colors ${featured ? "bg-link" : "bg-[rgba(12,74,110,0.22)]"}`}>
                  <span className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(12,31,46,0.3)] transition-[left] ${featured ? "left-[21px]" : "left-[3px]"}`} />
                </span>
              </label>
            </div>
          </WorkFormSection>
        </form>

        <WorkFormAside
          formId={WORK_FORM_ID}
          work={work}
          title={title}
          lead={lead}
          category={category}
          year={publishedAt.slice(0, 4)}
          stack={stack}
          fit={fit}
          thumbnailPreview={thumbnailPreview}
        />
      </div>

      <WorkGalleryForms work={work} />
    </>
  );
}
