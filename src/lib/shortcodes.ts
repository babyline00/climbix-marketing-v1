/**
 * Shortcodes for complete-HTML landing pages.
 *
 * A page in "document" render mode is authored as one full HTML file — doctype,
 * head, styles, scripts and all. That file is rendered in a sandboxed frame so
 * the author's CSS is isolated from the site chrome and their <script> tags
 * actually run (which they would not via dangerouslySetInnerHTML).
 *
 * Inside that file, shortcodes expand to working markup:
 *
 *     <h1>Book a call</h1>
 *     [lead_form title="Get your free audit"]
 *     [cta label="See pricing" href="/pricing" variant="secondary"]
 *     [attachment name="proposal.pdf"]
 *
 * Everything in this module is pure and browser-safe so the admin live preview
 * and the public renderer expand shortcodes through exactly the same code.
 * Resolving a shortcode to a real file is the caller's job: it loads the media
 * and document rows and hands them over as lookup indexes (see page-assets.ts).
 */

/**
 * How a page's content is rendered.
 *
 * - `inline`   — content is injected into the page DOM. Rich text and HTML
 *                fragments work; <script> tags do not execute. This is the
 *                existing behaviour and stays the default.
 * - `document` — content is a complete HTML file rendered in a sandboxed frame.
 *                Full CSS and working scripts, plus shortcode expansion.
 */
export const PAGE_RENDER_MODES = ["inline", "document"] as const;
export type PageRenderMode = (typeof PAGE_RENDER_MODES)[number];
export const DEFAULT_RENDER_MODE: PageRenderMode = "inline";

/**
 * Character ceiling for stored page content. A complete landing page carries
 * its own CSS and JS inline, so this is much larger than the rich-text case,
 * but still well under Vercel's 4.5 MB request-body cap.
 */
export const MAX_PAGE_CONTENT_CHARS = 200_000;

/** Coerce an incoming render mode, or null when it is not one we accept. */
export function normalizeRenderMode(value: unknown): PageRenderMode | null {
  if (value === undefined || value === null || value === "") return DEFAULT_RENDER_MODE;
  const mode = String(value).toLowerCase();
  return (PAGE_RENDER_MODES as readonly string[]).includes(mode)
    ? (mode as PageRenderMode)
    : null;
}

/** A media library or document row, reduced to what a shortcode needs. */
export type ShortcodeAsset = {
  url: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

export type ShortcodeContext = {
  /** Slug of the page being rendered — used to tag submissions. */
  slug: string;
  pageTitle: string;
  siteName: string;
  phone?: string;
  email?: string;
  /** Whether the AI assistant is enabled; [chat] is omitted when it is not. */
  agentEnabled: boolean;
};

/** Exact-then-loose lookup so authors can write a short, memorable name. */
export type AssetIndex = {
  exact: Map<string, ShortcodeAsset>;
  loose: Map<string, ShortcodeAsset>;
};

/** Build the lookup for one collection of assets. */
export function buildAssetIndex(
  rows: { id: string; url: string; name: string; mimeType?: string | null; size?: number | null }[]
): AssetIndex {
  const exact = new Map<string, ShortcodeAsset>();
  const loose = new Map<string, ShortcodeAsset>();

  for (const row of rows) {
    const asset: ShortcodeAsset = {
      url: row.url,
      name: row.name,
      mimeType: row.mimeType ?? null,
      size: row.size ?? null,
    };

    // Uploaded rows are often renamed after upload ("NexaCloud-logo.png") while
    // the stored file keeps the seeded slug ("brand-nexacloud-1790...png").
    // Derive aliases from both so authors can use whichever they see.
    const urlBase = row.url.split("/").pop() || "";
    const bases = [row.name, urlBase].filter(Boolean);

    const candidates: string[] = [row.id, row.name, row.url];
    for (const base of bases) {
      candidates.push(
        base,
        base.replace(/\.[a-z0-9]+$/i, ""),
        // "brand-nexacloud-1790758989433.png" -> "brand-nexacloud"
        base.replace(/-\d{10,}(\.[a-z0-9]+)?$/i, ""),
        base.replace(/\.[a-z0-9]+$/i, "").replace(/-\d{10,}$/, "")
      );
    }

    for (const candidate of candidates) {
      if (!candidate) continue;
      if (!exact.has(candidate)) exact.set(candidate, asset);
      const key = looseKey(candidate);
      if (key && !loose.has(key)) loose.set(key, asset);
    }
  }

  return { exact, loose };
}

/** Lowercase and drop every non-alphanumeric character, for fuzzy matching. */
function looseKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function lookupAsset(
  index: AssetIndex | undefined,
  name: string | undefined
): ShortcodeAsset | null {
  if (!index || !name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  const direct = index.exact.get(trimmed);
  if (direct) return direct;

  // Try progressively looser forms: drop a path, drop an extension.
  const withoutPath = trimmed.replace(/^https?:\/\/[^/]+/, "").replace(/^\/+/, "");
  for (const candidate of [
    withoutPath,
    withoutPath.replace(/\.[a-z0-9]+$/i, ""),
    withoutPath.replace(/-\d{10,}(\.[a-z0-9]+)?$/i, ""),
  ]) {
    const hit = index.exact.get(candidate);
    if (hit) return hit;
  }

  const loose = looseKey(withoutPath);
  return (loose && index.loose.get(loose)) || null;
}

// ─────────────────────────────────────────────────────────────
// Escaping — every interpolated value is escaped before it reaches
// the document, so a shortcode attribute can never inject markup.
// ─────────────────────────────────────────────────────────────

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!
  );
}

