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

const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "BR", "WBR", "HEAD", "OPTION", "OPTGROUP", "COL", "COLGROUP", "DATALIST", "TITLE"]);
const MEDIA = new Set(["img", "svg", "canvas", "video", "picture", "iframe", "audio"]);
const CONTROL = new Set(["button", "input", "select", "textarea", "meter", "progress"]);
const CONTROL_ROLES = new Set(["button", "tab", "switch", "checkbox", "radio", "slider", "combobox", "menuitem"]);
const MIN = 2; // px: smaller boxes are not drawn

const alphaOf = (c: string): number => {
  if (!c || c === "transparent") return 0;
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m) return 1;
  const parts = m[1].split(/[,/\s]+/).filter(Boolean);
  return parts.length >= 4 ? Number.parseFloat(parts[3]) || 0 : 1;
};

function decorated(cs: CSSStyleDeclaration): boolean {
  if (alphaOf(cs.backgroundColor) > 0.02 || cs.backgroundImage !== "none") return true;
  if (cs.boxShadow !== "none") return true;
  return (["Top", "Right", "Bottom", "Left"] as const).some(
    (s) => cs.getPropertyValue(`border-${s.toLowerCase()}-style`) !== "none" && Number.parseFloat(cs.getPropertyValue(`border-${s.toLowerCase()}-width`)) > 0,
  );
}

const hasOwnText = (el: Element) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== "");

interface Raw { layer: Layer; parentEl: LayerEl | null }

export function discoverLayers(root: Element, o: DiscoverOptions): Layer[] {
  const raw: Raw[] = [];
  const vw = window.innerWidth, vh = window.innerHeight;

  const usable = (el: Element): { rect: DOMRect; cs: CSSStyleDeclaration } | null => {
    if (SKIP.has(el.tagName) || el.hasAttribute("data-ar-skip") || el.hasAttribute("hidden")) return null;
    if (o.filter && o.filter(el) === false) return null;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return null;
    const rect = el.getBoundingClientRect();
    if (rect.width < MIN || rect.height < MIN) return null;
    if (o.viewportOnly && (rect.bottom <= 0 || rect.top >= vh || rect.right <= 0 || rect.left >= vw)) return null;
    return { rect, cs };
  };

  const push = (el: LayerEl, kind: LayerKind, rect: DOMRect, parentEl: LayerEl | null, depth: number): boolean => {
    if (raw.length >= o.maxLayers) return false;
    raw.push({ parentEl, layer: { el, kind, parent: -1, depth, left: rect.left, top: rect.top, width: rect.width, height: rect.height } });
    return true;
  };

  const walk = (el: Element, parentEl: LayerEl | null, depth: number) => {
    if (depth > 40) return;
    const kids: { el: Element; rect: DOMRect; cs: CSSStyleDeclaration }[] = [];
    for (const k of Array.from(el.children)) {
      const u = usable(k);
      if (u) kids.push({ el: k, ...u });
    }
    for (const k of kids) {
      if (raw.length >= o.maxLayers) return;
      const tag = k.el.tagName.toLowerCase();
      const role = k.el.getAttribute("role") ?? "";
      const here = k.el as LayerEl;
      if (CONTROL.has(tag) || CONTROL_ROLES.has(role)) { push(here, "control", k.rect, parentEl, depth); continue; }
      if (MEDIA.has(tag)) { push(here, "media", k.rect, parentEl, depth); continue; }

      const sub: Element[] = [];
      for (const c of Array.from(k.el.children)) if (usable(c)) sub.push(c);
      const text = hasOwnText(k.el);
      const dec = decorated(k.cs);

      if (sub.length === 0) {
        if (text) push(here, "text", k.rect, parentEl, depth);
        else if (dec) push(here, "box", k.rect, parentEl, depth);
        continue;
      }
      // "text with inline bits" (<p>a <b>b</b></p>) is one text layer
      if (text && sub.every((c) => getComputedStyle(c).display === "inline")) { push(here, "text", k.rect, parentEl, depth); continue; }

      if (dec) {
        if (!push(here, "box", k.rect, parentEl, depth)) return;
        walk(k.el, here, depth + 1);
      } else walk(k.el, parentEl, depth + 1);
    }
  };
  walk(root, null, 0);

  // Reading order. A parent always has top <= child.top, and its depth is smaller, so it sorts first.
  raw.sort((a, b) => a.layer.top - b.layer.top || a.layer.depth - b.layer.depth || a.layer.left - b.layer.left);
  const at = new Map<LayerEl, number>();
  raw.forEach((r, i) => at.set(r.layer.el, i));
  return raw.map((r) => ({ ...r.layer, parent: r.parentEl ? (at.get(r.parentEl) ?? -1) : -1 }));
}
