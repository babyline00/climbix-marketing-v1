"use client";

import * as React from "react";
import { buildDocument } from "@/lib/shortcodes";

/**
 * Renders an admin-authored complete-HTML page.
 *
 * A full <!doctype html> file needs its own <head>, <style> and <script>, none
 * of which survive dangerouslySetInnerHTML (script tags injected that way never
 * execute, and document-level CSS would collide with the site shell). So the
 * document is handed to a same-tab iframe via srcDoc instead: the author's CSS
 * is scoped to the frame and their scripts run.
 *
 * Sandboxing: allow-same-origin is required, not merely convenient — the
 * shortcode forms POST JSON to /api/leads, and a cross-origin fetch would be
 * blocked by CORS preflight. It does mean frame content shares the site's
 * origin, which is acceptable here because only content.manage admins can author
 * a page, and this codebase already injects admin-authored JS into every public
 * page via the code.head / code.footer settings. The frame is an authoring
 * boundary (CSS isolation, working scripts), not a privilege boundary.
 */

const MIN_HEIGHT = 320;
const MAX_HEIGHT = 30000;

type Props = {
  /** Author HTML, with shortcodes already expanded. */
  html: string;
  title: string;
  /** Rendered above the frame; used for the admin editor to match production. */
  className?: string;
  /** Height of the frame when no height message has arrived yet. */
  initialHeight?: number;
};

export function HtmlPageFrame({
  html,
  title,
  className,
  initialHeight = 640,
}: Props) {
  // Stable per-instance id; the in-document runtime echoes it back so a page
  // with several frames never adopts another frame's height.
  const token = React.useId();
  const [height, setHeight] = React.useState(initialHeight);
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  const doc = React.useMemo(
    () => buildDocument({ html, title, token }),
    [html, title, token]
  );

  React.useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as
        | { type?: string; token?: string; height?: number }
        | undefined;
      if (!data || typeof data !== "object") return;

      if (data.type === "climbix:height") {
        if (data.token !== token) return;
        const next = Number(data.height);
        if (!Number.isFinite(next)) return;
        setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(next))));
        return;
      }

      if (data.type === "climbix:open-chat") {
        // Re-emit on our own window so the assistant widget can open itself.
        window.dispatchEvent(new CustomEvent("climbix:open-chat"));
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [token]);

  return (
    <iframe
      ref={frameRef}
      title={title || "Page content"}
      srcDoc={doc}
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      style={{ height: `${height}px` }}
      className={
        className ??
        "block w-full border-0 bg-white"
      }
    />
  );
}