/** Same as escapeHtml but for values placed inside a double-quoted attribute. */
function attr(value: unknown): string {
  return escapeHtml(value).replace(/\n/g, "&#10;");
}

// ─────────────────────────────────────────────────────────────
// Parsing
// ─────────────────────────────────────────────────────────────

type Attrs = Record<string, string>;

/**
 * Matches either an escaped literal ([[lead_form]]) or a shortcode with an
 * optional quoted-attribute list. Unquoted attribute values stop at whitespace.
 */
const TAG_RE =
  /\[\[([\s\S]+?)\]\]|\[([a-z_][a-z0-9_]*)((?:\s+[a-z_][a-z0-9_]*\s*=\s*(?:"[^"]*"|'[^']*'|[^\s\]"']+))*)\s*\]/gi;

const ATTR_RE =
  /([a-z_][a-z0-9_]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]"']+))/gi;

function parseAttrs(source: string): Attrs {
  const attrs: Attrs = {};
  if (!source) return attrs;
  ATTR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ATTR_RE.exec(source)) !== null) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

/** True when the string looks like a complete HTML document, not a fragment. */
export function isCompleteDocument(html: string): boolean {
  return /^\s*(<!doctype\s+html|<html[\s>])/i.test(html);
}

// ─────────────────────────────────────────────────────────────
// Generated markup
// ─────────────────────────────────────────────────────────────

/**
 * Base styles for shortcode-generated components.
 *
 * Every rule is nested inside a native CSS @scope block rooted at
 * .sc-doc-page. Document mode renders inline (so React-backed shortcodes can
 * use the site's Tailwind build and Radix portals), which means author CSS is
 * no longer confined to a frame — scoping is what keeps a landing page's
 * stylesheet from restyling the site header and footer.
 *
 * @scope is supported in Chrome/Edge 118+, Safari 17.4+ and Firefox 128+.
 * Where it is unsupported the whole block is dropped and these base styles
 * simply do not apply; the generated markup still reads correctly because it
 * carries its own layout classes.
 */
const SHORTCODE_CSS = `
@scope (.sc-doc-page) {
.sc-form{max-width:38rem;font-family:inherit}
.sc-form h3{margin:0 0 .75rem;font-size:1.25rem;font-weight:700;line-height:1.25}
.sc-field{display:block;margin-bottom:.75rem}
.sc-field > span{display:block;margin-bottom:.3rem;font-size:.8125rem;font-weight:600;opacity:.75}
.sc-field input,.sc-field textarea,.sc-field select{width:100%;padding:.6rem .75rem;font:inherit;font-size:.9375rem;color:inherit;background:rgba(127,127,127,.08);border:1px solid rgba(127,127,127,.35);border-radius:.5rem;box-sizing:border-box}
.sc-field textarea{min-height:6rem;resize:vertical}
.sc-field input:focus,.sc-field textarea:focus{outline:2px solid #ff6b2c;outline-offset:1px;border-color:transparent}
.sc-row{display:flex;gap:.75rem;flex-wrap:wrap}
.sc-row > .sc-field{flex:1 1 12rem}
.sc-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.7rem 1.4rem;font:inherit;font-size:.9375rem;font-weight:600;line-height:1.2;text-decoration:none;border:1px solid transparent;border-radius:.5rem;cursor:pointer;transition:opacity .15s ease,transform .15s ease}
.sc-btn:hover{opacity:.9}
.sc-btn:active{transform:translateY(1px)}
.sc-btn:focus-visible{outline:2px solid #ff6b2c;outline-offset:2px}
.sc-btn--primary{background:#ff6b2c;color:#fff}
.sc-btn--secondary{background:transparent;color:#ff6b2c;border-color:#ff6b2c}
.sc-btn--ghost{background:rgba(127,127,127,.12);color:inherit;border-color:rgba(127,127,127,.3)}
.sc-btn[disabled]{opacity:.6;cursor:not-allowed}
.sc-btn-row{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;margin-top:1rem}
.sc-status{margin:.75rem 0 0;font-size:.875rem;min-height:1.25em}
.sc-status--ok{color:#16a34a}
.sc-status--err{color:#dc2626}
.sc-img{max-width:100%;height:auto;border-radius:.5rem;display:block}
.sc-missing{display:inline-block;padding:.35rem .6rem;font-size:.8125rem;font-family:ui-monospace,monospace;border:1px dashed rgba(127,127,127,.5);border-radius:.375rem;opacity:.7}
.sc-files{display:grid;gap:.5rem;margin:1rem 0;padding:0;list-style:none}
.sc-file{display:flex;align-items:center;gap:.75rem;padding:.7rem .9rem;border:1px solid rgba(127,127,127,.28);border-radius:.5rem;text-decoration:none;color:inherit}
.sc-file:hover{border-color:#ff6b2c}
.sc-file-name{font-weight:600;font-size:.9375rem}
.sc-file-meta{font-size:.8125rem;opacity:.7}
.sc-hint{font-size:.8125rem;opacity:.7;margin-top:.5rem}
}
`;

function humanSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 1024) return "";
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

function missingAsset(label: string, kind: string): string {
  return `<span class="sc-missing" title="Pick a file that exists in the ${attr(kind)}">[${attr(label)} not found]</span>`;
}

function textField(
  name: string,
  label: string,
  type: string,
  required: boolean
): string {
  return `<label class="sc-field"><span>${escapeHtml(label)}</span><input type="${attr(type)}" name="${attr(name)}"${required ? " required" : ""} autocomplete="${attr(type === "email" ? "email" : "on")}"></label>`;
}

function leadFormHtml(attrs: Attrs, ctx: ShortcodeContext): string {
  const title = attrs.title || "Request more information";
  const button = attrs.button || "Send request";
  const source = attrs.source || `page-${ctx.slug}`;
  const showMessage = attrs.message !== "false";
  const compact = attrs.compact === "true";

  return `<form class="sc-form" data-sc-form="leads" data-sc-source="${attr(source)}" novalidate>
  <h3>${escapeHtml(title)}</h3>
  <div class="sc-row">
    ${textField("name", "Name", "text", true)}
    ${textField("email", "Email", "email", true)}
  </div>
  ${
    compact
      ? ""
      : `<div class="sc-row">
    ${textField("company", "Company", "text", false)}
    ${textField("phone", "Phone", "tel", false)}
  </div>`
  }
  ${
    showMessage
      ? `<label class="sc-field"><span>How can we help?</span><textarea name="message" rows="4"></textarea></label>`
      : ""
  }
  <div class="sc-btn-row"><button type="submit" class="sc-btn sc-btn--primary">${escapeHtml(button)}</button></div>
  <p class="sc-status" role="status" aria-live="polite"></p>
</form>`;
}

function meetingFormHtml(attrs: Attrs, ctx: ShortcodeContext): string {
  const title = attrs.title || "Book a strategy call";
  const button = attrs.button || "Book the call";
  const source = attrs.source || `page-${ctx.slug}-booking`;

  return `<form class="sc-form" data-sc-form="meetings" data-sc-source="${attr(source)}" novalidate>
  <h3>${escapeHtml(title)}</h3>
  <div class="sc-row">
    ${textField("name", "Name", "text", true)}
    ${textField("email", "Email", "email", true)}
  </div>
  <div class="sc-row">
    ${textField("date", "Preferred date", "date", true)}
    ${textField("time", "Preferred time", "time", true)}
  </div>
  ${textField("company", "Company", "text", false)}
  <label class="sc-field"><span>Anything we should know?</span><textarea name="notes" rows="3"></textarea></label>
  <div class="sc-btn-row"><button type="submit" class="sc-btn sc-btn--primary">${escapeHtml(button)}</button></div>
  <p class="sc-status" role="status" aria-live="polite"></p>
</form>`;
}

function ctaHtml(attrs: Attrs): string {
  const label = attrs.label || attrs.text || "Learn more";
  const href = attrs.href || attrs.url || "#";
  const variant = ["primary", "secondary", "ghost"].includes(attrs.variant)
    ? attrs.variant
    : "primary";
  const target = attrs.newtab === "true" ? ' target="_blank" rel="noopener noreferrer"' : "";
  const style = attrs.style ? ` style="${attr(attrs.style)}"` : "";
  const className = attrs.class ? ` ${attr(attrs.class)}` : "";

  return `<a class="sc-btn sc-btn--${attr(variant)}${className}" href="${attr(href)}"${target}${style}>${escapeHtml(label)}</a>`;
}

function imageHtml(attrs: Attrs, media: AssetIndex | undefined): string {
  const name = attrs.name || attrs.file || attrs.src;
  const asset = lookupAsset(media, name);

  if (!asset) return missingAsset(attrs.name || "image", "media library");

  const width = attrs.width ? ` width="${attr(attrs.width)}"` : "";
  const height = attrs.height ? ` height="${attr(attrs.height)}"` : "";
  const className = attrs.class ? ` ${attr(attrs.class)}` : "";
  const style = attrs.style ? ` style="${attr(attrs.style)}"` : "";

  // Always eager. The frame is fitted to its content height, so its "viewport"
  // is the whole document and lazy loading buys nothing — but worse, IntersectionObserver
  // never fires in a srcDoc frame whose height is set from the parent, so a
  // lazy image stays at naturalWidth 0 permanently. Verified in Chromium.
  return `<img class="sc-img${className}" src="${attr(asset.url)}" alt="${attr(attrs.alt || asset.name)}"${width}${height} loading="eager" decoding="async"${style}>`;
}

function attachmentHtml(attrs: Attrs, documents: AssetIndex | undefined): string {
  const name = attrs.name || attrs.file;
  const asset = lookupAsset(documents, name);
  if (!asset) return missingAsset(attrs.name || "attachment", "document library");

  const label = attrs.label || asset.name;
  const size = humanSize(asset.size);
  return `<a class="sc-file" href="${attr(asset.url)}" download>
  <span class="sc-file-name">${escapeHtml(label)}</span>
  ${size ? `<span class="sc-file-meta">${escapeHtml(size)}</span>` : ""}
  <span class="sc-file-meta" style="margin-left:auto">Download</span>
</a>`;
}

/** Every document in a category, or all of them when no category is given. */
function attachmentsListHtml(
  attrs: Attrs,
  _documents: AssetIndex | undefined,
  allDocuments: ShortcodeAsset[]
): string {
  const category = attrs.category;
  const pool = category
    ? allDocuments.filter((doc) =>
        looseKey(doc.name).includes(looseKey(category)) ||
        looseKey(doc.name).startsWith(looseKey(category))
      )
    : allDocuments;

  if (pool.length === 0) {
    return `<span class="sc-missing">[no ${escapeHtml(category || "documents")} found]</span>`;
  }

  const items = pool
    .slice(0, Number(attrs.limit) > 0 ? Number(attrs.limit) : 50)
    .map((doc) => {
      const size = humanSize(doc.size);
      return `<li><a class="sc-file" href="${attr(doc.url)}" download>
  <span class="sc-file-name">${escapeHtml(doc.name)}</span>
  ${size ? `<span class="sc-file-meta">${escapeHtml(size)}</span>` : ""}
  <span class="sc-file-meta" style="margin-left:auto">Download</span>
</a></li>`;
    })
    .join("\n");

  return `<ul class="sc-files">\n${items}\n</ul>`;
}

/** Opens the site's AI assistant. Rendered only when the agent is enabled,
 *  because the widget is not mounted at all when it is off — a button that
 *  silently does nothing is worse than no button. */
function chatHtml(attrs: Attrs, ctx: ShortcodeContext): string {
  if (!ctx.agentEnabled) return "";
  const label = attrs.label || "Chat with us";
  return `<button type="button" class="sc-btn sc-btn--primary" data-sc-chat>${escapeHtml(label)}</button>`;
}

/**
 * Shortcodes that render as real React components rather than static markup.
 *
 * These cannot be plain HTML: they rely on React state, Tailwind utilities and
 * Radix portals (the growth plan's budget dropdown renders into document.body).
 * They expand to a placeholder element carrying its configuration in data
 * attributes, and the page renderer mounts the matching component into it.
 */
export const REACT_SHORTCODE_TAGS = ["growth_plan"] as const;
export type ReactShortcodeTag = (typeof REACT_SHORTCODE_TAGS)[number];

const REACT_SHORTCODE_SET: ReadonlySet<string> = new Set(REACT_SHORTCODE_TAGS);

/** True when `html` contains at least one React-backed shortcode. */
export function hasReactShortcode(html: string): boolean {
  if (!html) return false;
  TAG_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TAG_RE.exec(html)) !== null) {
    if (match[1] !== undefined) continue; // [[escaped]]
    if (match[2] && REACT_SHORTCODE_SET.has(match[2].toLowerCase())) return true;
  }
  return false;
}

