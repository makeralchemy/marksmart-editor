import React from 'react';

interface EditorPaneProps {
  content: string;
  onChange: (value: string) => void;
  visible: boolean;
}

const EditorPane: React.FC<EditorPaneProps> = ({ content, onChange, visible }) => {
  if (!visible) return null;

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative group">
      <textarea
        className="w-full h-full bg-slate-900 text-slate-300 p-6 font-mono text-sm resize-none outline-none focus:bg-slate-850 transition-colors leading-relaxed"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing markdown here..."
        spellCheck={false}
      />
      <div className="absolute bottom-4 right-6 text-xs text-slate-500 pointer-events-none select-none bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-slate-800">
        Markdown
      </div>
    </div>
  );
};

export default EditorPane;