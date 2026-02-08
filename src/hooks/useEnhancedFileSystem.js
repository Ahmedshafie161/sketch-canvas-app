import { useState, useEffect } from 'react';
import { db, remoteSync } from '../utils/database';
import { ocrProcessor } from '../utils/ocr';

export const useEnhancedFileSystem = (isAuthenticated, currentUser) => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [draggedItem, setDraggedItem] = useState(null);
  const [userId, setUserId] = useState(null);
  const [syncEnabled, setSyncEnabled] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserDataFromDB(currentUser);
    }
  }, [isAuthenticated, currentUser]);

  const loadUserDataFromDB = async (username) => {
    try {
      // Get or create user
      let user = await db.users.where('username').equals(username).first();
      
      if (!user) {
        const id = await db.users.add({ username });
        user = { id, username };
      }

      setUserId(user.id);

      // Load folders and files
      const userFolders = await db.folders.where('userId').equals(user.id).toArray();
      const userFiles = await db.files.where('userId').equals(user.id).toArray();

      // Load canvas objects for each file
      for (const file of userFiles) {
        const objects = await db.canvasObjects.where('fileId').equals(file.id).toArray();
        const connections = await db.connections.where('fileId').equals(file.id).toArray();
        const animations = await db.animations.where('fileId').equals(file.id).toArray();

        file.objects = objects.map(o => o.data);
        file.connections = connections.map(c => ({ id: c.id, from: c.from, to: c.to }));
        file.animations = animations.map(a => ({ 
          id: a.id, 
          objectId: a.objectId, 
          type: a.type, 
          duration: a.duration 
        }));
      }

      setFolders(userFolders);
      setFiles(userFiles);
    } catch (error) {
      console.error('Error loading from database:', error);
    }
  };

  const saveFileToDatabase = async (file) => {
    if (!userId) return;

    try {
      // Update or add file
      const existingFile = await db.files.get(file.id);
      
      if (existingFile) {
        await db.files.update(file.id, {
          name: file.name,
          folderId: file.folderId,
          updatedAt: new Date().toISOString()
        });

        // Delete old objects and connections
        await db.canvasObjects.where('fileId').equals(file.id).delete();
        await db.connections.where('fileId').equals(file.id).delete();
        await db.animations.where('fileId').equals(file.id).delete();
      } else {
        await db.files.add({
          id: file.id,
          userId,
          name: file.name,
          folderId: file.folderId,
          createdAt: file.createdAt,
          updatedAt: new Date().toISOString()
        });
      }

      // Save canvas objects
      if (file.objects) {
        for (const obj of file.objects) {
          await db.canvasObjects.add({
            fileId: file.id,
            type: obj.type,
            data: obj
          });
        }
      }

      // Save connections
      if (file.connections) {
        for (const conn of file.connections) {
          await db.connections.add({
            fileId: file.id,
            from: conn.from,
            to: conn.to
          });
        }
      }

      // Save animations
      if (file.animations) {
        for (const anim of file.animations) {
          await db.animations.add({
            fileId: file.id,
            objectId: anim.objectId,
            type: anim.type,
            duration: anim.duration
          });
        }
      }
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  const createFolder = async (parentId = null) => {
    const name = prompt('Folder name:');
    if (name && userId) {
      const newFolder = {
        userId,
        name,
        parentId
      };

      const id = await db.folders.add(newFolder);
      setFolders([...folders, { id, ...newFolder }]);
    }
  };

  const createFile = async (folderId = null) => {
    const name = prompt('File name:');
    if (name && userId) {
      const newFile = {
        id: Date.now(),
        userId,
        name,
        folderId,
        objects: [],
        connections: [],
        animations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.files.add(newFile);
      setFiles([...files, newFile]);
      setCurrentFile(newFile);
    }
  };

  const openFile = async (file) => {
    // Load full file data
    const objects = await db.canvasObjects.where('fileId').equals(file.id).toArray();
    const connections = await db.connections.where('fileId').equals(file.id).toArray();
    const animations = await db.animations.where('fileId').equals(file.id).toArray();

    const fullFile = {
      ...file,
      objects: objects.map(o => o.data),
      connections: connections.map(c => ({ id: c.id, from: c.from, to: c.to })),
      animations: animations.map(a => ({ 
        id: a.id, 
        objectId: a.objectId, 
        type: a.type, 
        duration: a.duration 
      }))
    };

    setCurrentFile(fullFile);
  };

  const saveCurrentFile = async () => {
    if (currentFile) {
      await saveFileToDatabase(currentFile);
      
      if (syncEnabled) {
        const result = await remoteSync.syncToRemote(userId);
        if (result.success) {
          alert('File saved and synced to cloud!');
        } else {
          alert('File saved locally. Cloud sync failed.');
        }
      } else {
        alert('File saved successfully!');
      }
    }
  };

  const deleteFile = async (fileId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this file?')) {
      await db.files.delete(fileId);
      await db.canvasObjects.where('fileId').equals(fileId).delete();
      await db.connections.where('fileId').equals(fileId).delete();
      await db.animations.where('fileId').equals(fileId).delete();
      await db.voiceRecordings.where('fileId').equals(fileId).delete();

      setFiles(files.filter(f => f.id !== fileId));
      if (currentFile?.id === fileId) {
        setCurrentFile(null);
      }
    }
  };

  const deleteFolder = async (folderId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this folder and all its contents?')) {
      const foldersToDelete = getAllSubfolders(folderId);
      foldersToDelete.push(folderId);

      // Delete files in these folders
      const filesToDelete = await db.files
        .where('folderId')
        .anyOf(foldersToDelete)
        .toArray();

      for (const file of filesToDelete) {
        await deleteFile(file.id, e);
      }

      // Delete folders
      await db.folders.where('id').anyOf(foldersToDelete).delete();
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

  const handleDrop = async (e, targetFolder) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;

    if (draggedItem.type === 'folder') {
      if (draggedItem.id === targetFolder?.id) return;
      if (isChildFolder(targetFolder?.id, draggedItem.id)) return;

      await db.folders.update(draggedItem.id, {
        parentId: targetFolder?.id || null
      });

      setFolders(folders.map(f =>
        f.id === draggedItem.id
          ? { ...f, parentId: targetFolder?.id || null }
          : f
      ));
    } else if (draggedItem.type === 'file') {
      await db.files.update(draggedItem.id, {
        folderId: targetFolder?.id || null
      });

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

  const importPDF = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentFile) return;

    try {
      const pages = await ocrProcessor.extractTextFromPDF(file);
      
      const importedObjects = [];
      let yOffset = 100;

      for (const page of pages) {
        // Add page image
        importedObjects.push({
          id: Date.now() + Math.random(),
          type: 'rectangle',
          x: 100,
          y: yOffset,
          width: Math.min(600, page.width / 2),
          height: Math.min(400, page.height / 2),
          imageUrl: page.image,
          text: `Page ${page.pageNum}`,
          backgroundColor: '#fef3c7'
        });

        // Add extracted text as editable text box
        if (page.text) {
          importedObjects.push({
            id: Date.now() + Math.random() + 0.1,
            type: 'text',
            x: 750,
            y: yOffset,
            width: 500,
            height: Math.min(400, page.height / 2),
            text: page.text,
            backgroundColor: '#f0f9ff',
            fontSize: '14px',
            overflow: 'auto'
          });
        }

        yOffset += Math.min(400, page.height / 2) + 50;
      }

      setCurrentFile({
        ...currentFile,
        objects: [...(currentFile.objects || []), ...importedObjects]
      });

      alert(`PDF imported successfully!\n${pages.length} pages extracted`);
    } catch (error) {
      console.error('PDF import error:', error);
      alert('Failed to import PDF: ' + error.message);
    }
  };

  const enableCloudSync = async (enable) => {
    setSyncEnabled(enable);
    await remoteSync.enableSync(enable);
    
    if (enable) {
      const result = await remoteSync.syncToRemote(userId);
      if (result.success) {
        alert('Synced to cloud successfully!');
      } else {
        alert('Cloud sync failed: ' + result.message);
      }
    }
  };

  const syncFromCloud = async () => {
    if (!syncEnabled) {
      alert('Cloud sync is not enabled');
      return;
    }

    const result = await remoteSync.syncFromRemote(userId);
    if (result.success) {
      await loadUserDataFromDB(currentUser);
      alert('Synced from cloud successfully!');
    } else {
      alert('Cloud sync failed: ' + result.message);
    }
  };

  return {
    folders,
    files,
    currentFile,
    expandedFolders,
    draggedItem,
    syncEnabled,
    setFolders,
    setFiles,
    setCurrentFile,
    setExpandedFolders,
    setDraggedItem,
    createFolder,
    createFile,
    openFile,
    saveCurrentFile,
    saveFileToDatabase,
    deleteFile,
    deleteFolder,
    toggleFolder,
    handleDragStart,
    handleDragOver,
    handleDrop,
    exportCanvas,
    importCanvas,
    importPDF,
    enableCloudSync,
    syncFromCloud,
  };
};
