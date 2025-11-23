import React from 'react';
import { FilePlus, FolderOpen, Save, Download, Wand2, Loader2, LayoutTemplate, Layout, Eye } from 'lucide-react';
import { EditorMode } from '../types';

interface ToolbarProps {
  fileName: string;
  isDirty: boolean;
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onAiImprove: () => void;
  isAiLoading: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  fileName,
  isDirty,
  editorMode,
  setEditorMode,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onAiImprove,
  isAiLoading
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mr-4">
          MarkSmart
        </div>
        
        {/* File Actions */}
        <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-1">
          <button onClick={onNew} className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors" title="New File">
            <FilePlus size={18} />
          </button>
          <button onClick={onOpen} className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors" title="Open File">
            <FolderOpen size={18} />
          </button>
          <button onClick={onSave} className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors relative" title="Save">
            <Save size={18} />
            {isDirty && <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>}
          </button>
          <button onClick={onSaveAs} className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors" title="Save As">
            <Download size={18} />
          </button>
        </div>

        <span className="hidden sm:block w-px h-6 bg-slate-700 mx-2"></span>

        {/* AI Actions */}
        <button 
          onClick={onAiImprove} 
          disabled={isAiLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-slate-400 text-white text-sm font-medium rounded-md transition-colors"
        >
          {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
          <span className="hidden sm:inline">Auto-Fix</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          <span className="truncate max-w-[150px]">{fileName}</span>
          {isDirty && <span className="text-yellow-500 text-xs">● Modified</span>}
        </div>

        {/* View Toggles (Mobile/Desktop) */}
        <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-1">
          <button 
            onClick={() => setEditorMode(EditorMode.EDIT)} 
            className={`p-2 rounded-md transition-colors ${editorMode === EditorMode.EDIT ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Editor Only"
          >
            <LayoutTemplate size={18} />
          </button>
           <button 
            onClick={() => setEditorMode(EditorMode.SPLIT)} 
            className={`hidden md:block p-2 rounded-md transition-colors ${editorMode === EditorMode.SPLIT ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Split View"
          >
            <Layout size={18} />
          </button>
          <button 
            onClick={() => setEditorMode(EditorMode.PREVIEW)} 
            className={`p-2 rounded-md transition-colors ${editorMode === EditorMode.PREVIEW ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Preview Only"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Toolbar;