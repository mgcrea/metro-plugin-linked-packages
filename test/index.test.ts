import { describe, expect, test } from "vitest";
import * as module from "../src";

describe("module", () => {
  test("exports", () => {
    expect(Object.keys(module)).toMatchInlineSnapshot(`
      [
        "getLinkedPackagesConfig",
      ]
    `);
  });
});
