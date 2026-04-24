import { ProfileAvatar } from "@/presentation/components/ProfileAvatar";
import { SiteShell } from "@/presentation/components/SiteShell";
import { getSiteSettings } from "@worker/lib/site-data";

const skillColumns = [
  {
    title: "languages",
    items: ["TypeScript", "JavaScript", "PHP", "HTML / CSS", "Java", "C"],
  },
  {
    title: "frameworks",
    items: ["React", "Next.js", "Angular", "Laravel", "Hono", "Tailwind CSS", "Vite", "Vitest"],
  },
  {
    title: "platform & infra",
    items: ["Firebase", "Cloudflare", "Docker", "Stripe"],
  },
  {
    title: "tools",
    items: ["Git / GitHub", "VS Code", "ESLint", "Figma", "Pencil", "DaVinci Resolve", "Affinity"],
  },
] as const;

interface ExperienceItem {
  readonly date: string;
  readonly title: string;
  readonly description: string;
  readonly href?: string;
  readonly label?: string;
}

const experiences: readonly ExperienceItem[] = [
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

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <SiteShell settings={settings}>
      <section className="bg-surface-secondary px-6 py-12 text-center sm:px-20 sm:py-20">
        <h1 className="text-[40px] font-bold text-foreground-primary">{"> About Me"}</h1>
      </section>

      <section className="bg-surface-primary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-8 sm:flex-row sm:gap-16">
          <ProfileAvatar sizeClass="h-48 w-48 sm:h-64 sm:w-64" priority />
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground-primary">野原 拓人</h2>
            <p className="mb-6 text-sm text-accent-primary">Takuto Nohara</p>
            <div className="space-y-4 text-sm leading-relaxed text-foreground-secondary">
              <p>
                中学生のころ、動画編集をきっかけにコンテンツ制作の世界に入りました。映像から始まり、パンフレット、Web ページ、そしてアプリケーション開発へ。
                「欲しいものが見当たらないなら自分で作ればいい」という姿勢で、幅広いアウトプットに取り組んできた大学生です。
              </p>
              <p>
                現在はフロントエンドからバックエンドまで、Web アプリケーション開発を軸に学習を深めています。コードを書くことは「思考をレンダリングすること」。
                頭の中のアイデアを動いて触れる形へ変換するプロセスが好きです。
              </p>
              <p>将来はエンジニアとして就職することを目指しており、このポートフォリオはその第一歩として制作しました。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-secondary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground-primary">{"> skills / tech_stack"}</h2>
          <div className="grid skills-grid gap-8">
            {skillColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-6 border-b border-border-subtle pb-3 text-base font-semibold text-foreground-primary">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.items.map((item) => (
                    <li key={item} className="text-sm text-foreground-secondary">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-primary px-6 py-12 sm:px-20 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground-primary">{"> experience_log"}</h2>
          <div className="mx-auto max-w-2xl space-y-8">
            {experiences.map((experience) => (
              <div key={`${experience.date}-${experience.title}`} className="flex items-start gap-6">
                <span className="w-20 shrink-0 text-sm font-semibold text-accent-primary">{experience.date}</span>
                <div>
                  <h3 className="text-base font-semibold text-foreground-primary">{experience.title}</h3>
                  <p className="mt-1 text-sm text-foreground-secondary">{experience.description}</p>
                  {experience.href && experience.label ? (
                    <a
                      href={experience.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-accent-primary hover:underline"
                    >
                      {experience.label}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}