// Ambient declarations for side-effect CSS imports (import "x.css").
// TypeScript 6.0+ turns on noUncheckedSideEffectImports by default, which flags
// bare side-effect imports that have no module declaration. Next.js resolves CSS
// at build time via its own pipeline, so this declaration only satisfies the
// type-checker and has no runtime effect. Covers local (./x.css) and package
// (pkg/dist/x.css) stylesheet specifiers alike.
declare module "*.css";
