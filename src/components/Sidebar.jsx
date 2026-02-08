import React from 'react';
import { FolderPlus, File, Trash2, ChevronRight, ChevronDown, LogOut, Plus } from 'lucide-react';

const Sidebar = ({
  currentUser,
  folders,
  files,
  currentFile,
  expandedFolders,
  darkMode,
  createFolder,
  createFile,
  openFile,
  deleteFile,
  deleteFolder,
  toggleFolder,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleLogout,
}) => {
  
  const renderFileTree = (parentId = null, level = 0) => {
    const childFolders = folders.filter(f => f.parentId === parentId);
    const childFiles = files.filter(f => f.folderId === parentId);

    return (
      <div style={{ marginLeft: level > 0 ? '1rem' : 0 }}>
        {childFolders.map(folder => (
          <div key={folder.id}>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, folder, 'folder')}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder)}
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
            {expandedFolders.has(folder.id) && renderFileTree(folder.id, level + 1)}
          </div>
        ))}

        {childFiles.map(file => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, file, 'file')}
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

  return (
    <div style={{
      width: '280px',
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRight: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      flexDirection: 'column',
      transition: 'background-color 0.3s ease',
    }}>
      <div style={{
        padding: '1.25rem',
        borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
            Sketch Canvas
          </h2>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
        }}>
          <button
            onClick={() => createFolder()}
            style={{
              flex: 1,
              padding: '0.625rem',
              backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              border: 'none',
              borderRadius: '6px',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <FolderPlus size={16} />
            Folder
          </button>

          <button
            onClick={() => createFile()}
            style={{
              flex: 1,
              padding: '0.625rem',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <Plus size={16} />
            File
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        {renderFileTree()}
      </div>

      <div style={{
        padding: '1rem',
        borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        fontSize: '0.85rem',
        color: '#64748b',
      }}>
        {currentUser && `Logged in as: ${currentUser}`}
      </div>
    </div>
  );
};

export default Sidebar;
