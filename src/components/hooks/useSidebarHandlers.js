import { useState } from 'react';

export default function useSidebarHandlers({ setFolders, setFiles, setExpandedFolders }) {
  // Folder/file state
  const handleDragStart = (e, item, type) => {
    e.dataTransfer.setData('item', JSON.stringify(item));
    e.dataTransfer.setData('type', type);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e, targetFolder) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('item'));
    const type = e.dataTransfer.getData('type');
    if (type === 'folder' && targetFolder) {
      setFolders(prev => prev.map(f => f.id === item.id ? { ...f, parentId: targetFolder.id } : f));
    } else if (type === 'file' && targetFolder) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, folderId: targetFolder.id } : f));
    }
  };
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) newSet.delete(folderId);
      else newSet.add(folderId);
      return newSet;
    });
  };
  const deleteFolder = (folderId, e) => {
    if (e) e.stopPropagation();
    setFolders(prev => prev.filter(f => f.id !== folderId && f.parentId !== folderId));
    setFiles(prev => prev.filter(f => f.folderId !== folderId));
  };
  const deleteFile = (fileId, e) => {
    if (e) e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };
  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    toggleFolder,
    deleteFolder,
    deleteFile,
  };
}