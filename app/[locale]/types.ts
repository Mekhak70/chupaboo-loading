// types.ts
export type LayoutConfig<Path extends string> = {
    someKey: string;
    path: Path;
    // Այստեղ ավելացրու իրական կառուցվածքը
  };
  
  // usage
  import type { LayoutConfig as ImportedLayoutConfig } from "./types";
  
  // ✅ Only type check, no const assignment
  type MyLayoutCheck = ImportedLayoutConfig<"/[locale]">;
  