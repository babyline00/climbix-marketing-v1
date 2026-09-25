"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FolderTree,
  Edit,
  Trash2,
  ChevronRight,
  Loader2,
  Save,
  Folder,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Category = {
  id: string;
  name: string;
  slug: string;
  type: string;
  parentId: string | null;
  order: number;
  children?: Category[];
};

type EditorState = {
  open: boolean;
  category: Category | null;
  name: string;
  slug: string;
  type: string;
  parentId: string | null;
  saving: boolean;
};

const DEFAULT_STATE: EditorState = {
  open: false,
  category: null,
  name: "",
  slug: "",
  type: "blog",
  parentId: null,
  saving: false,
};

const TYPE_LABELS: Record<string, string> = {
  blog: "Blog Category",
  page: "Page Category",
  industry: "Industry",
  service: "Service",
};

export function AdminCategories() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editor, setEditor] = React.useState<EditorState>(DEFAULT_STATE);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    new Set()
  );

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
      // Expand all by default
      setExpandedIds(new Set((data.categories || []).map((c: Category) => c.id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openNew = (parentId: string | null = null) => {
    setEditor({
      ...DEFAULT_STATE,
      open: true,
      parentId,
      type: parentId
        ? categories.find((c) => c.id === parentId)?.type || "blog"
        : "blog",
    });
  };

  const openEdit = (cat: Category) => {
    setEditor({
      open: true,
      category: cat,
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      parentId: cat.parentId,
      saving: false,
    });
  };

  const save = async () => {
    if (!editor.name || !editor.slug) return;
    setEditor({ ...editor, saving: true });

    try {
      const body = {
        name: editor.name,
        slug: editor.slug,
        type: editor.type,
        parentId: editor.parentId || null,
      };

      if (editor.category) {
        await fetch(`/api/categories/${editor.category.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      await fetchCategories();
      setEditor(DEFAULT_STATE);
    } catch (e) {
      console.error(e);
    } finally {
      setEditor((s) => ({ ...s, saving: false }));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this category and all its subcategories?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      await fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const renderCategory = (cat: Category, level = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedIds.has(cat.id);

    return (
      <div key={cat.id}>
        <div
          className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-lg group"
          style={{ paddingLeft: `${12 + level * 24}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(cat.id)}
              className="size-5 flex items-center justify-center text-slate-400 hover:text-slate-700"
            >
              <ChevronRight
                className={`size-4 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          ) : (
            <div className="size-5" />
          )}

          {isExpanded && hasChildren ? (
            <FolderOpen className="size-4 text-brand-500" />
          ) : (
            <Folder className="size-4 text-slate-400" />
          )}

          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-slate-900">
              {cat.name}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              /{cat.slug}
            </span>
          </div>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {TYPE_LABELS[cat.type] || cat.type}
          </span>

          {hasChildren && (
            <span className="text-[10px] text-slate-400">
              {cat.children!.length} sub
            </span>
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => openNew(cat.id)}
              title="Add subcategory"
            >
              <Plus className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => openEdit(cat)}
            >
              <Edit className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => onDelete(cat.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {cat.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalCategories = React.useMemo(() => {
    let count = 0;
    const countRecursive = (cats: Category[]) => {
      for (const c of cats) {
        count++;
        if (c.children) countRecursive(c.children);
      }
    };
    countRecursive(categories);
    return count;
  }, [categories]);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCategories} total categories · {categories.length} top-level
          </p>
        </div>
        <Button
          onClick={() => openNew(null)}
          className="bg-brand-600 hover:bg-brand-700 text-white"
        >
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      {/* Tree */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderTree className="size-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              No categories yet. Create your first category to organize your
              content.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-3">
            <div className="space-y-0.5">
              {categories.map((cat) => renderCategory(cat))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor dialog */}
      <Dialog
        open={editor.open}
        onOpenChange={(open) => !open && setEditor(DEFAULT_STATE)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editor.category ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {editor.category
                ? "Update category details"
                : editor.parentId
                  ? "Create a new subcategory"
                  : "Create a new top-level category"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input
                value={editor.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditor({
                    ...editor,
                    name,
                    slug:
                      editor.category && editor.slug
                        ? editor.slug
                        : name
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-"),
                  });
                }}
                placeholder="SEO Strategy"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Slug *</Label>
              <Input
                value={editor.slug}
                onChange={(e) =>
                  setEditor({ ...editor, slug: e.target.value })
                }
                placeholder="seo-strategy"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select
                value={editor.type}
                onValueChange={(v) => setEditor({ ...editor, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Category</SelectItem>
                  <SelectItem value="page">Page Category</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editor.parentId && (
              <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5">
                Subcategory of:{" "}
                <span className="font-medium text-slate-700">
                  {categories.find((c) => c.id === editor.parentId)?.name}
                </span>
              </div>
            )}
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
              disabled={editor.saving || !editor.name || !editor.slug}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {editor.saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editor.category ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
