import React from 'react';
import { Edit3 } from 'lucide-react';
import { renderCanvasObject } from '../utils/canvasRenderers';
import { getBackgroundStyle } from '../utils/canvasStyles';

const Canvas = ({
  canvasRef,
  currentFile,
  canvasObjects,
  connections,
  isDrawing,
  drawingPath,
  selectedObject,
  selectedTool,
  darkMode,
  backgroundPattern,
  showTableEditor,
  canvasOffset,
  canvasScale,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleObjectDoubleClick,
  handleConnect,
  setSelectedObject,
  setConnectingFrom,
  setShowTableEditor,
  setContextMenu,
  setCellMediaMenu,
  handleCellEdit,
  handleCellMediaMenu,
}) => {
  
  const getConnectionPoints = (obj) => {
    return {
      x: obj.x + obj.width / 2,
      y: obj.y + obj.height / 2,
    };
  };

  return (
    <div
      ref={canvasRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        cursor: selectedTool === 'draw' ? 'crosshair' : selectedTool === 'select' ? 'default' : 'crosshair',
        ...getBackgroundStyle(darkMode, backgroundPattern),
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

          const from = getConnectionPoints(fromObj);
          const to = getConnectionPoints(toObj);

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

      {/* Render canvas objects */}
      {canvasObjects.map(obj => renderCanvasObject(
        obj,
        selectedObject,
        selectedTool,
        darkMode,
        canvasScale,
        showTableEditor,
        setSelectedObject,
        handleConnect,
        handleObjectDoubleClick,
        handleCellEdit,
        handleCellMediaMenu,
        setShowTableEditor
      ))}

      {/* Render current drawing path */}
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

      {/* No file selected state */}
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
