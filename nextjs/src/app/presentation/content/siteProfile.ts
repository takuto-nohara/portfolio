export const siteProfile = {
  nameJa: "野原 拓人",
  nameEn: "Takuto Nohara",
  roleJa: "ソフトウェアエンジニア志望 / 大学生",
  roleEn: "Software Engineer Candidate",
  summary:
    "アプリ、Web、映像、グラフィックまで横断しながら、アイデアを実際に触れられる形へ落とし込むことを強みにしています。",
  homeLead: [
    "「欲しいものがない？ならば自分で作ってしまえ！」をモットーに、",
    "企画・設計・実装・運用まで一貫して取り組んでいます。",
    "本サイトでは制作物とその背景をまとめて掲載しています。",
  ],
} as const;

export const siteNavigationItems = [
  { href: "/works", labelJa: "作品", labelEn: "Works" },
  { href: "/about", labelJa: "自己紹介", labelEn: "About" },
  { href: "/contact", labelJa: "連絡先", labelEn: "Contact" },
] as const;