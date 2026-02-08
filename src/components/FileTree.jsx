// src/components/FileTree.jsx
import React from 'react';
import { ChevronRight, ChevronDown, FolderPlus, File, Trash2 } from 'lucide-react';

const FileTree = ({
  folders,
  files,
  currentFile,
  expandedFolders,
  darkMode,
  toggleFolder,
  deleteFolder,
  deleteFile,
  openFile,
  createFolder,
  createFile,
  parentId = null,
  level = 0
}) => {
  const childFolders = folders.filter(f => f.parentId === parentId);
  const childFiles = files.filter(f => f.folderId === parentId);

  return (
    <div style={{ marginLeft: level > 0 ? '1rem' : 0 }}>
      {childFolders.map(folder => (
        <div key={folder.id}>
          <div
            draggable
            style={{
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '6px',
              backgroundColor: expandedFolders.has(folder.id) 
                ? (darkMode ? '#334155' : '#e2e8f0')
                : 'transparent',
              color: darkMode ? '#f1f5f9' : '#1e293b',
            }}
            onClick={() => toggleFolder(folder.id)}
          >
            {expandedFolders.has(folder.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <FolderPlus size={16} />
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{folder.name}</span>
            <button
              title="Add subfolder"
              onClick={e => { e.stopPropagation(); createFolder(folder.id); }}
              style={{
                padding: '0.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#22c55e',
              }}
            >
              <FolderPlus size={14} />
            </button>
            <button
              title="Add note"
              onClick={e => { e.stopPropagation(); createFile(folder.id); }}
              style={{
                padding: '0.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#3b82f6',
              }}
            >
              <File size={14} />
            </button>
            <button
              onClick={(e) => deleteFolder(folder.id, e)}
              style={{
                padding: '0.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
          {expandedFolders.has(folder.id) && (
            <FileTree
              folders={folders}
              files={files}
              currentFile={currentFile}
              expandedFolders={expandedFolders}
              darkMode={darkMode}
              toggleFolder={toggleFolder}
              deleteFolder={deleteFolder}
              deleteFile={deleteFile}
              openFile={openFile}
              createFolder={createFolder}
              createFile={createFile}
              parentId={folder.id}
              level={level + 1}
            />
          )}
        </div>
      ))}
      
      {childFiles.map(file => (
        <div
          key={file.id}
          draggable
          style={{
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '6px',
            backgroundColor: currentFile?.id === file.id 
              ? (darkMode ? '#1e40af' : '#3b82f6')
              : 'transparent',
            color: currentFile?.id === file.id ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b'),
            marginLeft: level > 0 ? '1.5rem' : '0.5rem',
          }}
          onClick={() => openFile(file)}
        >
          <File size={16} />
          <span style={{ flex: 1, fontSize: '0.9rem' }}>{file.name}</span>
          <button
            onClick={(e) => deleteFile(file.id, e)}
            style={{
              padding: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: currentFile?.id === file.id ? 'white' : '#ef4444',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileTree;