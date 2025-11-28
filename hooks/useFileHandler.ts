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

    let useFallback = true;

    try {
      // Try File System Access API
      // Note: specific checks for cross-origin isolation might be needed in some envs, 
      // but try/catch is the most robust way to handle 'SecurityError'.
      if ('showOpenFilePicker' in window) {
        useFallback = false; // Attempting API
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
      if (err.name === 'AbortError') {
        // User cancelled the picker
        return;
      }
      console.warn('File System Access API failed or blocked, falling back to input:', err);
      useFallback = true;
    }

    // Fallback: Use hidden file input
    if (useFallback && fileInputRef.current) {
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
      if (err.name === 'AbortError') {
        return; // User cancelled
      }
      console.warn("Save As API failed, falling back to download:", err);
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
        console.error("Failed to save to handle:", err);
        // Fall through to saveFileAs logic if handle write fails
      }
    }
    
    // If no handle or handle write failed, trigger Save As
    return saveFileAs();
  }, [fileState.handle, fileState.content, saveFileAs]);

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