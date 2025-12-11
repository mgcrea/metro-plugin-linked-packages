import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { globSync } from "tinyglobby";
import { parse as parseYaml } from "yaml";
import type { LinkedPackage, PackageJson, PnpmWorkspaceConfig } from "../types";
import { detectPackageManager } from "./detectPackageManager";

const readPackageJson = (dir: string): PackageJson | null => {
  const packageJsonPath = resolve(dir, "package.json");
  if (!existsSync(packageJsonPath)) {
    return null;
  }
  return JSON.parse(readFileSync(packageJsonPath, "utf-8")) as PackageJson;
};

const getWorkspacePatterns = (dirname: string): string[] => {
  const pm = detectPackageManager(dirname);

  if (pm === "pnpm") {
    // Try pnpm-workspace.yaml first
    const workspaceYamlPath = resolve(dirname, "pnpm-workspace.yaml");
    if (existsSync(workspaceYamlPath)) {
      const content = readFileSync(workspaceYamlPath, "utf-8");
      const config = parseYaml(content) as PnpmWorkspaceConfig;
      if (config.packages && config.packages.length > 0) {
        return config.packages;
      }
    }
  }

  // Fall back to package.json workspaces field (npm/yarn/pnpm)
  const packageJson = readPackageJson(dirname);
  if (!packageJson?.workspaces) {
    return [];
  }

  // Handle both array and object formats
  if (Array.isArray(packageJson.workspaces)) {
    return packageJson.workspaces;
  }
  return packageJson.workspaces.packages ?? [];
};

export const listWorkspacePackages = (dirname: string): LinkedPackage[] => {
  const patterns = getWorkspacePatterns(dirname);
  if (patterns.length === 0) {
    return [];
  }

  const linked: LinkedPackage[] = [];
  const seen = new Set<string>();

  // Glob for workspace directories
  const workspaceDirs = globSync(patterns, {
    cwd: dirname,
    onlyDirectories: true,
    absolute: true,
  });

  for (const workspaceDir of workspaceDirs) {
    // Remove trailing slash if present
    const normalizedPath = workspaceDir.replace(/\/$/, "");
    const packageJson = readPackageJson(normalizedPath);
    if (packageJson?.name && !seen.has(packageJson.name)) {
      seen.add(packageJson.name);
      linked.push({
        name: packageJson.name,
        path: normalizedPath,
      });
    }
  }

  return linked;
};
