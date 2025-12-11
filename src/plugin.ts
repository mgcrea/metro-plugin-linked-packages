import type { MetroConfig } from "metro-config";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import type { LinkedPackage, LinkedPackagesOptions, PackageJson } from "./types";
import { listLinkedPackages, listSymlinksSync, listWorkspacePackages } from "./utils";

type ExclusionListFn = (additionalExclusions?: RegExp[]) => RegExp;

// Handle both CJS and ESM module formats
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const exclusionListModule = require("metro-config/private/defaults/exclusionList");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const exclusionList: ExclusionListFn = exclusionListModule.default ?? exclusionListModule;

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const collectPeerDependencies = (
  packages: LinkedPackage[],
  additionalPeerDeps: string[],
): string[] => {
  const peerDeps = new Set<string>(["@babel/runtime", ...additionalPeerDeps]);

  for (const pkg of packages) {
    const packageJsonPath = resolve(pkg.path, "package.json");
    if (!existsSync(packageJsonPath)) continue;

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as PackageJson;
    if (packageJson.peerDependencies) {
      for (const name of Object.keys(packageJson.peerDependencies)) {
        peerDeps.add(name);
      }
    }
  }

  return Array.from(peerDeps);
};

const buildMetroConfig = (
  dirname: string,
  packages: LinkedPackage[],
  additionalPeerDeps: string[],
): MetroConfig => {
  const modulesDirectory = resolve(dirname, "node_modules");

  // Watch folders for hot reloading linked package sources
  const watchFolders = packages.map((pkg) => pkg.path);

  // Block list to prevent bundling linked packages' node_modules
  const blockListPatterns = packages.map((pkg) => {
    const nodeModulesPath = resolve(pkg.path, "node_modules");
    return new RegExp(`${escapeRegExp(nodeModulesPath)}/.*`);
  });
  const blockList = exclusionList(blockListPatterns);

  // Collect peer dependencies from all linked packages
  const peerDependencies = collectPeerDependencies(packages, additionalPeerDeps);

  // Build extraNodeModules map
  const resolveModulePath = (moduleName: string) => resolve(modulesDirectory, moduleName);
  const extraNodeModules: Record<string, string> = {};

  // Always add linked packages to extraNodeModules with their real paths
  // Metro doesn't reliably follow pnpm's complex symlink chains
  for (const pkg of packages) {
    extraNodeModules[pkg.name] = pkg.path;
  }

  // Add peer dependencies so linked packages can resolve them from the host project
  for (const moduleName of peerDependencies) {
    extraNodeModules[moduleName] = resolveModulePath(moduleName);
  }

  return {
    watchFolders,
    resolver: {
      extraNodeModules,
      blockList,
    },
  };
};

export const getLinkedPackagesConfig = (
  dirname: string,
  options?: LinkedPackagesOptions,
): MetroConfig => {
  let packages: LinkedPackage[];

  if (options?.linkedPackages) {
    // Use explicitly provided packages
    packages = options.linkedPackages;
  } else {
    // Auto-detect linked packages from package.json
    packages = listLinkedPackages(dirname);

    // Include workspace packages if enabled (default: true)
    if (options?.includeWorkspaces !== false) {
      const workspacePackages = listWorkspacePackages(dirname);
      // Deduplicate by name
      const seen = new Set(packages.map((p) => p.name));
      for (const pkg of workspacePackages) {
        if (!seen.has(pkg.name)) {
          packages.push(pkg);
        }
      }
    }

    // Fallback to symlink detection if no packages found
    if (packages.length === 0) {
      const modulesDirectory = resolve(dirname, "node_modules");
      if (existsSync(modulesDirectory)) {
        const symlinks = listSymlinksSync(modulesDirectory, { depth: 1 });
        for (const symlink of symlinks) {
          const symlinkPath = resolve(modulesDirectory, symlink);
          packages.push({
            name: symlink,
            path: realpathSync(symlinkPath),
          });
        }
      }
    }
  }

  return buildMetroConfig(dirname, packages, options?.additionalPeerDependencies ?? []);
};
