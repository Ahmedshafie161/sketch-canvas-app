import React from 'react';
import { getCommonObjectStyle, renderResizeHandles } from './canvasStyles';
import { renderTableObject } from './tableRenderer';

export const renderCanvasObject = (
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
) => {
  const isSelected = selectedObject?.id === obj.id;
  const commonStyle = getCommonObjectStyle(obj, isSelected, darkMode, canvasScale);

  const handleClick = (e) => {
    e.stopPropagation();
    if (selectedTool === 'select') {
      setSelectedObject(obj);
    } else if (selectedTool === 'connect') {
      handleConnect(obj.id);
    }
  };

  switch (obj.type) {
    case 'rectangle':
      return renderRectangle(obj, commonStyle, isSelected, darkMode, handleClick, handleObjectDoubleClick);
    
    case 'circle':
      return renderCircle(obj, commonStyle, isSelected, darkMode, handleClick, handleObjectDoubleClick);
    
    case 'triangle':
      return renderTriangle(obj, commonStyle, isSelected, darkMode, handleClick, handleObjectDoubleClick);
    
    case 'text':
      return renderText(obj, commonStyle, isSelected, darkMode, handleClick, handleObjectDoubleClick);
    
    case 'table':
      return renderTableObject(
        obj,
        commonStyle,
        isSelected,
        darkMode,
        showTableEditor,
        handleClick,
        handleObjectDoubleClick,
        handleCellEdit,
        handleCellMediaMenu,
        setShowTableEditor
      );
    
    case 'drawing':
      return renderDrawing(obj, commonStyle, isSelected, darkMode, handleClick);
    
    default:
      return null;
  }
};

const renderRectangle = (obj, commonStyle, isSelected, darkMode, handleClick, handleObjectDoubleClick) => {
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
      onClick={handleClick}
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
      {renderResizeHandles(isSelected)}
    </div>
  );
};

const renderCircle = (obj, commonStyle, isSelected, darkMode, handleClick, handleObjectDoubleClick) => {
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
      onClick={handleClick}
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
      {renderResizeHandles(isSelected)}
    </div>
  );
};

const renderTriangle = (obj, commonStyle, isSelected, darkMode, handleClick, handleObjectDoubleClick) => {
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
      onClick={handleClick}
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
      {renderResizeHandles(isSelected)}
    </div>
  );
};

const renderText = (obj, commonStyle, isSelected, darkMode, handleClick, handleObjectDoubleClick) => {
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
      onClick={handleClick}
      onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
    >
      {obj.text}
      {renderResizeHandles(isSelected)}
    </div>
  );
};

const renderDrawing = (obj, commonStyle, isSelected, darkMode, handleClick) => {
  return (
    <svg
      key={obj.id}
      style={{
        ...commonStyle,
        border: isSelected ? '2px dashed #3b82f6' : 'none',
      }}
      onClick={handleClick}
    >
      <polyline
        points={obj.path.map(p => `${p.x - obj.x},${p.y - obj.y}`).join(' ')}
        fill="none"
        stroke={obj.strokeColor || (darkMode ? '#f1f5f9' : '#000000')}
        strokeWidth={obj.strokeWidth || 2}
      />
      {renderResizeHandles(isSelected)}
    </svg>
  );
};
