"use client";

import * as React from "react";
import { buildDocument } from "@/lib/shortcodes";

/**
 * Renders an admin-authored complete-HTML page inside a frame.
 *
 * This is the path for a pasted standalone HTML file. It has to be a frame:
 * such files routinely carry global resets — `*{margin:0}`, `body{...}`,
 * `a{text-decoration:none}`, `button{border:0}` — which cannot be contained by
 * @scope, and scripts written against `document.addEventListener('DOMContentLoaded')`,
 * which never fires for a script injected after hydration. A frame gives each
 * page its own document, so the file behaves exactly as it does standalone.
 *
 * allow-same-origin is required, not cosmetic: the generated forms POST JSON to
 * /api/leads, and a cross-origin fetch would fail CORS preflight. It does mean
 * frame content shares the site's origin, which is acceptable because only
 * content.manage admins can author a page and this codebase already injects
 * admin-authored JS into every public page via code.head/code.footer.
 */

const MIN_HEIGHT = 320;
const MAX_HEIGHT = 30000;

type Props = {
  /** Author HTML, with shortcodes already expanded. */
  html: string;
  title: string;
  className?: string;
  initialHeight?: number;
};

export function HtmlPageFrame({
  html,
  title,
  className,
  initialHeight = 640,
}: Props) {
  // Stable per-instance id, echoed by the in-frame runtime so a page with
  // several frames never adopts another frame's height.
  const token = React.useId();
  const [height, setHeight] = React.useState(initialHeight);

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
        // The assistant widget lives in the host page, not the frame.
        window.dispatchEvent(new CustomEvent("climbix:open-chat"));
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [token]);

  return (
    <iframe
      title={title || "Page content"}
      srcDoc={doc}
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      style={{ height: `${height}px` }}
      className={className ?? "block w-full border-0 bg-white"}
    />
  );
}