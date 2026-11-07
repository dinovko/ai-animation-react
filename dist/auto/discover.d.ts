/**
 * Splits a DOM subtree into "layers": the things an agent would draw one by one.
 * A layer is a text block, a media element, a control, or a decorated box (background, border, shadow).
 * Plain wrappers without decoration are not layers; their children are.
 */
export type LayerKind = "text" | "media" | "control" | "box";
export type LayerEl = HTMLElement | SVGElement;
export interface Layer {
    el: LayerEl;
    kind: LayerKind;
    /** index of the nearest ancestor layer in the sorted list, -1 for none */
    parent: number;
    depth: number;
    left: number;
    top: number;
    width: number;
    height: number;
}
export interface DiscoverOptions {
    maxLayers: number;
    viewportOnly: boolean;
    filter?: (el: Element) => boolean;
}
export declare function discoverLayers(root: Element, o: DiscoverOptions): Layer[];
//# sourceMappingURL=discover.d.ts.map