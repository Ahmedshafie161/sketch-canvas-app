import React, { useState } from 'react';
import {
  Move, Square, Circle, Triangle, Type, Pencil, Table, Link,
  Save, Download, Upload, Trash2, Moon, Sun, Play, Pause,
  Zap, Clock, Cloud, CloudOff
} from 'lucide-react';

const EnhancedToolbar = ({
  selectedTool,
  selectedObject,
  currentFile,
  connectingFrom,
  darkMode,
  backgroundPattern,
  syncEnabled,
  animations,
  setSelectedTool,
  setDarkMode,
  setBackgroundPattern,
  saveCurrentFile,
  exportCanvas,
  importCanvas,
  importPDF,
  deleteSelected,
  convertDrawingToText,
  convertDrawingToShape,
  addAnimation,
  removeAnimation,
  playAnimations,
  enableCloudSync,
  syncFromCloud,
}) => {
  const [showAnimationPanel, setShowAnimationPanel] = useState(false);
  const [animationType, setAnimationType] = useState('fade');
  const [animationDuration, setAnimationDuration] = useState(1000);

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

  const handleAddAnimation = () => {
    if (selectedObject) {
      addAnimation(selectedObject.id, animationType, animationDuration);
      alert(`Animation added to ${selectedObject.type}`);
    } else {
      alert('Please select an object first');
    }
  };

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
              OCR to Text
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
              To Shape
            </button>
          </div>
        </>
      )}

      <div style={{
        width: '1px',
        height: '30px',
        backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      }} />

      {/* Animation Controls */}
      <button
        onClick={() => setShowAnimationPanel(!showAnimationPanel)}
        style={{
          padding: '0.625rem 1rem',
          backgroundColor: showAnimationPanel ? '#f59e0b' : (darkMode ? '#334155' : '#e2e8f0'),
          border: 'none',
          borderRadius: '8px',
          color: showAnimationPanel ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b'),
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
        }}
        title="Animation Controls"
      >
        <Zap size={16} />
        Animations
      </button>

      {showAnimationPanel && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: darkMode ? '#1e293b' : 'white',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          zIndex: 100,
          minWidth: '400px',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
            Animation Settings
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : '#64748b' }}>
                Animation Type:
              </label>
              <select
                value={animationType}
                onChange={(e) => setAnimationType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  backgroundColor: darkMode ? '#334155' : '#f8fafc',
                  border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                  borderRadius: '6px',
                  color: darkMode ? '#f1f5f9' : '#1e293b',
                }}
              >
                <option value="fade">Fade In/Out</option>
                <option value="slide">Slide</option>
                <option value="rotate">Rotate</option>
                <option value="scale">Scale</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : '#64748b' }}>
                Duration (ms):
              </label>
              <input
                type="number"
                value={animationDuration}
                onChange={(e) => setAnimationDuration(parseInt(e.target.value))}
                min="100"
                max="5000"
                step="100"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  backgroundColor: darkMode ? '#334155' : '#f8fafc',
                  border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                  borderRadius: '6px',
                  color: darkMode ? '#f1f5f9' : '#1e293b',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleAddAnimation}
                disabled={!selectedObject}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  backgroundColor: selectedObject ? '#3b82f6' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: selectedObject ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                }}
              >
                Add to Selected
              </button>

              <button
                onClick={playAnimations}
                disabled={animations.length === 0}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  backgroundColor: animations.length > 0 ? '#22c55e' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: animations.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Play size={14} />
                Play All ({animations.length})
              </button>
            </div>

            <button
              onClick={() => setShowAnimationPanel(false)}
              style={{
                padding: '0.5rem',
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                border: 'none',
                borderRadius: '6px',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Close
            </button>
          </div>
        </div>
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

      {/* Cloud Sync */}
      <button
        onClick={() => enableCloudSync(!syncEnabled)}
        style={{
          padding: '0.625rem 1rem',
          backgroundColor: syncEnabled ? '#22c55e' : '#64748b',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
        }}
        title={syncEnabled ? 'Cloud Sync Enabled' : 'Enable Cloud Sync'}
      >
        {syncEnabled ? <Cloud size={16} /> : <CloudOff size={16} />}
        {syncEnabled ? 'Synced' : 'Offline'}
      </button>

      {syncEnabled && (
        <button
          onClick={syncFromCloud}
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: '#06b6d4',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
          title="Sync from Cloud"
        >
          <Download size={16} />
          Pull
        </button>
      )}

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
            accept=".json,.pdf,.one,.txt,.html,.htm,.mht"
            onChange={(e) => {
              if (e.target.files[0]?.name.endsWith('.pdf')) {
                importPDF(e);
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

export default EnhancedToolbar;
