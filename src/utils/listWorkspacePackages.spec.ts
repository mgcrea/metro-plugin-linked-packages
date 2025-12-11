import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listWorkspacePackages } from "./listWorkspacePackages";

describe("listWorkspacePackages", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-workspace-packages-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  it("should return empty array when no workspace config exists", () => {
    writeFileSync(join(testDir, "package.json"), JSON.stringify({}));
    expect(listWorkspacePackages(testDir)).toEqual([]);
  });

  it("should detect packages from pnpm-workspace.yaml", () => {
    // Create pnpm lockfile to trigger pnpm detection
    writeFileSync(join(testDir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'");

    // Create workspace config
    writeFileSync(join(testDir, "pnpm-workspace.yaml"), "packages:\n  - 'packages/*'");

    // Create a workspace package
    const packageDir = join(testDir, "packages", "my-lib");
    mkdirSync(packageDir, { recursive: true });
    writeFileSync(join(packageDir, "package.json"), JSON.stringify({ name: "@scope/my-lib" }));

    const result = listWorkspacePackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("@scope/my-lib");
    expect(result[0]!.path).toBe(packageDir);
  });

  it("should detect packages from package.json workspaces array", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        workspaces: ["packages/*"],
      }),
    );

    // Create a workspace package
    const packageDir = join(testDir, "packages", "my-lib");
    mkdirSync(packageDir, { recursive: true });
    writeFileSync(join(packageDir, "package.json"), JSON.stringify({ name: "my-lib" }));

    const result = listWorkspacePackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("my-lib");
  });

  it("should detect packages from package.json workspaces.packages", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        workspaces: {
          packages: ["packages/*"],
        },
      }),
    );

    // Create a workspace package
    const packageDir = join(testDir, "packages", "my-lib");
    mkdirSync(packageDir, { recursive: true });
    writeFileSync(join(packageDir, "package.json"), JSON.stringify({ name: "my-lib" }));

    const result = listWorkspacePackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("my-lib");
  });

  it("should handle multiple workspace patterns", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        workspaces: ["packages/*", "apps/*"],
      }),
    );

    // Create workspace packages
    const libDir = join(testDir, "packages", "lib");
    mkdirSync(libDir, { recursive: true });
    writeFileSync(join(libDir, "package.json"), JSON.stringify({ name: "lib" }));

    const appDir = join(testDir, "apps", "web");
    mkdirSync(appDir, { recursive: true });
    writeFileSync(join(appDir, "package.json"), JSON.stringify({ name: "web" }));

    const result = listWorkspacePackages(testDir);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name).sort()).toEqual(["lib", "web"]);
  });

  it("should skip directories without package.json", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        workspaces: ["packages/*"],
      }),
    );

    // Create a directory without package.json
    const emptyDir = join(testDir, "packages", "empty");
    mkdirSync(emptyDir, { recursive: true });

    // Create a valid workspace package
    const validDir = join(testDir, "packages", "valid");
    mkdirSync(validDir, { recursive: true });
    writeFileSync(join(validDir, "package.json"), JSON.stringify({ name: "valid" }));

    const result = listWorkspacePackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("valid");
  });

  it("should skip packages without name in package.json", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        workspaces: ["packages/*"],
      }),
    );

    // Create a package without name
    const noNameDir = join(testDir, "packages", "no-name");
    mkdirSync(noNameDir, { recursive: true });
    writeFileSync(join(noNameDir, "package.json"), JSON.stringify({ version: "1.0.0" }));

    const result = listWorkspacePackages(testDir);
    expect(result).toHaveLength(0);
  });
});
