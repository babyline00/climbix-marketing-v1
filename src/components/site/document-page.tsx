"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  extractAuthorAssets,
  shortcodeAssets,
  type AuthorAssets,
} from "@/lib/shortcodes";
import { GrowthPlanForm } from "@/components/site/growth-plan-form";

/**
 * Renders an admin-authored complete-HTML page.
 *
 * Why inline rather than in a srcDoc frame: several shortcodes are real React
 * components. The growth plan form needs React state, the site's Tailwind
 * build, framer-motion, and Radix portals — its budget dropdown renders into
 * document.body. None of that exists inside a frame, and portal-mounting it
 * into one would place the dropdown outside the frame entirely.
 *
 * So the document is injected into the page and its <style>/<script> blocks
 * are lifted out and applied to the host document, which is what makes a
 * complete HTML file work while keeping real components available. The cost is
 * CSS isolation, which is handled by wrapping author CSS in a native
 * `@scope (.sc-doc-page)` block.
 */

/** Containers already applied, so repeated mounts do not duplicate them. */
const injected = {
  style: new WeakMap<HTMLElement, HTMLStyleElement>(),
  script: new WeakMap<HTMLElement, HTMLScriptElement>(),
};

function applyStyles(css: string, key: string) {
  if (typeof document === "undefined" || !css.trim()) return;
  let style = injected.style.get(document.head);
  if (!style) {
    style = document.createElement("style");
    style.dataset.scBase = "true";
    document.head.appendChild(style);
    injected.style.set(document.head, style);
  }
  // Author blocks are appended in order so later rules win on cascade, and
  // they land after the base styles so an author can always override.
  style.dataset.scKey = key;
  style.textContent = style.textContent ? `${style.textContent}\n${css}` : css;
}

function applyScript(js: string) {
  if (typeof document === "undefined" || !js.trim()) return;
  if (injected.script.get(document.body)) return;
  const el = document.createElement("script");
  el.dataset.scRuntime = "true";
  el.textContent = js;
  document.body.appendChild(el);
  injected.script.set(document.body, el);
}

/** React components addressable from a shortcode placeholder. */
function renderReactShortcode(
  tag: string,
  props: Record<string, string | null>
): React.ReactNode {
  switch (tag) {
    case "growth_plan":
      return (
        <GrowthPlanForm
          source={props["source"] || "growth-plan"}
          variant={props["variant"] === "hero" ? "hero" : "dialog"}
        />
      );
    default:
      return null;
  }
}

type Slot = {
  key: string;
  node: Element;
  tag: string;
  props: Record<string, string | null>;
};

export function DocumentPage({
  content,
  title,
  className,
}: {
  /** Raw authored HTML, complete document or fragment. */
  content: string;
  title: string;
  className?: string;
}) {
  const assets: AuthorAssets = React.useMemo(
    () => extractAuthorAssets(content),
    [content]
  );

  const hostRef = React.useRef<HTMLDivElement>(null);
  const [slots, setSlots] = React.useState<Slot[]>([]);

  // Base styles + form/chat runtime, then the author's own styles.
  React.useEffect(() => {
    const base = shortcodeAssets();
    applyStyles(base.css, "base");
    if (assets.styles.length) applyStyles(assets.styles.join("\n"), "author");
    applyScript(base.js);
    // Author scripts are re-run when the authored markup changes.
    for (const body of assets.scripts) {
      const el = document.createElement("script");
      el.dataset.scAuthor = "true";
      el.textContent = body;
      document.body.appendChild(el);
    }
  }, [assets]);

  // Collect placeholder elements after the markup lands. The markup is set via
  // innerHTML, so React cannot own those nodes — each becomes a portal target.
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const found: Slot[] = [];
    const nodes = host.querySelectorAll("[data-sc-react]");
    nodes.forEach((node, index) => {
      const tag = (node.getAttribute("data-sc-react") || "").toLowerCase();
      if (!tag) return;
      const props: Record<string, string | null> = {};
      for (const attr of Array.from(node.attributes)) {
        if (attr.name.startsWith("data-sc-") && attr.name !== "data-sc-react") {
          props[attr.name.slice("data-sc-".length)] = attr.value;
        }
      }
      found.push({ key: `${tag}-${index}`, node, tag, props });
    });

    setSlots((prev) => {
      const same =
        prev.length === found.length &&
        prev.every((slot, i) => slot.tag === found[i].tag && slot.node === found[i].node);
      return same ? prev : found;
    });
  });

  return (
    <>
      {assets.metas.map((tag, i) => (
        <meta key={i} {...parseMeta(tag)} />
      ))}
      <div
        ref={hostRef}
        className={className ?? "sc-doc-page"}
        dangerouslySetInnerHTML={{ __html: assets.html }}
      />
      {slots.map((slot) => {
        const child = renderReactShortcode(slot.tag, slot.props);
        if (child === null) return null;
        return <React.Fragment key={slot.key}>{createPortal(child, slot.node)}</React.Fragment>;
      })}
    </>
  );
}

/** Turn a raw <meta ...> string into props React can spread. */
function parseMeta(tag: string): Record<string, string> {
  const name = /name\s*=\s*"([^"]*)"/i.exec(tag)?.[1];
  const property = /property\s*=\s*"([^"]*)"/i.exec(tag)?.[1];
  const content = /content\s*=\s*"([^"]*)"/i.exec(tag)?.[1] ?? "";
  if (name) return { name, content };
  if (property) return { property, content };
  return {};
}