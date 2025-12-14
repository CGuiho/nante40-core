#### &copy; 2025 [GUIHO](https://guiho.co) as represented by [Cristóvão GUIHO](https://guiho.co/cguiho) All Rights Reserved.

# Troubleshooting

- G0000 GUIHO Nante40 Core

## 1. Typecheck error during `@guiho40/nante40-core-type` publish workflow.

**Possible Problem**: `package.build.json` has different versions compare to `package.json`. The `@guiho40/nante40-core-type` uses `package.build.json`, to build the package. `package.build.json` must mirror the version on `package.json`, except for peer dependencies (e.g. `@sinclair/typebox`).

**Solution**: Replace the `dependencies` and `devDependencies` sections on `package.build.json` with the ones from `package.json`, and update the version on `package.build.json` to match the one on `package.json`, except for peer dependencies (in those you want to update the version).
