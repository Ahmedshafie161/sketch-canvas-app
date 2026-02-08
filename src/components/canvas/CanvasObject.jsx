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
    case 'line':
      return (
        <svg
          key={obj.id}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        >
          <line
            x1={obj.x1}
            y1={obj.y1}
            x2={obj.x2}
            y2={obj.y2}
            stroke={darkMode ? '#f1f5f9' : '#1e293b'}
            strokeWidth={2}
          />
        </svg>
      );
    case 'arrow':
      // Simple arrow rendering
      return (
        <svg
          key={obj.id}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        >
          <defs>
            <marker id={`arrowhead-${obj.id}`} markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 8 4, 0 8" fill={darkMode ? '#f1f5f9' : '#1e293b'} />
            </marker>
          </defs>
          <line
            x1={obj.x1}
            y1={obj.y1}
            x2={obj.x2}
            y2={obj.y2}
            stroke={darkMode ? '#f1f5f9' : '#1e293b'}
            strokeWidth={2}
            markerEnd={`url(#arrowhead-${obj.id})`}
          />
        </svg>
      );
    case 'table':
      return (
        <div
          key={obj.id}
          style={{
            position: 'absolute',
            left: obj.x,
            top: obj.y,
            width: obj.width,
            height: obj.height,
            background: darkMode ? '#1e293b' : '#fff',
            border: isSelected ? '2px solid #3b82f6' : '2px solid ' + (darkMode ? '#475569' : '#94a3b8'),
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={e => {
            e.stopPropagation();
            if (selectedTool === 'select') setSelectedObject(obj);
          }}
        >
          <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              {obj.cells.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        border: '1px solid #cbd5e1',
                        padding: '2px',
                        minWidth: 40,
                        minHeight: 24,
                        position: 'relative',
                        ...cell.customWidth && { width: cell.customWidth },
                        ...cell.customHeight && { height: cell.customHeight },
                      }}
                    >
                      {cell.nestedTable ? (
                        <span style={{ fontSize: '10px' }}>[Nested Table]</span>
                      ) : cell.image ? (
                        <img src={cell.image} alt="cell-img" style={{ maxWidth: 60, maxHeight: 40, display: 'block', margin: '0 auto' }} />
                      ) : cell.video ? (
                        <video src={cell.video} controls style={{ maxWidth: 60, maxHeight: 40, display: 'block', margin: '0 auto' }} />
                      ) : cell.text ? (
                        <span>{cell.text}</span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
};

export default CanvasObject;
