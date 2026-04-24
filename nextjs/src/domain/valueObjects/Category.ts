export const categories = ["app", "web", "video", "graphic"] as const;

export type Category = (typeof categories)[number];