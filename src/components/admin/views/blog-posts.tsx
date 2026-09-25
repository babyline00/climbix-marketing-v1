"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FileEdit,
  Edit,
  Trash2,
  Search,
  Loader2,
  Save,
  Star,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ARTICLES, type Article } from "@/data/blog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string | null;
  tags: string | null;
  author: string;
  heroImage: string | null;
  readTime: string;
  status: string;
  featured: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
};

const SYSTEM_POSTS: BlogPost[] = ARTICLES.map((article) => ({
  id: `system-${article.slug}`,
  title: article.title,
  slug: article.slug,
  excerpt: article.excerpt,
  content: "",
  category: article.category,
  tags: article.tags.join(", "),
  author: article.author.name,
  heroImage: article.heroImage,
  readTime: article.readTime,
  status: "published",
  featured: false,
  publishedAt: article.date,
  createdAt: article.date,
  updatedAt: article.date,
  isSystem: true,
}));

const GRADIENT_OPTIONS = [
  { value: "from-brand-500/20 to-brand-700/10", label: "Emerald" },
  { value: "from-violet-500/20 to-violet-700/10", label: "Violet" },
  { value: "from-amber-500/20 to-amber-700/10", label: "Amber" },
  { value: "from-sky-500/20 to-sky-700/10", label: "Sky" },
  { value: "from-rose-500/20 to-rose-700/10", label: "Rose" },
  { value: "from-orange-500/20 to-orange-700/10", label: "Green" },
];

type EditorState = {
  open: boolean;
  post: BlogPost | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  heroImage: string;
  readTime: string;
  status: string;
  featured: boolean;
  saving: boolean;
};

const DEFAULT_STATE: EditorState = {
  open: false,
  post: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "<p>Start writing your article...</p>",
  category: "SEO Strategy",
  tags: "",
  author: "Climbix Team",
  heroImage: "from-brand-500/20 to-brand-700/10",
  readTime: "5 min read",
  status: "published",
  featured: false,
  saving: false,
};

