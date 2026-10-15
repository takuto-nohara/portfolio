export function resolveWorkAssetUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    // 既存データの hqdefault.jpg (黒帯あり) を maxresdefault.jpg に自動変換
    if (path.includes("img.youtube.com/vi/") && path.endsWith("/hqdefault.jpg")) {
      return path.replace(/\/hqdefault\.jpg$/, "/maxresdefault.jpg");
    }
    return path;
  }

  const encodedPath = path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/api/assets/${encodedPath}`;
}