/** Placeholder element that the renderer swaps for a real component. */
function reactShortcodeHtml(name: string, attrs: Attrs): string {
  const props: Record<string, string> = { "data-sc-react": name };
  // Options ride along as data attributes so the placeholder stays inert HTML.
  for (const [key, value] of Object.entries(attrs)) {
    props[`data-sc-${key.toLowerCase()}`] = value;
  }
  const serialized = Object.entries(props)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");
  return `<div ${serialized}></div>`;
}

function contactHtml(kind: "email" | "phone", attrs: Attrs, ctx: ShortcodeContext): string {
  if (kind === "email") {
    const address = attrs.address || ctx.email;
    if (!address) return missingAsset("email", "site settings");
    return `<a href="${attr(`mailto:${address}`)}">${escapeHtml(attrs.label || address)}</a>`;
  }
  const number = (attrs.number || ctx.phone || "").replace(/[^\d+]/g, "");
  if (!number) return missingAsset("phone", "site settings");
  return `<a href="${attr(`tel:${number}`)}">${escapeHtml(attrs.label || ctx.phone)}</a>`;
}

/** Expand every shortcode in `html`. Unknown names are left untouched so a
 *  typo is visible in the rendered page instead of vanishing. */
export function expandShortcodes(
  html: string,
  ctx: ShortcodeContext,
  assets: { media?: AssetIndex; documents?: AssetIndex; allDocuments?: ShortcodeAsset[] } = {}
): string {
  if (!html) return html;
  const { media, documents } = assets;
  const allDocuments = assets.allDocuments ?? [];

  return html.replace(TAG_RE, (whole, literal: string | undefined, rawName: string | undefined, rawAttrs: string | undefined) => {
    if (literal !== undefined) return `[${literal}]`;
    if (!rawName) return whole;

    const name = rawName.toLowerCase();
    const attrs = parseAttrs(rawAttrs || "");

    if (REACT_SHORTCODE_SET.has(name)) {
      return reactShortcodeHtml(name, attrs);
    }

    switch (name) {
      case "lead_form":
      case "form":
        return leadFormHtml(attrs, ctx);
      case "meeting_form":
      case "book":
        return meetingFormHtml(attrs, ctx);
      case "cta":
      case "button":
        return ctaHtml(attrs);
      case "image":
        return imageHtml(attrs, media);
      case "attachment":
        return attachmentHtml(attrs, documents);
      case "attachments":
        return attachmentsListHtml(attrs, documents, allDocuments);
      case "chat":
        return chatHtml(attrs, ctx);
      case "email":
        return contactHtml("email", attrs, ctx);
      case "phone":
        return contactHtml("phone", attrs, ctx);
      case "site_name":
        return escapeHtml(ctx.siteName);
      case "year":
        return String(new Date().getFullYear());
      default:
        return whole;
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Document assembly
// ─────────────────────────────────────────────────────────────

/**
 * Behaviour for shortcode-generated forms and the chat bridge. Written as a
 * string so it can be injected into the host document and run there, alongside
 * the markup it operates on.
 *
 * Document mode renders inline rather than in a frame, so there is no height
 * bridge: the page grows normally as content loads.
 */
function runtimeScript(): string {
  return `
(function(){

  function setStatus(form, message, kind){
    var el = form.querySelector('.sc-status');
    if(!el) return;
    el.textContent = message;
    el.className = 'sc-status' + (kind ? ' sc-status--' + kind : '');
  }

  function fieldValues(form){
    var out = {};
    var nodes = form.querySelectorAll('input, textarea, select');
    for (var i = 0; i < nodes.length; i++){
      var el = nodes[i];
      if (!el.name) continue;
      out[el.name] = el.value;
    }
    return out;
  }

  function submit(form){
    var button = form.querySelector('button[type="submit"]');
    var endpoint = form.getAttribute('data-sc-form') === 'meetings' ? '/api/meetings' : '/api/leads';
    var payload = fieldValues(form);
    payload.source = form.getAttribute('data-sc-source') || 'landing-page';

    if (button){ button.disabled = true; }
    setStatus(form, 'Sending...', null);

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(res){
      return res.json().catch(function(){ return {}; }).then(function(body){
        return { ok: res.ok, status: res.status, body: body };
      });
    }).then(function(result){
      if (button){ button.disabled = false; }
      if (result.ok){
        var dup = result.body && result.body.duplicate;
        setStatus(form, dup
          ? 'Thanks — we already have your details and will be in touch.'
          : 'Thank you. We will be in touch shortly.', 'ok');
        form.reset();
        return;
      }
      var message = (result.body && result.body.error) ||
        'Something went wrong. Please try again or email us directly.';
      if (result.status === 429) message = 'Too many submissions from this device — please try again shortly.';
      setStatus(form, message, 'err');
    }).catch(function(){
      if (button){ button.disabled = false; }
      setStatus(form, 'Network error. Please check your connection and try again.', 'err');
    });
  }

  document.addEventListener('submit', function(event){
    var form = event.target;
    if (!form || !form.getAttribute || !form.getAttribute('data-sc-form')) return;
    event.preventDefault();
    submit(form);
  });

  document.addEventListener('click', function(event){
    var target = event.target && event.target.closest ? event.target.closest('[data-sc-chat]') : null;
    if (!target) return;
    event.preventDefault();
    // The assistant widget listens for this on the same window now that
    // document mode renders inline.
    window.dispatchEvent(new CustomEvent('climbix:open-chat'));
  });

})();
`;
}

export type AuthorAssets = {
  /** Markup destined for the page body. */
  html: string;
  /** Contents of author <style> blocks, in source order. */
  styles: string[];
  /** Bodies of author <script> blocks, in source order. */
  scripts: string[];
  /** Author <title>, when present. */
  title: string | null;
  /** Author <meta> tags, preserved so og:/description survive. */
  metas: string[];
};

/**
 * Split a complete HTML file into the pieces the page renderer needs.
 *
 * Document mode renders inline rather than in a frame, because React-backed
 * shortcodes (the growth plan form) need the site's Tailwind build, React
 * runtime and Radix portals — none of which exist inside a srcDoc frame. An
 * earlier iframe version worked for static markup but could never host a real
 * component, and the Radix budget dropdown would have rendered outside the
 * frame entirely.
 *
 * Inlining costs CSS isolation, so author <style> blocks are returned for the
 * renderer to inject rather than left inline where cascade order would be
 * unpredictable. <script> bodies are returned for the same reason: script tags
 * inserted via innerHTML never execute.
 */
export function extractAuthorAssets(source: string): AuthorAssets {
  const input = source ?? "";
  const styles: string[] = [];
  const scripts: string[] = [];
  const metas: string[] = [];
  let title: string | null = null;

  let html = input
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_all, body: string) => {
      if (body.trim()) styles.push(body);
      return "";
    })
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_all, body: string) => {
      if (body.trim()) scripts.push(body);
      return "";
    })
    .replace(/<title\b[^>]*>([\s\S]*?)<\/title>/gi, (_all, body: string) => {
      if (!title) title = body.trim();
      return "";
    })
    .replace(/<meta\b[^>]*>/gi, (tag: string) => {
      // Only carry metadata that describes the page; viewport/charset are the
      // host document's business and would duplicate.
      if (/<meta[^>]+(?:name|property)\s*=/i.test(tag)) metas.push(tag);
      return "";
    })
    .replace(/<!doctype\s+html>/gi, "")
    .replace(/<html\b[^>]*>/gi, "")
    .replace(/<\/html\s*>/gi, "")
    .replace(/<head\b[^>]*>/gi, "")
    .replace(/<\/head\s*>/gi, "")
    .replace(/<body\b[^>]*>/gi, "")
    .replace(/<\/body\s*>/gi, "");

  return { html: html.trim(), styles, scripts, title, metas };
}

