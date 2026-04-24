export interface StorageUploadInput {
  readonly key: string;
  readonly body: ArrayBuffer | Uint8Array | string;
  readonly contentType: string;
}

export interface StoragePort {
  upload(input: StorageUploadInput): Promise<string>;
  delete(key: string): Promise<void>;
}