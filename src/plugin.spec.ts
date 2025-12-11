import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getLinkedPackagesConfig } from "./plugin";

describe("getLinkedPackagesConfig", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-plugin-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, "node_modules"), { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  it("should return a valid Metro config structure", () => {
    writeFileSync(join(testDir, "package.json"), JSON.stringify({}));

    const config = getLinkedPackagesConfig(testDir);

    expect(config).toHaveProperty("watchFolders");
    expect(config).toHaveProperty("resolver");
    expect(config.resolver).toHaveProperty("extraNodeModules");
    expect(config.resolver).toHaveProperty("blockList");
  });

  it("should use explicitly provided linkedPackages", () => {
    writeFileSync(join(testDir, "package.json"), JSON.stringify({}));

    const linkedPackageDir = join(testDir, "linked-pkg");
    mkdirSync(linkedPackageDir, { recursive: true });
    writeFileSync(join(linkedPackageDir, "package.json"), JSON.stringify({ name: "linked-pkg" }));

    const config = getLinkedPackagesConfig(testDir, {
      linkedPackages: [{ name: "my-pkg", path: linkedPackageDir }],
    });

    expect(config.watchFolders).toContain(linkedPackageDir);
    expect(config.resolver?.extraNodeModules).toHaveProperty("my-pkg", linkedPackageDir);
  });

  it("should auto-detect link: dependencies from package.json", () => {
    const linkedPackageDir = join(testDir, "linked-pkg");
    mkdirSync(linkedPackageDir, { recursive: true });
    writeFileSync(join(linkedPackageDir, "package.json"), JSON.stringify({ name: "linked-pkg" }));

    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "linked-pkg": `link:./linked-pkg`,
        },
      }),
    );

    const config = getLinkedPackagesConfig(testDir);

    expect(config.watchFolders).toContain(linkedPackageDir);
    expect(config.resolver?.extraNodeModules).toHaveProperty("linked-pkg");
  });

  it("should collect peer dependencies from linked packages", () => {
    const linkedPackageDir = join(testDir, "linked-pkg");
    mkdirSync(linkedPackageDir, { recursive: true });
    writeFileSync(
      join(linkedPackageDir, "package.json"),
      JSON.stringify({
        name: "linked-pkg",
        peerDependencies: {
          react: "^18.0.0",
          "react-native": "^0.72.0",
        },
      }),
    );

    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "linked-pkg": `link:./linked-pkg`,
        },
      }),
    );

    const config = getLinkedPackagesConfig(testDir);
    const extraNodeModules = config.resolver?.extraNodeModules as Record<string, string>;

    expect(extraNodeModules).toHaveProperty("react");
    expect(extraNodeModules).toHaveProperty("react-native");
    expect(extraNodeModules).toHaveProperty("@babel/runtime");
  });

  it("should include additional peer dependencies when specified", () => {
    writeFileSync(join(testDir, "package.json"), JSON.stringify({}));

    const config = getLinkedPackagesConfig(testDir, {
      linkedPackages: [],
      additionalPeerDependencies: ["lodash", "moment"],
    });

    const extraNodeModules = config.resolver?.extraNodeModules as Record<string, string>;

    expect(extraNodeModules).toHaveProperty("lodash");
    expect(extraNodeModules).toHaveProperty("moment");
  });

  it("should skip workspace packages when includeWorkspaces is false", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        workspaces: ["packages/*"],
      }),
    );

    const workspaceDir = join(testDir, "packages", "lib");
    mkdirSync(workspaceDir, { recursive: true });
    writeFileSync(join(workspaceDir, "package.json"), JSON.stringify({ name: "lib" }));

    const config = getLinkedPackagesConfig(testDir, {
      includeWorkspaces: false,
    });

    expect(config.watchFolders).not.toContain(workspaceDir);
  });

  it("should create block list patterns for linked packages node_modules", () => {
    const linkedPackageDir = join(testDir, "linked-pkg");
    mkdirSync(linkedPackageDir, { recursive: true });
    mkdirSync(join(linkedPackageDir, "node_modules"), { recursive: true });
    writeFileSync(join(linkedPackageDir, "package.json"), JSON.stringify({ name: "linked-pkg" }));

    const config = getLinkedPackagesConfig(testDir, {
      linkedPackages: [{ name: "linked-pkg", path: linkedPackageDir }],
    });

    const blockList = config.resolver?.blockList;
    expect(blockList).toBeDefined();

    // The blockList should match paths inside the linked package's node_modules
    const testPath = join(linkedPackageDir, "node_modules", "some-dep", "index.js");
    // @ts-expect-error - blockList is a RegExp array wrapped by exclusionList
    expect(blockList.test(testPath)).toBe(true);
  });
});
