"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { useEffect, useRef } from "react";
import { uploadNewsEditorMedia } from "@/actions/news";

type Props = {
  name: string;
  initialContent?: string;
  onChange?: (html: string) => void;
  uploadMedia?: (formData: FormData) => Promise<{ error?: string; url?: string }>;
};

const FONT_FAMILIES = [
  { label: "Padrão", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier", value: "'Courier New', monospace" },
  { label: "Cinzel", value: "var(--font-cinzel), Georgia, serif" },
];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"];

export function RichTextEditor({
  name,
  initialContent = "",
  onChange,
  uploadMedia,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "news-editor-content min-h-[320px] px-4 py-3 outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = html;
      }
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(initialContent || "<p></p>");
  }, [editor, initialContent]);

  useEffect(() => {
    if (!editor || !hiddenInputRef.current) return;
    hiddenInputRef.current.value = editor.getHTML();
  }, [editor]);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    if (uploadMedia) {
      return uploadMedia(formData);
    }

    return uploadNewsEditorMedia(formData);
  }

  async function handleImageUpload(file: File) {
    if (!editor) return;

    const result = await uploadFile(file);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    if (result.url) {
      editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
    }
  }

  async function handleVideoUpload(file: File) {
    if (!editor) return;

    const result = await uploadFile(file);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    if (result.url) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<video controls class="news-video" src="${result.url}"></video><p></p>`,
        )
        .run();
    }
  }

  function addYoutubeVideo() {
    if (!editor) return;

    const url = window.prompt("Cole o link do YouTube:");
    if (!url) return;

    editor.commands.setYoutubeVideo({ src: url });
  }

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gold/20 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-gold/15 bg-background p-3">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="B"
          className="font-bold"
        />
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="I"
          className="italic"
        />
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="U"
          className="underline"
        />

        <select
          className="rounded-lg border border-gold/20 px-2 py-1.5 text-xs"
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value;
            if (value) {
              editor.chain().focus().setFontFamily(value).run();
            } else {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>

        <select
          className="rounded-lg border border-gold/20 px-2 py-1.5 text-xs"
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value;
            if (value) {
              editor.chain().focus().setFontSize(value).run();
            } else {
              editor.chain().focus().unsetFontSize().run();
            }
          }}
        >
          <option value="">Tamanho</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <input
          type="color"
          aria-label="Cor do texto"
          className="h-9 w-10 cursor-pointer rounded border border-gold/20"
          onChange={(event) =>
            editor.chain().focus().setColor(event.target.value).run()
          }
        />

        <ToolbarButton
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          label="Esquerda"
        />
        <ToolbarButton
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          label="Centro"
        />
        <ToolbarButton
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          label="Direita"
        />

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="rounded-lg border border-gold/20 px-3 py-1.5 text-xs font-medium text-royal-blue hover:bg-gold/10"
        >
          Imagem
        </button>
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="rounded-lg border border-gold/20 px-3 py-1.5 text-xs font-medium text-royal-blue hover:bg-gold/10"
        >
          Vídeo
        </button>
        <button
          type="button"
          onClick={addYoutubeVideo}
          className="rounded-lg border border-gold/20 px-3 py-1.5 text-xs font-medium text-royal-blue hover:bg-gold/10"
        >
          YouTube
        </button>
      </div>

      <EditorContent editor={editor} />

      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue="" />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImageUpload(file);
          event.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleVideoUpload(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-royal-blue bg-royal-blue text-white"
          : "border-gold/20 text-royal-blue hover:bg-gold/10"
      } ${className}`}
    >
      {label}
    </button>
  );
}
