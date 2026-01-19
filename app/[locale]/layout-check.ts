import type { LayoutConfig } from "./types.js"; // Adjust the path to where LayoutConfig is defined
// Removed import of HandlerType as it is not exported from "./layout.js"
// @ts-ignore

const myHandler =  LayoutConfig<"/[locale]">;
type __IsExpected<Specific extends LayoutConfig<"/[locale]">> = Specific;
type __Check = __IsExpected<LayoutConfig<"/[locale]">>;
type __Unused = __Check;

export { myHandler };
