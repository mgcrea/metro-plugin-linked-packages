import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { LinkedPackage, PackageJson, PnpmWorkspaceConfig } from "../types";

const LINK_PROTOCOL_REGEX = /^(link:|file:)/;

const extractLinkedPackages = (
  deps: Record<string, string> | undefined,
  dirname: string,
): LinkedPackage[] => {
  if (!deps) return [];

  const linked: LinkedPackage[] = [];
  for (const [name, version] of Object.entries(deps)) {
    if (LINK_PROTOCOL_REGEX.test(version)) {
      const relativePath = version.replace(LINK_PROTOCOL_REGEX, "");
      const absolutePath = resolve(dirname, relativePath);
      // Resolve symlinks to get the real path (important for pnpm global links)
      const realPath = existsSync(absolutePath) ? realpathSync(absolutePath) : absolutePath;
      linked.push({ name, path: realPath });
    }
  }
  return linked;
};

export const listLinkedPackages = (dirname: string): LinkedPackage[] => {
  const packageJsonPath = resolve(dirname, "package.json");
  if (!existsSync(packageJsonPath)) {
    return [];
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as PackageJson;
  const linked: LinkedPackage[] = [];
  const seen = new Set<string>();

  const addPackage = (pkg: LinkedPackage) => {
    if (!seen.has(pkg.name)) {
      seen.add(pkg.name);
      linked.push(pkg);
    }
  };

  // Scan dependencies, devDependencies, optionalDependencies
  for (const pkg of extractLinkedPackages(packageJson.dependencies, dirname)) {
    addPackage(pkg);
  }
  for (const pkg of extractLinkedPackages(packageJson.devDependencies, dirname)) {
    addPackage(pkg);
  }
  for (const pkg of extractLinkedPackages(packageJson.optionalDependencies, dirname)) {
    addPackage(pkg);
  }

  // Scan pnpm.overrides (pnpm-specific)
  for (const pkg of extractLinkedPackages(packageJson.pnpm?.overrides, dirname)) {
    addPackage(pkg);
  }

  // Scan overrides (npm-specific)
  for (const pkg of extractLinkedPackages(packageJson.overrides, dirname)) {
    addPackage(pkg);
  }

  // Scan resolutions (yarn-specific)
  for (const pkg of extractLinkedPackages(packageJson.resolutions, dirname)) {
    addPackage(pkg);
  }

  // Scan pnpm-workspace.yaml overrides
  const pnpmWorkspacePath = resolve(dirname, "pnpm-workspace.yaml");
  if (existsSync(pnpmWorkspacePath)) {
    const pnpmWorkspace = parseYaml(
      readFileSync(pnpmWorkspacePath, "utf-8"),
    ) as PnpmWorkspaceConfig;
    for (const pkg of extractLinkedPackages(pnpmWorkspace.overrides, dirname)) {
      addPackage(pkg);
    }
  }

  return linked;
};
