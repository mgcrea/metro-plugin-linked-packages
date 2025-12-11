import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listLinkedPackages } from "./listLinkedPackages";

describe("listLinkedPackages", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `test-linked-packages-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  it("should return empty array when package.json does not exist", () => {
    expect(listLinkedPackages(testDir)).toEqual([]);
  });

  it("should return empty array when no link: dependencies exist", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        dependencies: {
          lodash: "^4.0.0",
        },
      }),
    );
    expect(listLinkedPackages(testDir)).toEqual([]);
  });

  it("should detect link: dependencies", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "my-package": "link:../my-package",
        },
      }),
    );

    const result = listLinkedPackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("my-package");
    expect(result[0]!.path).toBe(join(testDir, "../my-package"));
  });

  it("should detect file: dependencies", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "my-package": "file:../my-package",
        },
      }),
    );

    const result = listLinkedPackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("my-package");
  });

  it("should detect link: in devDependencies", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        devDependencies: {
          "dev-package": "link:../dev-package",
        },
      }),
    );

    const result = listLinkedPackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("dev-package");
  });

  it("should detect pnpm.overrides with link:", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        pnpm: {
          overrides: {
            "@scope/package": "link:../../libs/package",
          },
        },
      }),
    );

    const result = listLinkedPackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("@scope/package");
  });

  it("should detect npm overrides with link:", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        overrides: {
          "override-package": "link:../override-package",
        },
      }),
    );

    const result = listLinkedPackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("override-package");
  });

  it("should detect yarn resolutions with link:", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        resolutions: {
          "resolution-package": "link:../resolution-package",
        },
      }),
    );

    const result = listLinkedPackages(testDir);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("resolution-package");
  });

  it("should deduplicate packages found in multiple locations", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "my-package": "link:../my-package",
        },
        pnpm: {
          overrides: {
            "my-package": "link:../my-package",
          },
        },
      }),
    );

    const result = listLinkedPackages(testDir);
    expect(result).toHaveLength(1);
  });

  it("should handle multiple linked packages", () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        dependencies: {
          "package-a": "link:../package-a",
          "package-b": "file:../package-b",
          "regular-package": "^1.0.0",
        },
        devDependencies: {
          "package-c": "link:../package-c",
        },
      }),
    );

    const result = listLinkedPackages(testDir);
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.name).sort()).toEqual(["package-a", "package-b", "package-c"]);
  });
});
