import { categories, isCategory } from "@/application/publicApi";
import { experiences, siteProfile, skills } from "@/presentation/content/siteContent";

import { booleanArg, idSchema, numberArg, ok, READ_ONLY, READ_SCOPE, stringArg, type McpTool } from "./tool";
import { contextCategoryView, workDetail, workSummary } from "./views";

/** 参照だけのツール（portfolio:read） */
export const READ_TOOLS: readonly McpTool[] = [
  {
    name: "get_site_overview",
    title: "サイトの概要",
    description:
      "ポートフォリオサイトの全体像を返します。プロフィール・スキル・経歴（コード内の固定値で、MCP からは編集できません）、公開設定、作品・制作区分・お問い合わせの件数、媒体カテゴリの一覧。最初に呼んでください。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    scopes: READ_SCOPE,
    annotations: READ_ONLY,
    async run({ services, origin }) {
      const [works, contextCategories, contacts, publicSettings] = await Promise.all([
        services.useCases.getWorkList.execute(null),
        services.useCases.getWorkContextCategoryList.execute(),
        services.useCases.getContactList.execute(),
        services.useCases.getPublicSettings.execute(),
      ]);

      return ok({
        siteUrl: origin,
        profile: siteProfile,
        skills,
        experiences,
        publicSettings,
        mediumCategories: categories,
        contextCategories: contextCategories.map(contextCategoryView),
        counts: {
          works: works.length,
          featuredWorks: works.filter((work) => work.isFeatured).length,
          contacts: contacts.length,
        },
      });
    },
  },
  {
    name: "list_works",
    title: "作品の一覧",
    description:
      "作品の一覧（概要）を表示順で返します。category（媒体: app / web / video / graphic）、contextSlug（制作区分の slug。未設定は \"unassigned\"）、featured（注目作品だけ）で絞り込めます。詳細は get_work で取得してください。",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: categories, description: "媒体カテゴリ" },
        contextSlug: { type: "string", maxLength: 100, description: "制作区分の slug（未設定の作品は unassigned）" },
        featured: { type: "boolean", description: "true なら注目作品だけ" },
      },
      additionalProperties: false,
    },
    scopes: READ_SCOPE,
    annotations: READ_ONLY,
    async run({ services, origin, args }) {
      const category = stringArg(args, "category");
      const contextSlug = stringArg(args, "contextSlug");
      let works = await services.useCases.getWorkList.execute(category && isCategory(category) ? category : null);

      if (contextSlug) {
        works = works.filter((work) => (contextSlug === "unassigned" ? work.contextCategoryId === null : work.contextCategorySlug === contextSlug));
      }

      if (booleanArg(args, "featured")) {
        works = works.filter((work) => work.isFeatured);
      }

      return ok({ works: works.map((work) => workSummary(work, origin)) });
    },
  },
  {
    name: "get_work",
    title: "作品の詳細",
    description: "作品 1 件の全項目とギャラリー画像（id・URL・キャプション）を返します。",
    inputSchema: {
      type: "object",
      properties: { workId: idSchema("作品 ID") },
      required: ["workId"],
      additionalProperties: false,
    },
    scopes: READ_SCOPE,
    annotations: READ_ONLY,
    async run({ services, origin, args }) {
      const work = await services.admin.works.requireWork(numberArg(args, "workId") ?? 0);
      return ok({ work: workDetail(work, origin) });
    },
  },
  {
    name: "list_context_categories",
    title: "制作区分の一覧",
    description: "制作区分（個人制作・チーム開発など、作品の文脈で分けるカテゴリ）を表示順で返します。作品の contextCategoryId にはここの id を指定します。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    scopes: READ_SCOPE,
    annotations: READ_ONLY,
    async run({ services }) {
      const contextCategories = await services.useCases.getWorkContextCategoryList.execute();
      return ok({ contextCategories: contextCategories.map(contextCategoryView) });
    },
  },
  {
    name: "list_contacts",
    title: "お問い合わせの一覧",
    description: "サイトのお問い合わせフォームから届いたメッセージを新しい順で返します。個人情報を含むので、必要な範囲だけ利用者に伝えてください。",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "integer", minimum: 1, maximum: 200, description: "返す件数（既定 50）" } },
      additionalProperties: false,
    },
    scopes: READ_SCOPE,
    annotations: READ_ONLY,
    async run({ services, args }) {
      const contacts = await services.useCases.getContactList.execute();
      const limit = numberArg(args, "limit") ?? 50;
      return ok({ total: contacts.length, contacts: contacts.slice(0, limit) });
    },
  },
  {
    name: "get_settings",
    title: "サイト設定",
    description:
      "サイト設定（GitHub URL、お問い合わせの受信アドレス、Gmail の送信元・送信者名・件名プレフィックス）と Google 連携の状態を返します。Google 連携中は受信アドレスと送信元が連携アカウントに固定されます。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    scopes: READ_SCOPE,
    annotations: READ_ONLY,
    async run({ services }) {
      const { values, googleLinkedEmail } = await services.admin.settings.get();
      return ok({ settings: values, googleLinked: googleLinkedEmail !== null, googleLinkedEmail });
    },
  },
];
