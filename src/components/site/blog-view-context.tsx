"use client";

import * as React from "react";

type BlogViewContextValue = {
  isBlogActive: boolean;
  blogView: "list" | "article";
  articleSlug: string | null;
  openBlog: () => void;
  openArticle: (slug: string) => void;
  closeBlog: () => void;
};

const BlogViewContext = React.createContext<BlogViewContextValue | null>(null);

export function BlogViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [articleSlug, setArticleSlug] = React.useState<string | null>(null);
  const [blogView, setBlogView] = React.useState<"list" | "article">("list");
  const [isBlogActive, setIsBlogActive] = React.useState(false);

  // Sync with URL hash: #blog (list) or #blog/<slug> (article)
  React.useEffect(() => {
    const check = () => {
      const hash = window.location.hash;
      if (hash === "#blog") {
        setIsBlogActive(true);
        setBlogView("list");
        setArticleSlug(null);
      } else if (hash.startsWith("#blog/")) {
        const slug = hash.slice("#blog/".length);
        setIsBlogActive(true);
        setBlogView("article");
        setArticleSlug(slug);
      } else {
        // Not a blog hash — close blog view
        setIsBlogActive(false);
        setBlogView("list");
        setArticleSlug(null);
      }
    };

    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  const openBlog = React.useCallback(() => {
    window.history.pushState(null, "", "#blog");
    setIsBlogActive(true);
    setBlogView("list");
    setArticleSlug(null);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const openArticle = React.useCallback((slug: string) => {
    window.history.pushState(null, "", `#blog/${slug}`);
    setIsBlogActive(true);
    setBlogView("article");
    setArticleSlug(slug);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const closeBlog = React.useCallback(() => {
    window.history.pushState(null, "", "#top");
    setIsBlogActive(false);
    setBlogView("list");
    setArticleSlug(null);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <BlogViewContext.Provider
      value={{
        isBlogActive,
        blogView,
        articleSlug,
        openBlog,
        openArticle,
        closeBlog,
      }}
    >
      {children}
    </BlogViewContext.Provider>
  );
}

export function useBlogView() {
  const ctx = React.useContext(BlogViewContext);
  if (!ctx) {
    throw new Error("useBlogView must be used within BlogViewProvider");
  }
  return ctx;
}
