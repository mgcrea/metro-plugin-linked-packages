# Metro Plugin Linked Packages

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://www.npmjs.com/package/@mgcrea/metro-plugin-linked-package">
    <img src="https://img.shields.io/npm/v/@mgcrea/metro-plugin-linked-package.svg?style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/metro-plugin-linked-package">
    <img src="https://img.shields.io/npm/dt/@mgcrea/metro-plugin-linked-package.svg?style=for-the-badge" alt="npm total downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/metro-plugin-linked-package">
    <img src="https://img.shields.io/npm/dm/@mgcrea/metro-plugin-linked-package.svg?style=for-the-badge" alt="npm monthly downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/metro-plugin-linked-package">
    <img src="https://img.shields.io/npm/l/@mgcrea/metro-plugin-linked-package.svg?style=for-the-badge" alt="npm license" />
  </a>
  <br />
  <a href="https://github.com/mgcrea/metro-plugin-linked-package/actions/workflows/main.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/mgcrea/metro-plugin-linked-package/main.yaml?style=for-the-badge&branch=main" alt="build status" />
  </a>
</p>
<!-- markdownlint-enable MD033 -->

## Features

A Metro plugin that enables seamless local development with symlinked libraries in React Native projects. It automatically configures Metro to properly resolve linked packages, avoiding common pitfalls like multiple React instances, missing peer dependencies, or broken hot reloading.

Works with **pnpm**, **yarn**, and **npm**.

- Detects `link:` and `file:` protocol dependencies
- Scans `package.json` (dependencies, devDependencies, overrides, resolutions)
- Scans `pnpm-workspace.yaml` overrides
- Resolves symlinks to real paths (important for pnpm global links)
- Automatically hoists peer dependencies from linked packages
- Configures Metro's `watchFolders`, `extraNodeModules`, and `blockList`

## Install

```bash
npm install @mgcrea/metro-plugin-linked-packages --save-dev
# or
yarn add @mgcrea/metro-plugin-linked-packages --dev
# or
pnpm add @mgcrea/metro-plugin-linked-packages --save-dev
```

## Quickstart

```js
// metro.config.js
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { getLinkedPackagesConfig } = require("@mgcrea/metro-plugin-linked-packages");

const config = {};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  getLinkedPackagesConfig(__dirname),
  config,
);
```

## How It Works

The plugin scans your project for linked packages defined via:

- **package.json**: `dependencies`, `devDependencies`, `optionalDependencies` with `link:` or `file:` protocols
- **package.json**: `pnpm.overrides`, `overrides` (npm), `resolutions` (yarn)
- **pnpm-workspace.yaml**: `overrides` section

For each linked package, it:

1. Adds the package path to `watchFolders` for hot reloading
2. Adds the package to `extraNodeModules` so Metro can resolve it
3. Collects peer dependencies and adds them to `extraNodeModules`
4. Blocks the linked package's `node_modules` to prevent duplicate dependencies

## Options

```ts
type LinkedPackagesOptions = {
  /** Explicitly specify linked packages (skips auto-detection) */
  linkedPackages?: LinkedPackage[];
  /** Additional peer dependencies to always include */
  additionalPeerDependencies?: string[];
  /** Include workspace packages (default: true) */
  includeWorkspaces?: boolean;
};
```

### Example with Options

```js
const { getLinkedPackagesConfig } = require("@mgcrea/metro-plugin-linked-packages");

// Explicitly specify packages
getLinkedPackagesConfig(__dirname, {
  linkedPackages: [{ name: "my-package", path: "/path/to/my-package" }],
});

// Add extra peer dependencies
getLinkedPackagesConfig(__dirname, {
  additionalPeerDependencies: ["lodash", "moment"],
});

// Disable workspace package detection
getLinkedPackagesConfig(__dirname, {
  includeWorkspaces: false,
});
```

## Exported Utilities

The plugin also exports utility functions for advanced use cases:

```ts
import {
  getLinkedPackagesConfig,
  listLinkedPackages,
  listWorkspacePackages,
  listSymlinksSync,
  detectPackageManager,
} from "@mgcrea/metro-plugin-linked-packages";

// List all linked packages in a directory
const linked = listLinkedPackages("/path/to/project");
// => [{ name: "@scope/pkg", path: "/real/path/to/pkg" }, ...]

// List workspace packages
const workspaces = listWorkspacePackages("/path/to/project");

// Detect package manager
const pm = detectPackageManager("/path/to/project");
// => "pnpm" | "yarn" | "npm"
```

## pnpm Setup Example

With pnpm, you can link packages globally and reference them in `pnpm-workspace.yaml`:

```yaml
# pnpm-workspace.yaml
overrides:
  "@myorg/my-lib": link:../../../Library/pnpm/global/5/node_modules/@myorg/my-lib
```

The plugin will automatically detect these and configure Metro accordingly.

## Authors

- [Olivier Louvignes](https://github.com/mgcrea) <<olivier@mgcrea.io>>

## License

```txt
The MIT License

Copyright (c) 2023 Olivier Louvignes <olivier@mgcrea.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
