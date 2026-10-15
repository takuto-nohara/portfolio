// サイト全体の文言・プロフィール。
// 改行位置は持たない。見出しは splitPhrases() で句読点ごとに文節化し、幅に応じて折り返す。

export const siteNavigationItems = [
  { href: "/works", label: "作品" },
  { href: "/about", label: "自己紹介" },
  { href: "/contact", label: "連絡" },
] as const;

export const siteProfile = {
  nameJa: "野原 拓人",
  nameEn: "Takuto Nohara",
  nameKana: "のはら たくと",
  roleJa: "ソフトウェアエンジニア志望 / 大学生",
  affiliation: "工学院大学 在学",
  command: "$ render --profile takuto",
  catchCopy: "欲しいものがないなら、自分で作ってしまえ。",
  lead: "企画から設計・実装・運用までを一人で通し、アプリ・Web・映像・紙を横断して「動いて触れる形」にするのが得意です。",
  portrait: "/images/profile/portrait.jpg",
  portraitAlt: "野原拓人のポートレート",
  facts: [
    { label: "現在", value: "工学院大学 在学 / 株式会社 Zequt 創業初期エンジニア" },
    { label: "得意", value: "TypeScript / React / Next.js / Cloudflare（Workers・D1・R2）" },
    { label: "ほかに", value: "映像編集（DaVinci Resolve）、紙面デザイン（Affinity）" },
    { label: "姿勢", value: "設計意図まで説明できる成果物をつくる" },
  ],
  aboutTitle: "映像から始まり、いまはアプリ開発を軸に。",
  aboutSummary:
    "中学生のころに動画編集でものづくりに入り、パンフレット、Web、アプリへと領域を広げてきました。コードを書くことは、頭の中のアイデアを動いて触れる形へレンダリングすること。その過程そのものが好きです。",
  aboutParagraphs: [
    "中学生のころ、動画編集をきっかけにコンテンツ制作の世界に入りました。映像から始まり、パンフレット、Web、そしてアプリケーション開発へと領域を広げています。",
    "「欲しいものが見当たらないなら自分で作ってしまえ」という姿勢で、幅広いアウトプットに挑戦してきました。現在はフロントエンドからバックエンドまで、Web アプリケーション開発を軸に学習を深めています。",
    "コードを書くことは、頭の中のアイデアを実際に動いて触れる形へレンダリングすること。その過程自体に強い面白さを感じています。",
  ],
} as const;

export const siteSections = {
  worksHeading: "まず見てほしい作品",
  worksAll: "すべての作品",
  worksPageLead: "媒体で絞り込めます。どの作品も、何を解決したか・自分が何を担当したかを先に書いています。",
  aboutMore: "経歴とスキルを見る",
  contactTitle: "採用・制作のご相談は、メールかフォームから。",
  contactPageLead: "採用・インターン、制作のご相談はメールが最も早く届きます。フォームからも同じ宛先に届きます。",
  contactSent: "送信しました。ありがとうございます。2〜3日以内に返信します。",
  skillsHeading: "使える技術",
  experienceHeading: "これまでの流れ",
} as const;

export const skills = [
  { titleJa: "言語", items: ["TypeScript", "JavaScript", "PHP", "HTML・CSS", "Java", "C"] },
  { titleJa: "フレームワーク", items: ["React", "Next.js", "Angular", "Laravel", "Hono", "Tailwind CSS", "Vite", "Vitest"] },
  { titleJa: "基盤・運用", items: ["Cloudflare（Workers・D1・R2）", "Firebase", "Docker", "Stripe"] },
  { titleJa: "ツール", items: ["Git・GitHub", "VS Code", "ESLint", "Figma", "Pencil", "DaVinci Resolve", "Affinity"] },
] as const;

interface ExperienceItem {
  readonly date: string;
  readonly title: string;
  readonly description: string;
  readonly href?: string;
  readonly label?: string;
}

export const experiences: readonly ExperienceItem[] = [
  {
    date: "2026.04",
    title: "学園祭実行委員会 紹介サイトを新設",
    description:
      "工学院大学・学園祭実行委員会の紹介サイトを設計・公開。Cloudflare D1 / R2 を組み合わせた疑似 CMS 構成で、独自ドメイン取得から保守・運用まで一人で担当。",
    href: "https://www.kute-fes.com/",
    label: "kute-fes.com",
  },
  {
    date: "2025.12",
    title: "株式会社 Zequt に創業初期エンジニアとして参加",
    description: "友人の創業した会社に加わり、Web アプリ開発、ホームページ制作、パンフレットデザインを担当。",
  },
  {
    date: "2025.10",
    title: "Web アプリ開発 / VTuber チームリーダー",
    description:
      "工学院大学 VR プロジェクトの運営効率化のため、TypeScript / React / Tailwind CSS でタスク管理ツールを独学で開発・公開。並行して複数のアプリと広報動画を制作。",
  },
  {
    date: "2025.08",
    title: "学園祭サイトを制作・公開（初の Web サイト）",
    description: "学園祭情報をまとめるサイトを HTML / CSS / JavaScript で制作・公開。独学ながら初めて実際にリリースしたプロジェクト。",
    href: "https://www.ns.kogakuin.ac.jp/hachisai/2025/",
    label: "hachisai 2025",
  },
  {
    date: "2024.04",
    title: "大学入学 — プログラミング初体験",
    description: "大学の授業で C 言語に初めて触れ、プログラミングの基礎を習得。",
  },
  {
    date: "2020.04",
    title: "動画編集を開始",
    description:
      "DaVinci Resolve を独学し、配信者の切り抜き動画や友人間の思い出動画を制作。後に大学の VR プロジェクトで MV・広報動画の制作へと発展。",
  },
];

/** 句読点の直後で文節に分割する（見出しを inline-block で並べ、自然な位置で折り返すため） */
export function splitPhrases(text: string): readonly string[] {
  return text.match(/[^、。！？!?]+[、。！？!?]*/g) ?? [];
}
