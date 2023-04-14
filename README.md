# FastifySession SodiumCrypto

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://www.npmjs.com/package/@mgcrea/metro-plugin-linked-packages">
    <img src="https://img.shields.io/npm/v/@mgcrea/metro-plugin-linked-packages.svg?style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/metro-plugin-linked-packages">
    <img src="https://img.shields.io/npm/dt/@mgcrea/metro-plugin-linked-packages.svg?style=for-the-badge" alt="npm total downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/metro-plugin-linked-packages">
    <img src="https://img.shields.io/npm/dm/@mgcrea/metro-plugin-linked-packages.svg?style=for-the-badge" alt="npm monthly downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/metro-plugin-linked-packages">
    <img src="https://img.shields.io/npm/l/@mgcrea/metro-plugin-linked-packages.svg?style=for-the-badge" alt="npm license" />
  </a>
  <br />
  <a href="https://github.com/mgcrea/metro-plugin-linked-packages/actions/workflows/main.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/mgcrea/metro-plugin-linked-packages/main.yml?style=for-the-badge&branch=master" alt="build status" />
  </a>
  <a href="https://depfu.com/github/mgcrea/metro-plugin-linked-packages">
    <img src="https://img.shields.io/depfu/dependencies/github/mgcrea/metro-plugin-linked-packages?style=for-the-badge" alt="dependencies status" />
  </a>
</p>
<!-- markdownlint-enable MD037 -->

## Features

Automatically resolve and hoist your linked packages peer dependencies in your react-native projects.

## Install

```bash
npm install @mgcrea/metro-plugin-linked-packages --save-dev
# or
yarn add @mgcrea/metro-plugin-linked-packages --dev
# or
pnpm add  @mgcrea/metro-plugin-linked-packages  --save-dev
```

## Quickstart

```tsx
// metro.config.js
const { getLinkedPackagesConfig } = require("@mgcrea/metro-plugin-linked-packages");

const config = {};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  getLinkedPackagesConfig(__dirname),
  config
);
```

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
