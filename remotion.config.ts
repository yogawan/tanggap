import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// The CLI (`remotion studio` / `remotion render`) bundles the composition
// with its own webpack instance, separate from Next.js's. Without this
// override, Tailwind utility classes used inside `remotion/` wouldn't be
// processed, and the `@/*` import alias (from tsconfig.json, which webpack
// doesn't read) wouldn't resolve (the in-app <Player> preview is unaffected
// either way — it runs inside Next's own bundle, which already handles both).
Config.overrideBundlerConfig((currentConfiguration) => {
  const withTailwind = enableTailwind(currentConfiguration);
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...withTailwind.resolve?.alias,
        "@": path.resolve(process.cwd()),
      },
    },
  };
});

Config.setVideoImageFormat("jpeg");
