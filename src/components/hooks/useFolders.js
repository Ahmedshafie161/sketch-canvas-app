import { useState } from 'react';

const useFolders = (setFiles, setCurrentFile, setCanvasObjects, setConnections, setAnimations) => {
  const [folders, setFolders] = useState([]);
  const [files, _setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const createFolder = (parentId = null) => {
    const name = prompt('Folder name:');
    if (name) {
      setFolders(prev => [...prev, { id: Date.now(), name, parentId }]);
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
      setFiles(prev => [...prev, newFile]);
      setCurrentFile(newFile);
      setCanvasObjects([]);
      setConnections([]);
      setAnimations([]);
    }
  };

  const openFile = (file) => {
    setCurrentFile(file);
    setCanvasObjects(file.objects || []);
    setConnections(file.connections || []);
    setAnimations(file.animations || []);
  };

  return {
    folders,
    setFolders,
    files,
    setFiles,
    expandedFolders,
    setExpandedFolders,
    createFolder,
    createFile,
    openFile,
  };
};

export default useFolders;