/**
 * Shortcode base styles plus the form/chat runtime, as a single style and
 * script pair for the host document. Scoped to .sc-doc-page so the generated
 * components cannot restyle the site chrome.
 */
export function shortcodeAssets(): { css: string; js: string } {
  return { css: SHORTCODE_CSS, js: runtimeScript() };
}

/** Reference shown in the admin editor, also used by the insert buttons. */
export const SHORTCODE_REFERENCE: {
  tag: string;
  summary: string;
  example: string;
}[] = [
  {
    tag: "growth_plan",
    summary:
      "Three-step Growth Plan form (services, details, goals). The full interactive component.",
    example: '[growth_plan variant="hero" source="page-landing"]',
  },
  {
    tag: "lead_form",
    summary: "Lead capture form. Posts to the CRM with scoring and alerts.",
    example: '[lead_form title="Get your free audit" button="Request audit"]',
  },
  {
    tag: "meeting_form",
    summary: "Strategy-call booking form. Posts to /api/meetings.",
    example: '[meeting_form title="Book a call"]',
  },
  {
    tag: "cta",
    summary: "Call-to-action button.",
    example: '[cta label="See pricing" href="/pricing" variant="secondary"]',
  },
  {
    tag: "image",
    summary: "Image from the media library.",
    example: '[image name="brand-nexacloud" alt="NexaCloud"]',
  },
  {
    tag: "attachment",
    summary: "Download link for one document.",
    example: '[attachment name="proposal.pdf" label="Download proposal"]',
  },
  {
    tag: "attachments",
    summary: "List of documents, optionally filtered by category.",
    example: '[attachments category="proposal"]',
  },
  {
    tag: "chat",
    summary: "Button that opens the AI assistant (hidden when it is disabled).",
    example: "[chat label=\"Ask us anything\"]",
  },
  { tag: "email", summary: "Contact email link.", example: "[email]" },
  { tag: "phone", summary: "Contact phone link.", example: "[phone]" },
  { tag: "site_name", summary: "The configured brand name.", example: "[site_name]" },
  { tag: "year", summary: "Current year.", example: "[year]" },
];