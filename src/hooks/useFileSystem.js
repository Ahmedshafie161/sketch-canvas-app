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
    if (window.confirm('Delete this file?')) {
      setFiles(files.filter(f => f.id !== fileId));
      if (currentFile?.id === fileId) {
        setCurrentFile(null);
      }
    }
  };

  const deleteFolder = (folderId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this folder and all its contents?')) {
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

      const importedObjects = [];
      let yOffset = 100;

      // Extract title
      const titleElement = doc.querySelector('title') || doc.querySelector('h1');
      if (titleElement && titleElement.textContent.trim()) {
        importedObjects.push({
          id: Date.now() + Math.random(),
          type: 'text',
          x: 100,
          y: yOffset,
          width: 600,
          height: 60,
          text: titleElement.textContent.trim(),
          backgroundColor: '#dbeafe',
          fontSize: '24px',
          fontWeight: 'bold'
        });
        yOffset += 80;
      }

      // Extract images
      const images = doc.querySelectorAll('img');
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        let src = img.src || img.getAttribute('data-src');
        
        // Handle data URLs (base64 embedded images)
        if (src && (src.startsWith('data:') || src.startsWith('http'))) {
          importedObjects.push({
            id: Date.now() + Math.random(),
            type: 'rectangle',
            x: 100 + (i % 3) * 220,
            y: yOffset + Math.floor(i / 3) * 200,
            width: 200,
            height: 150,
            backgroundColor: '#fef3c7',
            imageUrl: src,
            text: img.alt || `Image ${i + 1}`
          });
        }
      }
      
      if (images.length > 0) {
        yOffset += Math.ceil(images.length / 3) * 200 + 20;
      }

      // Extract tables
      const tables = doc.querySelectorAll('table');
      for (let t = 0; t < tables.length; t++) {
        const table = tables[t];
        const rows = table.querySelectorAll('tr');
        
        if (rows.length > 0) {
          const cells = [];
          
          rows.forEach((row) => {
            const rowCells = [];
            const tableCells = row.querySelectorAll('td, th');
            
            tableCells.forEach((cell) => {
              // Check if cell contains an image
              const cellImg = cell.querySelector('img');
              let cellContent = {
                text: cell.textContent.trim(),
                image: null,
                video: null,
                nestedTable: null
              };
              
              if (cellImg) {
                const imgSrc = cellImg.src || cellImg.getAttribute('data-src');
                if (imgSrc && (imgSrc.startsWith('data:') || imgSrc.startsWith('http'))) {
                  cellContent.image = imgSrc;
                  cellContent.text = cellImg.alt || '';
                }
              }
              
              rowCells.push(cellContent);
            });
            
            if (rowCells.length > 0) {
              cells.push(rowCells);
            }
          });

          if (cells.length > 0) {
            // Normalize table (make all rows same length)
            const maxCols = Math.max(...cells.map(row => row.length));
            const normalizedCells = cells.map(row => {
              while (row.length < maxCols) {
                row.push({ text: '', image: null, video: null, nestedTable: null });
              }
              return row;
            });

            importedObjects.push({
              id: Date.now() + Math.random(),
              type: 'table',
              x: 100,
              y: yOffset,
              width: Math.min(800, maxCols * 120),
              height: Math.min(400, cells.length * 60),
              rows: cells.length,
              cols: maxCols,
              cells: normalizedCells
            });
            
            yOffset += Math.min(400, cells.length * 60) + 20;
          }
        }
      }

      // Extract paragraphs (text content)
      const paragraphs = doc.querySelectorAll('p, div[class*="paragraph"]');
      let textContent = '';
      
      paragraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (text && !text.match(/^(image|table)/i)) {
          textContent += text + '\n\n';
        }
      });

      // If we got text content, add it
      if (textContent.trim()) {
        importedObjects.push({
          id: Date.now() + Math.random(),
          type: 'text',
          x: 100,
          y: yOffset,
          width: 600,
          height: Math.min(400, Math.max(200, textContent.split('\n').length * 20)),
          text: textContent.trim(),
          backgroundColor: '#f0f9ff',
          fontSize: '14px',
          overflow: 'auto'
        });
      }

      // If nothing was extracted, show raw text
      if (importedObjects.length === 0) {
        const body = doc.body;
        const fallbackText = body && body.textContent ? 
          body.textContent.substring(0, 3000) : 
          text.substring(0, 2000);
        
        importedObjects.push({
          id: Date.now(),
          type: 'text',
          x: 100,
          y: 100,
          width: 600,
          height: 400,
          text: `OneNote Import (Raw)\n\n${fallbackText}${fallbackText.length >= 2000 ? '...' : ''}`,
          backgroundColor: '#fef3c7',
          fontSize: '14px',
          overflow: 'auto'
        });
      }

      setCurrentFile({
        ...currentFile,
        objects: [...(currentFile.objects || []), ...importedObjects]
      });

      alert(`OneNote imported successfully!\n${importedObjects.length} objects created:\n- ${importedObjects.filter(o => o.type === 'text').length} text boxes\n- ${importedObjects.filter(o => o.imageUrl).length} images\n- ${importedObjects.filter(o => o.type === 'table').length} tables`);
    } catch (error) {
      console.error('OneNote import error:', error);
      alert('Failed to parse OneNote file: ' + error.message);
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
