export type PackageManager = "pnpm" | "yarn" | "npm";

export type LinkedPackage = {
  name: string;
  path: string;
};

export type LinkedPackagesOptions = {
  /** Explicitly specify linked packages (skips auto-detection) */
  linkedPackages?: LinkedPackage[];
  /** Additional peer dependencies to always include */
  additionalPeerDependencies?: string[];
  /** Include workspace packages (default: true) */
  includeWorkspaces?: boolean;
};

export type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
  pnpm?: {
    overrides?: Record<string, string>;
  };
  overrides?: Record<string, string>;
  resolutions?: Record<string, string>;
};

export type PnpmWorkspaceConfig = {
  packages?: string[];
};
