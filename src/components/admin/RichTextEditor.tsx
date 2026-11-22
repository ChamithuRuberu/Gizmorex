'use client';

import { useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initQuill() {
      if (!containerRef.current || quillRef.current) return;

      const QuillModule = await import('quill');
      const Quill = (QuillModule as any).default || QuillModule;

      if (!isMounted || !containerRef.current) return;

      // Clean container before creating instance
      containerRef.current.innerHTML = '';
      const editorElement = document.createElement('div');
      containerRef.current.appendChild(editorElement);

      const quill = new Quill(editorElement, {
        theme: 'snow',
        placeholder: placeholder || 'Write product description...',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            ['link'],
            ['clean'],
          ],
        },
      });

      if (value) {
        quill.root.innerHTML = value;
      }

      quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        onChange(html === '<p><br></p>' ? '' : html);
      });

      quillRef.current = quill;
    }

    initQuill();

    return () => {
      isMounted = false;
      quillRef.current = null;
    };
  }, []);

  // Update content if value changes externally
  useEffect(() => {
    if (quillRef.current) {
      const currentHtml = quillRef.current.root.innerHTML;
      if (value !== undefined && value !== currentHtml && (value !== '' || currentHtml !== '<p><br></p>')) {
        quillRef.current.root.innerHTML = value || '';
      }
    }
  }, [value]);

  return (
    <div className="rich-text-editor">
      <div ref={containerRef} className="bg-white rounded-lg" />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-bottom: none;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          min-height: 200px;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
