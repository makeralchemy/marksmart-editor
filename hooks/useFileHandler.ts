import React, { useState, useCallback, useRef } from 'react';
import { FileSystemFileHandle, FileState } from '../types';
import { DEFAULT_FILENAME, WELCOME_CONTENT } from '../constants';

export const useFileHandler = () => {
  const [fileState, setFileState] = useState<FileState>({
    content: WELCOME_CONTENT,
    handle: null,
    name: DEFAULT_FILENAME,
    isDirty: false,
  });

  // Hidden input for fallback file opening
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setContent = useCallback((newContent: string) => {
    setFileState(prev => ({ ...prev, content: newContent, isDirty: true }));
  }, []);

  const newFile = useCallback(() => {
    if (fileState.isDirty && !window.confirm("You have unsaved changes. Create new file anyway?")) {
      return;
    }
    setFileState({
      content: '',
      handle: null,
      name: DEFAULT_FILENAME,
      isDirty: false,
    });
  }, [fileState.isDirty]);

  const openFile = useCallback(async () => {
    if (fileState.isDirty && !window.confirm("You have unsaved changes. Open another file?")) {
      return;
    }

    try {
      // Try File System Access API
      if ('showOpenFilePicker' in window) {
        const handles = await window.showOpenFilePicker({
          multiple: false,
          types: [{ description: 'Markdown Files', accept: { 'text/markdown': ['.md', '.markdown'] } }]
        });
        
        if (handles.length > 0) {
          const handle = handles[0];
          const file = await handle.getFile();
          const text = await file.text();
          setFileState({
            content: text,
            handle: handle,
            name: file.name,
            isDirty: false
          });
          return;
        }
      } 
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('File access error:', err);
      }
      // If user aborted, do nothing. If error wasn't abort, we could try fallback,
      // but usually 'AbortError' is the only common one here.
      return;
    }

    // Fallback: Use hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [fileState.isDirty]);

  // Handle fallback input change
  const handleFallbackFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setFileState({
          content: text,
          handle: null, // No handle in legacy mode
          name: file.name,
          isDirty: false
        });
      };
      reader.readAsText(file);
      // Reset input so same file can be selected again if needed
      e.target.value = ''; 
    }
  }, []);

  const saveFile = useCallback(async () => {
    // If we have a handle, write to it
    if (fileState.handle) {
      try {
        const writable = await fileState.handle.createWritable();
        await writable.write(fileState.content);
        await writable.truncate(new Blob([fileState.content]).size);
        await writable.close(); // Important to close
        setFileState(prev => ({ ...prev, isDirty: false }));
        return;
      } catch (err) {
        console.error("Failed to save:", err);
        alert("Failed to save file. Try 'Save As'.");
      }
    }
    
    // If no handle, trigger Save As
    return saveFileAs();
  }, [fileState.handle, fileState.content]);

  const saveFileAs = useCallback(async () => {
    try {
      if ('showSaveFilePicker' in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileState.name,
          types: [{ description: 'Markdown File', accept: { 'text/markdown': ['.md'] } }]
        });
        
        const writable = await handle.createWritable();
        await writable.write(fileState.content);
        await writable.close();
        
        setFileState(prev => ({
          ...prev,
          handle: handle,
          name: handle.name,
          isDirty: false
        }));
        return;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Save As failed:", err);
      } else {
        return; // User cancelled
      }
    }

    // Fallback: Download Blob
    const blob = new Blob([fileState.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileState.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFileState(prev => ({ ...prev, isDirty: false }));
  }, [fileState.content, fileState.name]);

  return {
    fileState,
    setContent,
    newFile,
    openFile,
    saveFile,
    saveFileAs,
    fileInputRef,
    handleFallbackFileChange
  };
};