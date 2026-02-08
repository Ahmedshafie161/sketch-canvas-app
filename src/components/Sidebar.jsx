// src/components/Sidebar.jsx
import React from 'react';
import { FolderPlus, File, Plus, LogOut } from 'lucide-react';
import FileTree from './FileTree';

const Sidebar = ({ 
  darkMode, 
  currentUser, 
  handleLogout, 
  createFolder, 
  createFile,
  folders,
  files,
  currentFile,
  expandedFolders,
  toggleFolder,
  deleteFolder,
  deleteFile,
  openFile,
  renderFileTree
}) => {
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
      >
        {renderFileTree ? renderFileTree() : (
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
          />
        )}
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