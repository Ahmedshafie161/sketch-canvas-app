import { useState, useEffect } from 'react';

export const useFileSystem = (isAuthenticated, currentUser) => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserData(currentUser);
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (isAuthenticated) {
      saveUserData();
    }
  }, [folders, files, isAuthenticated]);

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
    }
  };

  const openFile = (file) => {
    setCurrentFile(file);
  };

  const saveCurrentFile = () => {
    if (currentFile) {
      saveUserData();
      alert('File saved successfully!');
    }
  };

  const deleteFile = (fileId, e) => {
    e.stopPropagation();
    if (confirm('Delete this file?')) {
      setFiles(files.filter(f => f.id !== fileId));
      if (currentFile?.id === fileId) {
        setCurrentFile(null);
      }
    }
  };

  const deleteFolder = (folderId, e) => {
    e.stopPropagation();
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

  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, type });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetFolder) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;

    if (draggedItem.type === 'folder') {
      if (draggedItem.id === targetFolder?.id) return;
      if (isChildFolder(targetFolder?.id, draggedItem.id)) return;

      setFolders(folders.map(f =>
        f.id === draggedItem.id
          ? { ...f, parentId: targetFolder?.id || null }
          : f
      ));
    } else if (draggedItem.type === 'file') {
      setFiles(files.map(f =>
        f.id === draggedItem.id
          ? { ...f, folderId: targetFolder?.id || null }
          : f
      ));
    }

    setDraggedItem(null);
  };

  const isChildFolder = (parentId, childId) => {
    if (!parentId) return false;

    const parent = folders.find(f => f.id === parentId);
    if (!parent) return false;
    if (parent.parentId === childId) return true;

    return isChildFolder(parent.parentId, childId);
  };

  const exportCanvas = () => {
    if (!currentFile) return;
    
    const data = {
      objects: currentFile.objects || [],
      connections: currentFile.connections || [],
      animations: currentFile.animations || [],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFile?.name || 'canvas'}.json`;
    a.click();
  };

  const importCanvas = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (currentFile) {
            setCurrentFile({
              ...currentFile,
              objects: data.objects || [],
              connections: data.connections || [],
              animations: data.animations || [],
            });
          }
        } catch (error) {
          alert('Failed to import file');
        }
      };
      reader.readAsText(file);
    }
  };

  const importOneNote = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentFile) return;

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      let content = '';
      const titleElement = doc.querySelector('title') || doc.querySelector('h1');
      if (titleElement) {
        content += `Title: ${titleElement.textContent}\n\n`;
      }

      const paragraphs = doc.querySelectorAll('p, div[class*="paragraph"]');
      if (paragraphs.length > 0) {
        paragraphs.forEach((p) => {
          if (p.textContent.trim()) {
            content += `${p.textContent}\n`;
          }
        });
      } else {
        const body = doc.body;
        if (body && body.textContent) {
          content = body.textContent.substring(0, 5000);
        }
      }

      if (!content.trim()) {
        content = text.substring(0, 2000);
        if (text.length > 2000) content += '...';
      }

      const importedText = {
        id: Date.now(),
        type: 'text',
        x: 100,
        y: 100,
        width: 600,
        height: 400,
        text: `OneNote Import\n\n${content}`,
        backgroundColor: '#f0f9ff',
        border: '2px solid #0ea5e9',
        fontSize: '14px',
        overflow: 'auto'
      };

      setCurrentFile({
        ...currentFile,
        objects: [...(currentFile.objects || []), importedText]
      });

      alert('OneNote imported successfully!');
    } catch (error) {
      console.error('OneNote import error:', error);
      alert('Failed to parse OneNote file.');
    }
  };

  return {
    folders,
    files,
    currentFile,
    expandedFolders,
    draggedItem,
    setFolders,
    setFiles,
    setCurrentFile,
    setExpandedFolders,
    setDraggedItem,
    createFolder,
    createFile,
    openFile,
    saveCurrentFile,
    deleteFile,
    deleteFolder,
    toggleFolder,
    handleDragStart,
    handleDragOver,
    handleDrop,
    exportCanvas,
    importCanvas,
    importOneNote,
  };
};
