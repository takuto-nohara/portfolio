import { AdminOperationError, settingKeys, type ContextCategoryFields, type SettingsPatch } from "@/application/publicApi";

import type { JsonSchema } from "./json-schema";
import { CREATE, DESTRUCTIVE, IDEMPOTENT_WRITE, idSchema, nullableString, nullableStringArg, numberArg, ok, stringArg, WRITE_SCOPE, type McpTool } from "./tool";
import { contextCategoryView } from "./views";

/** 制作区分・お問い合わせ・サイト設定を変更するツール（portfolio:write） */

const categoryProperties: Readonly<Record<string, JsonSchema>> = {
  slug: { type: "string", minLength: 1, maxLength: 100, description: "URL に使う識別子（英小文字・数字・ハイフン）" },
  nameJa: { type: "string", minLength: 1, maxLength: 100, description: "日本語名" },
  nameEn: { type: "string", minLength: 1, maxLength: 100, description: "英語名" },
  sortOrder: { type: "integer", description: "表示順（小さいほど先）" },
};

const settingDescriptions: Record<(typeof settingKeys)[number], string> = {
  github_url: "GitHub の URL（フッターに表示）",
  contact_email: "お問い合わせの受信アドレス（Google 連携中は連携アカウントに固定）",
  gmail_from_email: "Gmail の送信元アドレス（Google 連携中は連携アカウントに固定）",
  gmail_sender_name: "Gmail の送信者名",
  gmail_subject_prefix: "お問い合わせメールの件名プレフィックス",
};

function categoryPatch(args: Record<string, unknown>): Partial<ContextCategoryFields> {
  const patch: Record<string, unknown> = {};

  for (const key of ["slug", "nameJa", "nameEn"] as const) {
    const value = stringArg(args, key);
    if (value !== undefined) patch[key] = value;
  }

  const sortOrder = numberArg(args, "sortOrder");
  if (sortOrder !== undefined) patch.sortOrder = sortOrder;

  return patch as Partial<ContextCategoryFields>;
}

function categoryId(args: Record<string, unknown>): number {
  return numberArg(args, "categoryId") ?? 0;
}

export const SITE_TOOLS: readonly McpTool[] = [
  {
    name: "create_context_category",
    title: "制作区分を追加",
    description: "制作区分（個人制作・チーム開発など、作品の文脈で分けるカテゴリ）を追加します。",
    inputSchema: {
      type: "object",
      properties: categoryProperties,
      required: ["slug", "nameJa", "nameEn"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: CREATE,
    async run({ services, args }) {
      const category = await services.admin.contextCategories.create({ slug: "", nameJa: "", nameEn: "", sortOrder: 0, ...categoryPatch(args) });
      return ok({ contextCategory: contextCategoryView(category) });
    },
  },
  {
    name: "update_context_category",
    title: "制作区分を更新",
    description: "制作区分の slug・名前・表示順を更新します。指定した項目だけが変わります。",
    inputSchema: {
      type: "object",
      properties: { categoryId: idSchema("制作区分 ID"), ...categoryProperties },
      required: ["categoryId"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: IDEMPOTENT_WRITE,
    async run({ services, args }) {
      const category = await services.admin.contextCategories.update(categoryId(args), categoryPatch(args));
      return ok({ contextCategory: contextCategoryView(category) });
    },
  },
  {
    name: "delete_context_category",
    title: "制作区分を削除",
    description: "制作区分を削除します。この区分の作品は「未設定」に戻ります。取り消せないので、必ず利用者に確認してから呼んでください。",
    inputSchema: {
      type: "object",
      properties: { categoryId: idSchema("制作区分 ID") },
      required: ["categoryId"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: DESTRUCTIVE,
    async run({ services, args }) {
      const category = await services.admin.contextCategories.delete(categoryId(args));
      return ok({ deleted: contextCategoryView(category) });
    },
  },
  {
    name: "delete_contact",
    title: "お問い合わせを削除",
    description: "お問い合わせを 1 件削除します。取り消せないので、必ず利用者に確認してから呼んでください。",
    inputSchema: {
      type: "object",
      properties: { contactId: idSchema("お問い合わせ ID（list_contacts）") },
      required: ["contactId"],
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: DESTRUCTIVE,
    async run({ services, args }) {
      const contactId = numberArg(args, "contactId") ?? 0;
      const contacts = await services.useCases.getContactList.execute();
      const contact = contacts.find((item) => item.id === contactId);

      if (!contact) {
        throw new AdminOperationError("not_found", `お問い合わせ ID ${contactId} が見つかりません。`);
      }

      await services.useCases.deleteContact.execute(contactId);
      // 書き込みだけのトークンにお問い合わせの中身（個人情報）を返さない
      return ok({ deleted: { id: contact.id } });
    },
  },
  {
    name: "update_settings",
    title: "サイト設定を更新",
    description: "サイト設定を更新します。指定した項目だけが変わります（null で空にします）。Google 連携中は contact_email と gmail_from_email が連携アカウントで上書きされます。結果は更新した項目名だけで、保存後の値は get_settings で確認してください。",
    inputSchema: {
      type: "object",
      properties: Object.fromEntries(settingKeys.map((key) => [key, nullableString(settingDescriptions[key], 500)])),
      additionalProperties: false,
    },
    scopes: WRITE_SCOPE,
    annotations: IDEMPOTENT_WRITE,
    async run({ services, args }) {
      const patch: Record<string, string | null> = {};

      for (const key of settingKeys) {
        const value = nullableStringArg(args, key);
        if (value !== undefined) patch[key] = value;
      }

      await services.admin.settings.update(patch as SettingsPatch);
      // 書き込みだけのトークンに設定値（メールアドレスなど）を返さない。保存後の値は get_settings（portfolio:read）で見る
      return ok({ updated: Object.keys(patch) });
    },
  },
];
