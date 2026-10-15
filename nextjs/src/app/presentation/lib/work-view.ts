import { getMediumCategoryDefinition, type Work } from "@/application/publicApi";

export function splitTechStack(techStack: string): readonly string[] {
  return techStack
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0);
}

/** 一覧表示用のメタ情報（媒体名・公開年・技術スタックの要約） */
export function getWorkMeta(work: Work) {
  const tags = splitTechStack(work.techStack);

  return {
    mediumJa: getMediumCategoryDefinition(work.category).nameJa,
    year: (work.publishedAt ?? "").slice(0, 4),
    stackShort: tags.slice(0, 4).join(" / ") + (tags.length > 4 ? " …" : ""),
    stackFull: tags.join(" / "),
    // lead 未設定の作品は概要の冒頭で代用する
    lead: work.lead ?? work.description.split("\n").find((line) => line.trim().length > 0) ?? "",
  };
}