// Convert a static article's structured content into editor HTML so built-in
// posts open pre-filled with their real copy.
function sectionsToHTML(sections: Article["content"]): string {
  return sections
    .map((s) => {
      switch (s.type) {
        case "h2":
          return `<h2>${s.text}</h2>`;
        case "p":
          return `<p>${s.text}</p>`;
        case "ul":
          return `<ul>${s.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
        case "quote":
          return `<blockquote><p>${s.text}</p>${
            s.author ? `<footer>— ${s.author}</footer>` : ""
          }</blockquote>`;
        case "callout":
          return `<div><strong>${s.title}</strong><p>${s.text}</p></div>`;
        case "raw_html":
          return s.html;
        default:
          return "";
      }
    })
    .join("");
}

function staticPostHTML(slug: string): string {
  const article = ARTICLES.find((a) => a.slug === slug);
  return article ? sectionsToHTML(article.content) : "";
}

export function AdminBlogPosts() {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [editor, setEditor] = React.useState<EditorState>(DEFAULT_STATE);

  const fetchPosts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog-posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openNew = () => setEditor({ ...DEFAULT_STATE, open: true });

  const openEdit = (post: BlogPost) => {
    setEditor({
      open: true,
      post,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content:
        post.content ||
        (post.isSystem ? staticPostHTML(post.slug) : ""),
      category: post.category || "SEO Strategy",
      tags: post.tags || "",
      author: post.author,
      heroImage: post.heroImage || "from-brand-500/20 to-brand-700/10",
      readTime: post.readTime,
      status: post.status,
      featured: post.featured,
      saving: false,
    });
  };

  const save = async () => {
    if (!editor.title || !editor.slug) return;
    setEditor({ ...editor, saving: true });

    try {
      const body = {
        title: editor.title,
        slug: editor.slug,
        excerpt: editor.excerpt,
        content: editor.content,
        category: editor.category,
        tags: editor.tags,
        author: editor.author,
        heroImage: editor.heroImage,
        readTime: editor.readTime,
        status: editor.status,
        featured: editor.featured,
      };

      if (editor.post) {
        await fetch(`/api/blog-posts/${editor.post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/blog-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      await fetchPosts();
      setEditor(DEFAULT_STATE);
    } catch (e) {
      console.error(e);
    } finally {
      setEditor((s) => ({ ...s, saving: false }));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this blog post permanently?")) return;
    try {
      await fetch(`/api/blog-posts/${id}`, { method: "DELETE" });
      await fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = React.useMemo(() => {
    const customSlugs = new Set(posts.map((post) => post.slug));
    let result = [...SYSTEM_POSTS.filter((post) => !customSlugs.has(post.slug)), ...posts];
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, search, statusFilter]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Blog Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} total · {posts.filter((p) => p.status === "published").length} published ·{" "}
            {posts.filter((p) => p.featured).length} featured
          </p>
        </div>
        <Button onClick={openNew} className="bg-brand-600 hover:bg-brand-700 text-white">
          <Plus className="size-4" />
          Add New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search posts by title, slug, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileEdit className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {posts.length === 0
                ? "No blog posts yet. Create your first article."
                : "No posts match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                      Title
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3 hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                      Status
                    </th>
                    <th className="text-left font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3 hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-right font-semibold text-xs uppercase tracking-wider text-slate-500 px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {post.featured && (
                            <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-medium text-slate-900">
                              {post.title}
                            </div>
                            <div className="text-xs text-slate-400">
                              by {post.author} · {post.readTime}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {post.category || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            post.status === "published"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-500">
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {post.status === "published" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => window.open(`/blog/${post.slug}`, "_blank", "noopener,noreferrer")}
                              aria-label={`Preview ${post.title}`}
                            >
                              <Eye className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(post)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => onDelete(post.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor dialog */}
      <Dialog
        open={editor.open}
        onOpenChange={(open) => !open && setEditor(DEFAULT_STATE)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-none sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3 pr-6">
              <DialogTitle>
                {editor.post ? "Edit Blog Post" : "Create New Blog Post"}
              </DialogTitle>
              {editor.post?.status === "published" && (
                <Button variant="outline" size="sm" onClick={() => window.open(`/blog/${editor.slug}`, "_blank", "noopener,noreferrer")}>
                  <Eye className="size-3.5" /> Preview
                </Button>
              )}
            </div>
            <DialogDescription>
              {editor.post
                ? "Update post content and settings"
                : "Write a new blog article for your website"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input
                value={editor.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditor({
                    ...editor,
                    title,
                    slug:
                      editor.post && editor.slug
                        ? editor.slug
                        : title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-"),
                  });
                }}
                placeholder="The Complete SaaS SEO Strategy Guide"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label className="text-xs">Slug (URL) *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">/blog/</span>
                <Input
                  value={editor.slug}
                  onChange={(e) =>
                    setEditor({ ...editor, slug: e.target.value })
                  }
                  placeholder="saas-seo-strategy-guide"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <Label className="text-xs">Excerpt</Label>
              <Textarea
                value={editor.excerpt}
                onChange={(e) =>
                  setEditor({ ...editor, excerpt: e.target.value })
                }
                placeholder="Brief summary shown in blog listing..."
                className="min-h-[60px]"
              />
            </div>

            {/* Category + Author */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Input
                  value={editor.category}
                  onChange={(e) =>
                    setEditor({ ...editor, category: e.target.value })
                  }
                  placeholder="SEO Strategy"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Author</Label>
                <Input
                  value={editor.author}
                  onChange={(e) =>
                    setEditor({ ...editor, author: e.target.value })
                  }
                  placeholder="Climbix Team"
                />
              </div>
            </div>

            {/* Tags + Read Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input
                  value={editor.tags}
                  onChange={(e) =>
                    setEditor({ ...editor, tags: e.target.value })
                  }
                  placeholder="SEO, SaaS, Growth"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Read Time</Label>
                <Input
                  value={editor.readTime}
                  onChange={(e) =>
                    setEditor({ ...editor, readTime: e.target.value })
                  }
                  placeholder="5 min read"
                />
              </div>
            </div>

            {/* Hero Image */}
            <div className="space-y-1.5">
              <Label className="text-xs">Hero Image (gradient or URL)</Label>
              <div className="flex flex-wrap gap-2">
                {GRADIENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEditor({ ...editor, heroImage: opt.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      editor.heroImage === opt.value
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`inline-block size-3 rounded-full bg-gradient-to-br ${opt.value} mr-1.5 align-middle`}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
              <Input
                value={editor.heroImage}
                onChange={(e) =>
                  setEditor({ ...editor, heroImage: e.target.value })
                }
                placeholder="from-brand-500/20 to-brand-700/10 or /uploads/image.png"
                className="mt-2"
              />
            </div>

            {/* Status + Featured */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={editor.status}
                  onValueChange={(v) => setEditor({ ...editor, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Featured</Label>
                <div className="flex items-center h-9">
                  <button
                    onClick={() =>
                      setEditor({ ...editor, featured: !editor.featured })
                    }
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      editor.featured
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Star
                      className={`size-4 ${
                        editor.featured
                          ? "fill-amber-400 text-amber-400"
                          : ""
                      }`}
                    />
                    {editor.featured ? "Featured" : "Not featured"}
                  </button>
                </div>
              </div>
            </div>

            {/* Content (Rich Text Editor) */}
            <div className="space-y-1.5">
              <Label className="text-xs">Content</Label>
              <RichTextEditor
                value={editor.content}
                onChange={(html) =>
                  setEditor({ ...editor, content: html })
                }
                placeholder="Start writing your blog post..."
              />
              <p className="text-[11px] text-slate-500">
                Use the toolbar to format text, add headings, lists, links, and images.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditor(DEFAULT_STATE)}
              disabled={editor.saving}
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={editor.saving || !editor.title || !editor.slug}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {editor.saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editor.post ? "Update Post" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
