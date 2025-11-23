import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface PreviewPaneProps {
  content: string;
  visible: boolean;
}

const PreviewPane: React.FC<PreviewPaneProps> = memo(({ content, visible }) => {
  if (!visible) return null;

  return (
    <div className="h-full w-full bg-slate-950 relative group">
      <div className="h-full w-full overflow-y-auto p-8">
        {/* 
           Tailwind Typography (prose) plugin handles most styling.
           We override some specific colors in index.html config, but applying 'prose-invert' gives dark mode defaults.
        */}
        <div className="max-w-none w-full prose prose-invert prose-headings:font-semibold prose-a:text-blue-400 prose-img:rounded-lg prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-slate-800 prose-blockquote:border-l-4 prose-blockquote:border-slate-700 prose-blockquote:pl-4 prose-table:border-collapse prose-th:border prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-700 prose-td:p-2">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      <div className="absolute bottom-4 right-6 text-xs text-slate-500 pointer-events-none select-none bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-slate-800">
        Preview
      </div>
    </div>
  );
});

export default PreviewPane;