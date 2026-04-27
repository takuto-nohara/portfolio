import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} dir
 * @param {(filePath: string) => boolean} [filter]
 * @param {string[]} [fileList]
 * @returns {string[]}
 */
export function getAllFiles(
  dir,
  filter = (filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"),
  fileList = [],
) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, filter, fileList);
    } else if (filter(filePath)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}
