import type { MetroConfig } from "metro-config";
import exclusionList from "metro-config/src/defaults/exclusionList";
import { readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { listSymlinksSync } from "./utils";

export const getLinkedPackagesConfig = (dirname: string): MetroConfig => {
  const modulesDirectory = resolve(dirname, "node_modules");

  const linkedDependencies = listSymlinksSync(modulesDirectory, {
    depth: 1,
    filter: (item) => item.name.startsWith("@"),
  });

  const linkedPeerDependencies: string[] = [];
  for (const linkedDependency of linkedDependencies) {
    const packageContents = readFileSync(
      resolve(modulesDirectory, linkedDependency, "package.json"),
      "utf-8"
    );
    const packageJson = JSON.parse(packageContents);
    if (packageJson.peerDependencies) {
      Object.keys(packageJson.peerDependencies).forEach((name) => {
        if (!linkedPeerDependencies.includes(name)) {
          linkedPeerDependencies.push(name);
        }
      });
    }
  }

  const extraPackages = linkedDependencies.reduce<Record<string, string>>((soFar, moduleName) => {
    soFar[moduleName] = realpathSync(resolve(modulesDirectory, moduleName));
    return soFar;
  }, {});

  const watchFolders = Object.values(extraPackages);

  const extraPackagesModules = linkedDependencies.reduce<RegExp[]>((soFar, moduleName) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return soFar.concat([new RegExp(`${resolve(extraPackages[moduleName]!, "node_modules")}/.*`)]);
  }, []);
  const blockList = exclusionList(extraPackagesModules);

  const resolveModulePath = (module: string) => resolve(modulesDirectory, module);
  const extraNodeModules = linkedPeerDependencies.reduce<Record<string, string>>(
    (soFar, moduleName) => {
      soFar[moduleName] = resolveModulePath(moduleName);
      return soFar;
    },
    { ...extraPackages }
  );

  return {
    watchFolders,
    resolver: {
      extraNodeModules,
      blockList,
    },
  };
};
