import React from 'react';
import { Type, Square, Circle, Triangle } from 'lucide-react';

const CanvasObject = ({
  obj,
  isSelected,
  selectedTool,
  darkMode,
  setSelectedObject,
  handleConnect,
  handleObjectDoubleClick,
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
          onClick={e => {
            e.stopPropagation();
            if (selectedTool === 'select') setSelectedObject(obj);
            else if (selectedTool === 'connect') handleConnect(obj.id);
          }}
          onDoubleClick={e => handleObjectDoubleClick(obj, e)}
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
          {renderResizeHandles()}
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
          onClick={e => {
            e.stopPropagation();
            if (selectedTool === 'select') setSelectedObject(obj);
            else if (selectedTool === 'connect') handleConnect(obj.id);
          }}
          onDoubleClick={e => handleObjectDoubleClick(obj, e)}
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
          {renderResizeHandles()}
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
          onClick={e => {
            e.stopPropagation();
            if (selectedTool === 'select') setSelectedObject(obj);
            else if (selectedTool === 'connect') handleConnect(obj.id);
          }}
          onDoubleClick={e => handleObjectDoubleClick(obj, e)}
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
          {renderResizeHandles()}
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
          onClick={e => {
            e.stopPropagation();
            if (selectedTool === 'select') setSelectedObject(obj);
          }}
          onDoubleClick={e => handleObjectDoubleClick(obj, e)}
        >
          {obj.text}
          {renderResizeHandles()}
        </div>
      );
    default:
      return null;
  }
};

export default CanvasObject;
