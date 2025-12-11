import eslintConfigNode from "@mgcrea/eslint-config-node";

export default [
  ...eslintConfigNode,
  {
    ignores: ["dist/"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
];
