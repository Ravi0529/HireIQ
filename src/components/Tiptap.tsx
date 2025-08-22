"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import Heading from "@tiptap/extension-heading";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  ChevronDown,
  Heading as HeadingIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Highlighter,
  Link as LinkIcon,
  Unlink,
  List,
  ListOrdered,
  ImageUp,
  FileImage,
  Check,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const headingLevels = [
  { label: "H1", level: 1, icon: Heading1 },
  { label: "H2", level: 2, icon: Heading2 },
  { label: "H3", level: 3, icon: Heading3 },
];

interface TiptapProps {
  content?: string;
  onChange: (content: string) => void;
}

export const Tiptap: React.FC<TiptapProps> = ({
  onChange,
  content: initialContent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit.configure({
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        bulletList: false,
        orderedList: false,
        heading: false,
        horizontalRule: false,
      }),
      Bold.configure({
        HTMLAttributes: { class: "my-custom-bold" },
      }),
      Italic.configure({
        HTMLAttributes: { class: "my-custom-italic" },
      }),
      Underline.configure({
        HTMLAttributes: { class: "my-custom-underline" },
      }),
      Strike.configure({
        HTMLAttributes: { class: "my-custom-strike" },
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "my-custom-heading",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-custom-class",
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: { class: "my-custom-highlight" },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-blue-400 underline",
        },
      }),
      BulletList.configure({
        HTMLAttributes: { class: "list-disc pl-6" },
      }),
      OrderedList.configure({
        HTMLAttributes: { class: "list-decimal pl-6" },
      }),
      ListItem.configure({
        HTMLAttributes: { class: "my-custom-list-item" },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "my-custom-image rounded shadow",
        },
      }),
    ],
    content: initialContent,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
    },
    immediatelyRender: false,
  });

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleAddLink = () => {
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
    setUrl("");
    setOpen(false);
  };

  const handleAddImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setOpen(false);
    }
  };

  const handleLocalImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = () => {
        editor.commands.setImage({ src: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 relative">
      {!editor ? (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading editor...
        </div>
      ) : (
        <>
          <div className="toolbar flex flex-wrap gap-2 justify-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
          ${
            editor?.isActive("bold")
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
            >
              <BoldIcon className="w-4 h-4" />
            </Toggle>

            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
          ${
            editor?.isActive("italic")
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
            >
              <ItalicIcon className="w-4 h-4" />
            </Toggle>

            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
          ${
            editor?.isActive("underline")
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Toggle>

            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
          ${
            editor?.isActive("strike")
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
            >
              <Strikethrough className="w-4 h-4" />
            </Toggle>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`px-3 py-2 border rounded-md transition-colors duration-200
                    ${
                      editor?.isActive("heading")
                        ? "bg-blue-600 text-white border-blue-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  <HeadingIcon className="w-4 h-4" />
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-200 text-gray-800 shadow-lg">
                {headingLevels.map(({ level, icon: Icon }) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .toggleHeading({ level: level as 1 | 2 | 3 })
                        .run()
                    }
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    {editor?.isActive("heading", { level }) && (
                      <Check className="w-4 h-4 mr-2 text-blue-600" />
                    )}
                    <Icon className="w-4 h-4" />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
          ${
            editor?.isActive("horizontalRule")
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
            >
              <Minus className="w-4 h-4" />
            </Toggle>

            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
          ${
            editor?.isActive("highlight")
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
            >
              <Highlighter className="w-4 h-4" />
            </Toggle>

            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Toggle
                  type="button"
                  className={`px-3 py-2 border rounded-md transition-colors duration-200
            ${
              editor?.isActive("link")
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
                >
                  <LinkIcon className="w-4 h-4" />
                </Toggle>
              </AlertDialogTrigger>

              <AlertDialogContent className="bg-white text-gray-800 border-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-800">
                    Enter a URL
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setUrl("");
                    }}
                    className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Link
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().unsetLink().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
            ${
              editor?.isActive("link")
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            >
              <Unlink className="w-4 h-4" />
            </Toggle>

            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
            ${
              editor?.isActive("bulletList")
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            >
              <List className="w-4 h-4" />
            </Toggle>

            <Toggle
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
            ${
              editor?.isActive("orderedList")
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            >
              <ListOrdered className="w-4 h-4" />
            </Toggle>

            <Toggle
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 py-2 border rounded-md transition-colors duration-200
            ${
              editor?.isActive("image")
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            >
              <ImageUp className="w-4 h-4" />
            </Toggle>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLocalImageUpload}
              className="hidden"
            />

            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Toggle
                  type="button"
                  className={`px-3 py-2 border rounded-md transition-colors duration-200
            ${
              editor?.isActive("image")
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
                >
                  <FileImage className="w-4 h-4" />
                </Toggle>
              </AlertDialogTrigger>

              <AlertDialogContent className="bg-white text-gray-800 border-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-800">
                    Enter an image URL
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white border-gray-300 text-gray-800 focus:border-blue-500"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setImageUrl("");
                    }}
                    className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddImage}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add Image
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <EditorContent
            editor={editor}
            className="border border-gray-300 p-4 md:p-6 rounded-lg bg-white min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </>
      )}
    </div>
  );
};
