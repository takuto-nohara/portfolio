export const categories = ["app", "web", "video", "graphic"] as const;

export type Category = (typeof categories)[number];

export interface MediumCategoryDefinition {
	readonly slug: Category;
	readonly nameJa: string;
	readonly nameEn: string;
}

export const mediumCategoryDefinitions: readonly MediumCategoryDefinition[] = [
	{ slug: "app", nameJa: "アプリ", nameEn: "App" },
	{ slug: "web", nameJa: "Web制作", nameEn: "Web" },
	{ slug: "video", nameJa: "映像", nameEn: "Video" },
	{ slug: "graphic", nameJa: "グラフィック", nameEn: "Graphic" },
] as const;

const mediumCategoryMap = new Map<Category, MediumCategoryDefinition>(
	mediumCategoryDefinitions.map((definition) => [definition.slug, definition]),
);

export function getMediumCategoryDefinition(category: Category): MediumCategoryDefinition {
	return mediumCategoryMap.get(category) ?? { slug: category, nameJa: category, nameEn: category };
}