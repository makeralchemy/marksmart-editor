import React, { useState, useEffect, useDeferredValue } from 'react';
import Toolbar from './components/Toolbar';
import EditorPane from './components/EditorPane';
import PreviewPane from './components/PreviewPane';
import { useFileHandler } from './hooks/useFileHandler';
import { EditorMode } from './types';
import { improveMarkdown } from './services/geminiService';

const App: React.FC = () => {
  const {
    fileState,
    setContent,
    newFile,
    openFile,
    saveFile,
    saveFileAs,
    fileInputRef,
    handleFallbackFileChange
  } = useFileHandler();

  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.SPLIT);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Use deferred value for preview to keep editor responsive
  const deferredContent = useDeferredValue(fileState.content);

  // Responsive check: switch to tab mode on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && editorMode === EditorMode.SPLIT) {
        setEditorMode(EditorMode.EDIT);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Check on init
    return () => window.removeEventListener('resize', handleResize);
  }, [editorMode]);

  const handleAiImprove = async () => {
    if (!fileState.content.trim()) return;
    
    setIsAiLoading(true);
    try {
      // Basic grammar and flow improvement
      const improved = await improveMarkdown(
        fileState.content, 
        "Check for grammar mistakes, typos, and formatting consistency. Keep the structure largely the same but polish the prose."
      );
      setContent(improved);
    } catch (e) {
      console.error("AI Improvement failed", e);
      alert("Could not connect to AI service. Check your API Key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      <Toolbar 
        fileName={fileState.name}
        isDirty={fileState.isDirty}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        onNew={newFile}
        onOpen={openFile}
        onSave={saveFile}
        onSaveAs={saveFileAs}
        onAiImprove={handleAiImprove}
        isAiLoading={isAiLoading}
      />

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden relative flex">
        {/* Editor Side */}
        <div 
          className={`
            h-full transition-all duration-300 ease-in-out
            ${editorMode === EditorMode.SPLIT ? 'w-1/2 border-r border-slate-800' : ''}
            ${editorMode === EditorMode.EDIT ? 'w-full' : ''}
            ${editorMode === EditorMode.PREVIEW ? 'w-0 hidden' : ''}
          `}
        >
          <EditorPane 
            content={fileState.content} 
            onChange={setContent} 
            visible={editorMode !== EditorMode.PREVIEW}
          />
        </div>

        {/* Preview Side */}
        <div 
          className={`
            h-full transition-all duration-300 ease-in-out bg-slate-950
            ${editorMode === EditorMode.SPLIT ? 'w-1/2' : ''}
            ${editorMode === EditorMode.PREVIEW ? 'w-full' : ''}
            ${editorMode === EditorMode.EDIT ? 'w-0 hidden' : ''}
          `}
        >
          <PreviewPane 
            content={deferredContent} 
            visible={editorMode !== EditorMode.EDIT}
          />
        </div>
      </main>

      {/* Hidden File Input for Fallback */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".md,.markdown,text/markdown"
        onChange={handleFallbackFileChange}
      />
    </div>
  );
};

export default App;