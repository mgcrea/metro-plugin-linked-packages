import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectPackageManager } from "./detectPackageManager";

describe("detectPackageManager", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-detect-pm-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  it("should detect pnpm when pnpm-lock.yaml exists", () => {
    writeFileSync(join(testDir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'");
    expect(detectPackageManager(testDir)).toBe("pnpm");
  });

  it("should detect yarn when yarn.lock exists", () => {
    writeFileSync(join(testDir, "yarn.lock"), "# yarn lockfile v1");
    expect(detectPackageManager(testDir)).toBe("yarn");
  });

  it("should default to npm when no lockfile exists", () => {
    expect(detectPackageManager(testDir)).toBe("npm");
  });

  it("should prioritize pnpm over yarn when both lockfiles exist", () => {
    writeFileSync(join(testDir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'");
    writeFileSync(join(testDir, "yarn.lock"), "# yarn lockfile v1");
    expect(detectPackageManager(testDir)).toBe("pnpm");
  });
});
