export const skillColumns = [
  {
    titleJa: "使用言語",
    titleEn: "Languages",
    items: ["TypeScript", "JavaScript", "PHP", "HTML / CSS", "Java", "C"],
  },
  {
    titleJa: "フレームワーク",
    titleEn: "Frameworks",
    items: ["React", "Next.js", "Angular", "Laravel", "Hono", "Tailwind CSS", "Vite", "Vitest"],
  },
  {
    titleJa: "基盤・運用",
    titleEn: "Platform & Infra",
    items: ["Firebase", "Cloudflare", "Docker", "Stripe"],
  },
  {
    titleJa: "ツール",
    titleEn: "Tools",
    items: ["Git / GitHub", "VS Code", "ESLint", "Figma", "Pencil", "DaVinci Resolve", "Affinity"],
  },
] as const;

export interface ExperienceItem {
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
    label: "kute-fes.com →",
  },
  {
    date: "2025.12",
    title: "株式会社 Zequt — 創業初期エンジニアとして参加",
    description:
      "友人の創業した会社に創業初期エンジニアとして加わる。Web アプリ開発、ホームページ制作、パンフレットデザインを担当し、現在に至る。",
  },
  {
    date: "2025.10",
    title: "Web アプリ開発 / VTuber チームリーダー",
    description:
      "工学院大学 VR プロジェクトの運営効率化のため、TypeScript / React / Tailwind CSS を用いたタスク管理ツールを独学で開発・公開。並行して複数のアプリと広報動画を制作。",
  },
  {
    date: "2025.08",
    title: "学園祭サイト 制作・公開（初の Web サイト）",
    description:
      "学園祭情報をまとめるサイトを HTML / CSS / JavaScript で制作・公開。独学ながら初めて実際にリリースしたプロジェクト。",
    href: "https://www.ns.kogakuin.ac.jp/hachisai/2025/",
    label: "hachisai 2025 →",
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
] as const;