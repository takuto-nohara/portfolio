import type { StoragePort, StorageUploadInput } from "@/application/publicApi";

export interface R2BucketLike {
  get(key: string): Promise<R2ObjectLike | null>;
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string,
    options?: {
      readonly httpMetadata?: {
        readonly contentType?: string;
      };
    },
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}

interface R2ObjectLike {
  readonly body: ReadableStream | null;
  readonly httpMetadata?: {
    readonly contentType?: string;
    readonly cacheControl?: string;
    readonly contentDisposition?: string;
  };
}

export interface R2StorageConfig {
  readonly publicBaseUrl: string;
}

export class R2StorageAdapter implements StoragePort {
  constructor(
    private readonly bucket: R2BucketLike,
    private readonly config: R2StorageConfig,
  ) {}

  async upload(input: StorageUploadInput): Promise<string> {
    await this.bucket.put(input.key, input.body, {
      httpMetadata: {
        contentType: input.contentType,
      },
    });

    return this.buildPublicUrl(input.key);
  }

  delete(key: string): Promise<void> {
    return this.bucket.delete(key);
  }

  private buildPublicUrl(key: string): string {
    const normalizedBaseUrl = this.config.publicBaseUrl.replace(/\/$/, "");
    const encodedKey = key
      .split("/")
      .filter((segment) => segment.length > 0)
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return `${normalizedBaseUrl}/${encodedKey}`;
  }
}