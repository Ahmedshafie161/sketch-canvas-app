// src/hooks/useFileManagement.js
import { useState, useEffect } from 'react';

export const useFileManagement = (currentUser) => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser);
    }
  }, [currentUser]);

  const loadUserData = (user) => {
    const userData = localStorage.getItem(`canvas_${user}`);
    if (userData) {
      const data = JSON.parse(userData);
      setFolders(data.folders || []);
      setFiles(data.files || []);
    }
  };

  const saveUserData = () => {
    if (currentUser) {
      localStorage.setItem(`canvas_${currentUser}`, JSON.stringify({
        folders,
        files,
      }));
    }
  };

  const createFolder = (parentId = null) => {
    const name = prompt('Folder name:');
    if (name) {
      setFolders([...folders, { id: Date.now(), name, parentId }]);
    }
  };

  const createFile = (folderId = null) => {
    const name = prompt('File name:');
    if (name) {
      const newFile = {
        id: Date.now(),
        name,
        folderId,
        objects: [],
        connections: [],
        animations: [],
        createdAt: new Date().toISOString(),
      };
      setFiles([...files, newFile]);
      setCurrentFile(newFile);
      return newFile;
    }
    return null;
  };

  const openFile = (file) => {
    setCurrentFile(file);
    return file;
  };

  const deleteFile = (fileId, e) => {
    if (e) e.stopPropagation();
    if (confirm('Delete this file?')) {
      setFiles(files.filter(f => f.id !== fileId));
      if (currentFile?.id === fileId) {
        setCurrentFile(null);
      }
    }
  };

  const deleteFolder = (folderId, e) => {
    if (e) e.stopPropagation();
    if (confirm('Delete this folder and all its contents?')) {
      const foldersToDelete = getAllSubfolders(folderId);
      foldersToDelete.push(folderId);
      
      setFiles(files.filter(f => !foldersToDelete.includes(f.folderId)));
      setFolders(folders.filter(f => !foldersToDelete.includes(f.id)));
    }
  };

  const getAllSubfolders = (parentId) => {
    const subfolders = folders.filter(f => f.parentId === parentId).map(f => f.id);
    const allSubfolders = [...subfolders];
    
    subfolders.forEach(id => {
      allSubfolders.push(...getAllSubfolders(id));
    });
    
    return allSubfolders;
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  return {
    folders,
    setFolders,
    files,
    setFiles,
    currentFile,
    setCurrentFile,
    expandedFolders,
    saveUserData,
    createFolder,
    createFile,
    openFile,
    deleteFile,
    deleteFolder,
    toggleFolder,
    getAllSubfolders
  };
};