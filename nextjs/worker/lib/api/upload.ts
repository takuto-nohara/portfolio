import type { StoragePort } from "@/application/publicApi";

export async function uploadFile(storagePort: StoragePort, file: File, folder: string): Promise<string> {
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
  const key = `${folder}/${crypto.randomUUID()}${extension}`;

  return storagePort.upload({
    key,
    body: await file.arrayBuffer(),
    contentType: file.type || "application/octet-stream",
  });
}
