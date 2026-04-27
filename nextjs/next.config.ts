import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

// WSL 環境ではプロジェクトが Windows filesystem (/mnt/c/...) 上に置かれており、
// SQLite の WAL モードに必要な shm ファイルを作成できない (SQLITE_IOERR_SHMOPEN)。
// WSL_DISTRO_NAME または WSL_INTEROP が設定されている場合は Linux ネイティブの
// tmpfs 上に Wrangler のバインディング状態を保存するよう persist パスを変更する。
const isWSL = !!process.env.WSL_DISTRO_NAME || !!process.env.WSL_INTEROP;
initOpenNextCloudflareForDev(
  isWSL ? { persist: { path: "/tmp/wrangler-portfolio-state" } } : undefined,
);

export default nextConfig;
