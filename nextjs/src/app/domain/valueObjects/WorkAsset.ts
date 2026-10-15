const YOUTUBE_THUMBNAIL_PREFIX = "https://img.youtube.com/";

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const match = parsed.pathname.match(/\/(embed|shorts|v)\/([^/?]+)/);
      if (match) return match[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `${YOUTUBE_THUMBNAIL_PREFIX}vi/${videoId}/maxresdefault.jpg`;
}

export function isYouTubeThumbnailUrl(path: string | null): boolean {
  return path?.startsWith(YOUTUBE_THUMBNAIL_PREFIX) ?? false;
}

/**
 * 作品の画像 URL から R2 のオブジェクトキーを取り出す。
 * R2 に保存していない画像（YouTube サムネイルなど）は null を返す。
 */
export function extractWorkAssetKey(path: string | null): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      return extractWorkAssetKey(url.pathname);
    } catch {
      return null;
    }
  }

  if (path.startsWith("/api/assets/")) {
    return path
      .replace(/^\/api\/assets\//, "")
      .split("/")
      .filter((segment) => segment.length > 0)
      .map((segment) => decodeURIComponent(segment))
      .join("/");
  }

  if (path.startsWith("/")) {
    return null;
  }

  return path;
}
