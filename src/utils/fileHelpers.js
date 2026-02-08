// src/utils/fileHelpers.js

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Get file icon based on extension
export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    'json': '📋',
    'txt': '📄',
    'md': '📝',
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📗',
    'xlsx': '📗',
    'ppt': '📙',
    'pptx': '📙',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'mp4': '🎥',
    'mov': '🎥',
    'avi': '🎥',
    'mp3': '🎵',
    'wav': '🎵',
    'zip': '📦',
    'rar': '📦',
    '7z': '📦',
    'html': '🌐',
    'htm': '🌐',
    'css': '🎨',
    'js': '⚡',
    'jsx': '⚡',
    'ts': '⚡',
    'tsx': '⚡',
  };
  return iconMap[extension] || '📄';
};

// Get file type category
export const getFileCategory = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const categoryMap = {
    'json': 'data',
    'txt': 'text',
    'md': 'text',
    'pdf': 'document',
    'doc': 'document',
    'docx': 'document',
    'xls': 'spreadsheet',
    'xlsx': 'spreadsheet',
    'ppt': 'presentation',
    'pptx': 'presentation',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'svg': 'image',
    'mp4': 'video',
    'mov': 'video',
    'avi': 'video',
    'mp3': 'audio',
    'wav': 'audio',
    'zip': 'archive',
    'rar': 'archive',
    '7z': 'archive',
    'html': 'web',
    'htm': 'web',
    'css': 'web',
    'js': 'code',
    'jsx': 'code',
    'ts': 'code',
    'tsx': 'code',
  };
  return categoryMap[extension] || 'other';
};

// Validate file name
export const isValidFileName = (fileName) => {
  if (!fileName || fileName.trim() === '') return false;
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  if (invalidChars.test(fileName)) return false;
  // Check for reserved names
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 
                         'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 
                         'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  const nameWithoutExt = fileName.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) return false;
  return true;
};

// Generate unique file name
export const generateUniqueFileName = (baseName, existingFiles) => {
  if (!existingFiles.some(file => file.name === baseName)) {
    return baseName;
  }

  const extension = baseName.includes('.') ? baseName.split('.').pop() : '';
  const nameWithoutExt = baseName.includes('.') ? baseName.substring(0, baseName.lastIndexOf('.')) : baseName;
  
  let counter = 1;
  let newName = `${nameWithoutExt} (${counter})${extension ? '.' + extension : ''}`;
  
  while (existingFiles.some(file => file.name === newName)) {
    counter++;
    newName = `${nameWithoutExt} (${counter})${extension ? '.' + extension : ''}`;
  }
  
  return newName;
};

// Sort files by different criteria
export const sortFiles = (files, sortBy = 'name', sortOrder = 'asc') => {
  const sortedFiles = [...files];
  
  sortedFiles.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
        break;
      case 'size':
        const sizeA = JSON.stringify(a.objects || []).length + JSON.stringify(a.connections || []).length;
        const sizeB = JSON.stringify(b.objects || []).length + JSON.stringify(b.connections || []).length;
        comparison = sizeA - sizeB;
        break;
      case 'type':
        comparison = getFileCategory(a.name).localeCompare(getFileCategory(b.name));
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sortedFiles;
};

// Filter files by search term
export const filterFiles = (files, searchTerm) => {
  if (!searchTerm) return files;
  
  const term = searchTerm.toLowerCase();
  return files.filter(file => 
    file.name.toLowerCase().includes(term) ||
    (file.folderId && file.folderId.toString().includes(term)) ||
    file.createdAt.toLowerCase().includes(term)
  );
};

// Calculate folder size (recursively)
export const calculateFolderSize = (folderId, folders, files) => {
  let totalSize = 0;
  
  // Add size of files in this folder
  const folderFiles = files.filter(file => file.folderId === folderId);
  folderFiles.forEach(file => {
    totalSize += JSON.stringify(file.objects || []).length;
    totalSize += JSON.stringify(file.connections || []).length;
    totalSize += JSON.stringify(file.animations || []).length;
  });
  
  // Add size of subfolders
  const subfolders = folders.filter(folder => folder.parentId === folderId);
  subfolders.forEach(subfolder => {
    totalSize += calculateFolderSize(subfolder.id, folders, files);
  });
  
  return totalSize;
};

// Get all files in a folder (including subfolders)
export const getAllFilesInFolder = (folderId, folders, files) => {
  let allFiles = [...files.filter(file => file.folderId === folderId)];
  
  const subfolders = folders.filter(folder => folder.parentId === folderId);
  subfolders.forEach(subfolder => {
    allFiles = [...allFiles, ...getAllFilesInFolder(subfolder.id, folders, files)];
  });
  
  return allFiles;
};

// Get folder path as array
export const getFolderPath = (folderId, folders) => {
  const path = [];
  let currentFolderId = folderId;
  
  while (currentFolderId) {
    const folder = folders.find(f => f.id === currentFolderId);
    if (folder) {
      path.unshift(folder);
      currentFolderId = folder.parentId;
    } else {
      break;
    }
  }
  
  return path;
};

// Export folder as ZIP (simulated)
export const exportFolder = async (folderId, folders, files) => {
  const folder = folders.find(f => f.id === folderId);
  if (!folder) return null;
  
  const folderFiles = getAllFilesInFolder(folderId, folders, files);
  const data = {
    folder: folder,
    files: folderFiles,
    subfolders: folders.filter(f => f.parentId === folderId),
    exportedAt: new Date().toISOString(),
  };
  
  return data;
};