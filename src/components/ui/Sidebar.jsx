import React from 'react';
import { LogOut, FolderPlus, Plus } from 'lucide-react';
import FileTree from '../filetree/FileTree';

const Sidebar = ({
  darkMode,
  handleLogout,
  createFolder,
  createFile,
  folders,
  files,
  expandedFolders,
  currentFile,
  handleDragStart,
  handleDragOver,
  handleDrop,
  toggleFolder,
  deleteFolder,
  deleteFile,
  openFile,
  currentUser
}) => (
  <div className="sidebar" style={{
    '--sidebar-bg': darkMode ? '#1e293b' : 'white',
    '--sidebar-border': darkMode ? '#334155' : '#e2e8f0',
  }}>
    <div className="sidebar-header" style={{
      '--sidebar-border': darkMode ? '#334155' : '#e2e8f0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 className="sidebar-title">Sketch Canvas</h2>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
      <div className="sidebar-actions">
        <button className="sidebar-action-btn sidebar-action-folder" onClick={() => createFolder()} style={{
          '--sidebar-folder-bg': darkMode ? '#334155' : '#e2e8f0',
          '--sidebar-folder-fg': darkMode ? '#f1f5f9' : '#1e293b',
        }}>
          <FolderPlus size={16} />
          Folder
        </button>
        <button className="sidebar-action-btn sidebar-action-file" onClick={() => createFile()}>
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
      <FileTree
        folders={folders}
        files={files}
        expandedFolders={expandedFolders}
        currentFile={currentFile}
        darkMode={darkMode}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        toggleFolder={toggleFolder}
        createFolder={createFolder}
        createFile={createFile}
        deleteFolder={deleteFolder}
        deleteFile={deleteFile}
        openFile={openFile}
      />
    </div>
    <div className="sidebar-footer" style={{
      '--sidebar-border': darkMode ? '#334155' : '#e2e8f0',
    }}>
      {currentUser && `Logged in as: ${currentUser}`}
    </div>
  </div>
);

export default Sidebar;
