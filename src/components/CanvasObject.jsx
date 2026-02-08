// src/components/CanvasObject.jsx
import React from 'react';

const CanvasObject = ({
  obj,
  isSelected,
  selectedTool,
  darkMode,
  canvasScale,
  handleObjectDoubleClick,
  handleConnect,
  setSelectedObject,
  handleContextMenu,
  renderResizeHandles
}) => {
  const commonStyle = {
    position: 'absolute',
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    border: isSelected ? '2px solid #3b82f6' : '2px solid ' + (darkMode ? '#475569' : '#94a3b8'),
    cursor: selectedTool === 'select' ? 'move' : 'default',
    transition: 'border-color 0.2s',
    transform: `scale(${1 / canvasScale})`,
    transformOrigin: '0 0',
  };

  switch (obj.type) {
    case 'rectangle':
      return (
        <div
          key={obj.id}
          style={{
            ...commonStyle,
            backgroundColor: obj.backgroundColor || (darkMode ? '#334155' : '#e2e8f0'),
            backgroundImage: obj.imageUrl ? `url(${obj.imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedTool === 'select') {
              setSelectedObject(obj);
            } else if (selectedTool === 'connect') {
              handleConnect(obj.id);
            }
          }}
          onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
        >
          {obj.text && (
            <div style={{
              width: '100%',
              textAlign: 'center',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              fontSize: '1rem',
              wordBreak: 'break-word',
              pointerEvents: 'none',
            }}>{obj.text}</div>
          )}
          {obj.imageUrl && obj.text && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              {obj.text}
            </div>
          )}
          {renderResizeHandles && renderResizeHandles(isSelected)}
        </div>
      );

    case 'circle':
      return (
        <div
          key={obj.id}
          style={{
            ...commonStyle,
            borderRadius: '50%',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedTool === 'select') {
              setSelectedObject(obj);
            } else if (selectedTool === 'connect') {
              handleConnect(obj.id);
            }
          }}
          onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
        >
          {obj.text && (
            <div style={{
              width: '100%',
              textAlign: 'center',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              fontSize: '1rem',
              wordBreak: 'break-word',
              pointerEvents: 'none',
            }}>{obj.text}</div>
          )}
          {renderResizeHandles && renderResizeHandles(isSelected)}
        </div>
      );

    case 'triangle':
      return (
        <div
          key={obj.id}
          style={{
            ...commonStyle,
            backgroundColor: 'transparent',
            borderLeft: `${obj.width / 2}px solid transparent`,
            borderRight: `${obj.width / 2}px solid transparent`,
            borderBottom: `${obj.height}px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            width: 0,
            height: 0,
            border: isSelected ? '2px solid #3b82f6' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedTool === 'select') {
              setSelectedObject(obj);
            } else if (selectedTool === 'connect') {
              handleConnect(obj.id);
            }
          }}
          onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
        >
          {obj.text && (
            <div style={{
              width: '100%',
              textAlign: 'center',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              fontSize: '1rem',
              wordBreak: 'break-word',
              pointerEvents: 'none',
            }}>{obj.text}</div>
          )}
          {renderResizeHandles && renderResizeHandles(isSelected)}
        </div>
      );

    case 'text':
      return (
        <div
          key={obj.id}
          style={{
            ...commonStyle,
            backgroundColor: obj.backgroundColor || 'transparent',
            border: isSelected ? '2px dashed #3b82f6' : 'none',
            padding: '8px',
            fontSize: obj.fontSize || '16px',
            color: darkMode ? '#f1f5f9' : '#1e293b',
            overflow: obj.overflow || 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedTool === 'select') {
              setSelectedObject(obj);
            }
          }}
          onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
        >
          {obj.text}
          {renderResizeHandles && renderResizeHandles(isSelected)}
        </div>
      );

    case 'drawing':
      return (
        <svg
          key={obj.id}
          style={{
            ...commonStyle,
            border: isSelected ? '2px dashed #3b82f6' : 'none',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedTool === 'select') {
              setSelectedObject(obj);
            }
          }}
          onContextMenu={(e) => handleContextMenu && handleContextMenu(e, obj)}
        >
          <polyline
            points={obj.path.map(p => `${p.x - obj.x},${p.y - obj.y}`).join(' ')}
            fill="none"
            stroke={obj.strokeColor || (darkMode ? '#f1f5f9' : '#000000')}
            strokeWidth={obj.strokeWidth || 2}
          />
          {renderResizeHandles && renderResizeHandles(isSelected)}
        </svg>
      );

    default:
      return null;
  }
};

export default CanvasObject;