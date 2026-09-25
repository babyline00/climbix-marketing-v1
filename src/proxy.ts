import { NextRequest, NextResponse } from "next/server";
import { getRedirectMap, normalizeSource } from "@/lib/redirects";

/** URL redirect engine — resolves admin-managed 301/302 rules from the DB.
 *  Next.js 16 proxy.ts runs on the Node.js runtime, so using the Prisma
 *  client from here is supported. */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  try {
    const redirects = await getRedirectMap();
    if (Object.keys(redirects).length === 0) {
      return NextResponse.next();
    }

    const source = normalizeSource(pathname) + search;
    const rule = redirects[source] || redirects[normalizeSource(pathname)];

    if (rule) {
      const target = new URL(rule.destination, req.url);
      // Avoid infinite redirect loops
      if (
        target.origin !== req.nextUrl.origin ||
        normalizeSource(target.pathname) + target.search !== source
      ) {
        return NextResponse.redirect(target, rule.statusCode === 302 ? 302 : 301);
      }
    }
  } catch (e) {
    console.error("Redirect proxy error:", e);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml|uploads).*)"],
};