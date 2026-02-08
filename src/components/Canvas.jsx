// src/components/Canvas.jsx
import React from 'react';
import { Edit3 } from 'lucide-react';
import CanvasObject from './CanvasObject';

const Canvas = ({
  canvasRef,
  darkMode,
  backgroundPattern,
  currentFile,
  selectedTool,
  canvasObjects,
  selectedObject,
  connections,
  isDrawing,
  drawingPath,
  canvasScale,
  canvasOffset,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  setSelectedObject,
  setConnectingFrom,
  setShowTableEditor,
  setContextMenu,
  setCellMediaMenu,
  handleObjectDoubleClick,
  handleConnect,
  handleContextMenu,
  getConnectionPoints
}) => {
  const getBackgroundStyle = () => {
    const baseStyle = {
      backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
      transition: 'background-color 0.3s ease',
    };
    
    if (backgroundPattern === 'grid') {
      return {
        ...baseStyle,
        backgroundImage: darkMode 
          ? 'radial-gradient(circle, #334155 1px, transparent 1px)'
          : 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    } else if (backgroundPattern === 'lines') {
      return {
        ...baseStyle,
        backgroundImage: darkMode
          ? 'linear-gradient(#334155 1px, transparent 1px)'
          : 'linear-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    }
    
    return baseStyle;
  };

  const renderResizeHandles = (isSelected) => {
    if (!isSelected) return null;
    
    const handleStyle = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: '#3b82f6',
      border: '2px solid white',
      borderRadius: '50%',
      cursor: 'nwse-resize',
    };
    
    return (
      <>
        <div style={{ ...handleStyle, left: '-5px', top: '-5px', cursor: 'nw-resize' }} />
        <div style={{ ...handleStyle, right: '-5px', top: '-5px', cursor: 'ne-resize' }} />
        <div style={{ ...handleStyle, left: '-5px', bottom: '-5px', cursor: 'sw-resize' }} />
        <div style={{ ...handleStyle, right: '-5px', bottom: '-5px', cursor: 'se-resize' }} />
      </>
    );
  };

  return (
    <div
      ref={canvasRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        cursor: selectedTool === 'draw' ? 'crosshair' : selectedTool === 'select' ? 'default' : 'crosshair',
        ...getBackgroundStyle(),
      }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onTouchStart={handleCanvasMouseDown}
      onTouchMove={handleCanvasMouseMove}
      onTouchEnd={handleCanvasMouseUp}
      onClick={() => {
        setSelectedObject(null);
        setConnectingFrom(null);
        setShowTableEditor(null);
        setContextMenu(null);
        setCellMediaMenu(null);
      }}
    >
      {/* Render connections */}
      <svg style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}>
        {connections.map(conn => {
          const fromObj = canvasObjects.find(o => o.id === conn.from);
          const toObj = canvasObjects.find(o => o.id === conn.to);
          if (!fromObj || !toObj) return null;
          
          const from = getConnectionPoints ? getConnectionPoints(fromObj) : { x: fromObj.x + fromObj.width / 2, y: fromObj.y + fromObj.height / 2 };
          const to = getConnectionPoints ? getConnectionPoints(toObj) : { x: toObj.x + toObj.width / 2, y: toObj.y + toObj.height / 2 };
          
          return (
            <g key={conn.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#3b82f6"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>
      </svg>
      
      // Update Canvas.jsx render section:
{canvasObjects.map(obj => (
  <CanvasObject
    key={obj.id}
    obj={obj}
    isSelected={selectedObject?.id === obj.id}
    selectedTool={selectedTool}
    darkMode={darkMode}
    canvasScale={canvasScale}
    handleObjectDoubleClick={handleObjectDoubleClick}
    handleConnect={handleConnect}
    setSelectedObject={setSelectedObject}
    handleContextMenu={handleContextMenu}
    handleCellMediaMenu={handleCellMediaMenu}
    handleCellEdit={handleCellEdit}
    handleCellResize={handleCellResize}
    editingCell={editingCell}
    setEditingCell={setEditingCell}
    renderResizeHandles={renderResizeHandles}
  />
))}
      
      {isDrawing && drawingPath.length > 0 && (
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
          }}
        >
          <polyline
            points={drawingPath.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={darkMode ? '#f1f5f9' : '#000000'}
            strokeWidth="2"
          />
        </svg>
      )}
      
      {!currentFile && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#64748b',
        }}>
          <Edit3 size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: darkMode ? '#94a3b8' : '#475569' }}>
            No File Selected
          </h3>
          <p style={{ fontSize: '1rem' }}>
            Create or open a file to start sketching
          </p>
        </div>
      )}
    </div>
  );
};

export default Canvas;