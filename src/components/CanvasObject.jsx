// src/components/CanvasObject.jsx
import React, { useState } from 'react';
import { Image, Video, Table, Trash2 } from 'lucide-react';

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
  handleCellMediaMenu,
  handleCellEdit,
  handleCellResize,
  editingCell,
  setEditingCell,
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

  // Render nested table
  const renderNestedTable = (nestedTable, cellStyle) => {
    return (
      <table style={{
        width: '100%',
        height: '100%',
        borderCollapse: 'collapse',
        fontSize: '10px'
      }}>
        <tbody>
          {nestedTable.cells.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '2px',
                    fontSize: '10px',
                    ...cellStyle
                  }}
                >
                  {cell.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Handle opening image in modal
  const openImageModal = (imageSrc) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    modal.innerHTML = `
      <div style="position: relative;">
        <img src="${imageSrc}" style="max-width: 90vw; max-height: 90vh;" />
        <button onclick="this.parentElement.parentElement.remove()" style="
          position: absolute;
          top: -40px;
          right: 0;
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
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

    case 'table':
      return (
        <div
          key={obj.id}
          style={{
            ...commonStyle,
            backgroundColor: darkMode ? '#1e293b' : 'white',
            overflow: 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedTool === 'select') {
              setSelectedObject(obj);
            }
          }}
          onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
        >
          <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {obj.cells && obj.cells.map((row, ri) => (
                <tr key={ri}>
                  {row && row.map((cell, ci) => (
                    <td
                      key={ci}
                      data-cell-id={`${obj.id}-${ri}-${ci}`}
                      style={{
                        border: '1px solid ' + (darkMode ? '#475569' : '#cbd5e1'),
                        padding: '4px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        position: 'relative',
                        minWidth: cell?.customWidth || '80px',
                        minHeight: cell?.customHeight || '60px',
                        width: cell?.customWidth || 'auto',
                        height: cell?.customHeight || 'auto',
                        maxWidth: '300px',
                        maxHeight: '200px',
                        overflow: 'hidden',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCell && setEditingCell({ objId: obj.id, row: ri, col: ci });
                      }}
                      onDoubleClick={(e) => handleCellResize && handleCellResize(obj.id, ri, ci, e)}
                      onContextMenu={(e) => handleCellMediaMenu && handleCellMediaMenu(e, obj.id, ri, ci)}
                    >
                      {cell?.image && (
                        <div style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <img
                            src={cell.image}
                            alt="Cell content"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openImageModal(cell.image);
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            fontSize: '10px',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            padding: '2px 4px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellResize && handleCellResize(obj.id, ri, ci, e);
                          }}
                          >
                            Resize
                          </div>
                        </div>
                      )}
                      
                      {cell?.video && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <video
                            src={cell.video}
                            controls
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '100%',
                              cursor: 'pointer',
                            }}
                          />
                        </div>
                      )}
                      
                      {cell?.nestedTable && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          overflow: 'auto',
                        }}>
                          {renderNestedTable(cell.nestedTable, {
                            fontSize: '8px',
                            padding: '1px'
                          })}
                        </div>
                      )}
                      
                      {(!cell?.image && !cell?.video && !cell?.nestedTable) && (
                        <div
                          contentEditable={editingCell?.objId === obj.id && editingCell?.row === ri && editingCell?.col === ci}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            handleCellEdit && handleCellEdit(obj.id, ri, ci, { text: e.target.textContent });
                            setEditingCell && setEditingCell(null);
                          }}
                          style={{
                            outline: 'none',
                            minHeight: '20px',
                            color: darkMode ? '#f1f5f9' : '#1e293b',
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          {cell?.text || ''}
                        </div>
                      )}
                      
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        fontSize: '10px',
                        color: '#64748b',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        padding: '1px 3px',
                        borderRadius: '2px',
                        display: 'none',
                      }}
                      className="cell-actions"
                      >
                        ⋮
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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