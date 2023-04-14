import type { Dirent, PathLike } from "node:fs";
import { readdirSync } from "node:fs";

export type ListSymlinksOptions = {
  depth?: number;
  filter?: (item: Dirent) => boolean;
};

export const listSymlinksSync = (
  directory: PathLike,
  { depth = 0, filter }: ListSymlinksOptions
): string[] => {
  const list = readdirSync(directory, { withFileTypes: true });
  const symlinks = list.filter((item) => item.isSymbolicLink()).map((item) => item.name);
  if (depth <= 0) {
    return symlinks;
  }
  const subFolders = list.filter((item) => item.isDirectory() && (filter ? filter(item) : true));
  for (const folder of subFolders) {
    const folderSymlinks = listSymlinksSync(`${directory}/${folder.name}`, { depth: depth - 1 });
    symlinks.push(...folderSymlinks.map((item) => `${folder.name}/${item}`));
  }
  return symlinks;
};
