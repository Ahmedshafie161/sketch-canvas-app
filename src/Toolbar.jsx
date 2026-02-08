import React from 'react';
import {
  Move, Square, Circle, Triangle, Type, Pencil, Table, Link,
  Save, Download, Upload, Trash2, Moon, Sun
} from 'lucide-react';

const Toolbar = ({
  selectedTool,
  selectedObject,
  currentFile,
  connectingFrom,
  darkMode,
  backgroundPattern,
  setSelectedTool,
  setDarkMode,
  setBackgroundPattern,
  saveCurrentFile,
  exportCanvas,
  importCanvas,
  importOneNote,
  deleteSelected,
  convertDrawingToText,
  convertDrawingToShape,
}) => {
  
  const tools = [
    { tool: 'select', icon: Move, label: 'Select' },
    { tool: 'rectangle', icon: Square, label: 'Rectangle' },
    { tool: 'circle', icon: Circle, label: 'Circle' },
    { tool: 'triangle', icon: Triangle, label: 'Triangle' },
    { tool: 'text', icon: Type, label: 'Text' },
    { tool: 'draw', icon: Pencil, label: 'Draw' },
    { tool: 'table', icon: Table, label: 'Table' },
    { tool: 'connect', icon: Link, label: 'Connect' },
  ];

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
      transition: 'background-color 0.3s ease',
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {tools.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => setSelectedTool(tool)}
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: selectedTool === tool
                ? '#3b82f6'
                : (darkMode ? '#334155' : '#e2e8f0'),
              border: 'none',
              borderRadius: '8px',
              color: selectedTool === tool ? 'white' : (darkMode ? '#f1f5f9' : '#1f2937'),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
            }}
            title={label}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {selectedObject?.type === 'drawing' && (
        <>
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
          }} />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => convertDrawingToText(selectedObject.id)}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: '#8b5cf6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <Type size={16} />
              Convert to Text
            </button>

            <button
              onClick={() => convertDrawingToShape(selectedObject.id, 'rectangle')}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <Square size={16} />
              Convert to Shape
            </button>
          </div>
        </>
      )}

      <div style={{
        width: '1px',
        height: '30px',
        backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      }} />

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: '0.625rem',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
            border: 'none',
            borderRadius: '8px',
            color: darkMode ? '#fbbf24' : '#1e293b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            transition: 'all 0.3s ease',
          }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <select
          value={backgroundPattern}
          onChange={(e) => setBackgroundPattern(e.target.value)}
          style={{
            padding: '0.625rem',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
            border: 'none',
            borderRadius: '8px',
            color: darkMode ? 'white' : '#1f2937',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <option value="grid">Grid</option>
          <option value="lines">Lines</option>
          <option value="none">None</option>
        </select>
      </div>

      <div style={{
        width: '1px',
        height: '30px',
        backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      }} />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={saveCurrentFile}
          disabled={!currentFile}
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: currentFile ? '#10b981' : '#64748b',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: currentFile ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          <Save size={16} />
          Save
        </button>

        <button
          onClick={exportCanvas}
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          <Download size={16} />
          Export
        </button>

        <label style={{
          padding: '0.625rem 1rem',
          backgroundColor: '#06b6d4',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
        }}>
          <Upload size={16} />
          Import
          <input
            type="file"
            accept=".json,.one,.txt,.html,.htm,.mht"
            onChange={(e) => {
              if (e.target.files[0]?.name.endsWith('.one') ||
                  e.target.files[0]?.name.endsWith('.html') ||
                  e.target.files[0]?.name.endsWith('.htm') ||
                  e.target.files[0]?.name.endsWith('.mht')) {
                importOneNote(e);
              } else {
                importCanvas(e);
              }
            }}
            style={{ display: 'none' }}
          />
        </label>

        <button
          onClick={deleteSelected}
          disabled={!selectedObject}
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: selectedObject ? '#ef4444' : '#64748b',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: selectedObject ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {currentFile && (
        <div style={{
          marginLeft: 'auto',
          fontSize: '0.9rem',
          color: '#94a3b8',
          fontWeight: '600',
        }}>
          {currentFile.name}
        </div>
      )}

      {connectingFrom && (
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'white',
        }}>
          Click another shape to connect
        </div>
      )}
    </div>
  );
};

export default Toolbar;
