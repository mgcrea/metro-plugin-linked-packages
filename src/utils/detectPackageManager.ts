import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { PackageManager } from "../types";

export const detectPackageManager = (dirname: string): PackageManager => {
  if (existsSync(resolve(dirname, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(resolve(dirname, "yarn.lock"))) return "yarn";
  return "npm";
};
