"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string; // HTML content
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

function ToolbarButtonComponent({
  onClick,
  isActive,
  icon: Icon,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  icon: typeof Bold;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "size-8 rounded-md flex items-center justify-center transition-colors",
        isActive
          ? "bg-brand-500 text-white"
          : "text-slate-600 hover:bg-slate-200"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your content...",
  className,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 underline hover:text-brand-700",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-slate-400 before:float-left before:h-0 before:pointer-events-none",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-ul:list-disc prose-ol:list-decimal prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-muted prose-blockquote:p-3 prose-blockquote:rounded prose-img:rounded-lg",
      },
    },
  });

  // Update editor content when value prop changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border border-slate-200 rounded-lg min-h-[300px] bg-slate-50 animate-pulse" />
    );
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
  };

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setLinkDialogOpen(true);
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setImageDialogOpen(false);
    setImageUrl("");
  };

  const onImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);

    try {
      const res = await fetch("/api/media", { method: "POST", body: formData });
      const data = await res.json();
      if (data.media) {
        editor.chain().focus().setImage({ src: data.media.url }).run();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const ToolbarButton = ToolbarButtonComponent;

  return (
    <div className={cn("border border-slate-200 rounded-lg overflow-hidden bg-white", className)}>
      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          title="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          title="Redo"
        />
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          icon={Strikethrough}
          title="Strikethrough"
        />
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          title="Heading 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
          title="Heading 3"
        />
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
          title="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
          title="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          icon={Code}
          title="Code Block"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus}
          title="Horizontal Rule"
        />
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <ToolbarButton
          onClick={openLinkDialog}
          isActive={editor.isActive("link")}
          icon={LinkIcon}
          title="Add Link"
        />
        <ToolbarButton
          onClick={() => setImageDialogOpen(true)}
          icon={ImageIcon}
          title="Insert Image"
        />
      </div>

      {/* Editor */}
      <div className="prose-container">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
            {editor.isActive("link") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setLinkDialogOpen(false);
                  setLinkUrl("");
                }}
              >
                Remove link
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addLink} className="bg-brand-600 hover:bg-brand-700 text-white">
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              type="url"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
            <div className="text-xs text-slate-500 text-center">or</div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="size-4" />
              Upload from Media Library
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addImage} className="bg-brand-600 hover:bg-brand-700 text-white">
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
