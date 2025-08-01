import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useState, useEffect } from 'react';
import { LegacyContractType } from '../types';
import PreviewButton from '../features/preview/components/PreviewButton';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // Props para o preview
  contractType?: LegacyContractType;
  contractTitle?: string;
  showPreview?: boolean;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Cole aqui o texto do seu contrato...",
  disabled = false,
  contractType = 'terms',
  contractTitle = 'Contrato',
  showPreview = true
}: TiptapEditorProps) {
  const [isReady, setIsReady] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      Color,
    ],
    content: content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setIsReady(true);
    },
    onCreate: () => {
      setIsReady(true);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] max-h-[600px] overflow-y-auto p-4 border border-gray-300 rounded-lg dark:border-gray-600 dark:prose-invert',
      },
      handlePaste: (_view, _event) => {
        // Deixar o Tiptap lidar com o paste - ele já processa Google Docs perfeitamente!
        return false; // Retorna false para usar o comportamento padrão do Tiptap
      },
    },
  });

  // Atualizar conteúdo quando prop mudar
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!isReady || !editor) {
    return (
      <div className="min-h-[500px] max-h-[600px] p-4 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
        {/* Formatação de texto */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              editor.isActive('bold')
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={disabled}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              editor.isActive('italic')
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={disabled}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              editor.isActive('strike')
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={disabled}
          >
            <s>S</s>
          </button>
        </div>

        {/* Divisor */}
        <div className="w-px bg-gray-300 dark:bg-gray-600"></div>

        {/* Títulos */}
        <div className="flex gap-1">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                editor.isActive('heading', { level })
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              disabled={disabled}
            >
              H{level}
            </button>
          ))}
        </div>

        {/* Divisor */}
        <div className="w-px bg-gray-300 dark:bg-gray-600"></div>

        {/* Listas */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={disabled}
          >
            • Lista
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={disabled}
          >
            1. Lista
          </button>
        </div>

        {/* Preview Button */}
        {showPreview && (
          <>
            {/* Divisor */}
            <div className="w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Preview */}
            <div className="flex gap-1">
              <PreviewButton
                content={content}
                contractType={contractType}
                title={contractTitle}
                disabled={disabled}
              />
            </div>
          </>
        )}
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="tiptap-wrapper"
        />
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
