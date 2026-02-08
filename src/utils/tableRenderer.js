import React from 'react';
import { renderResizeHandles } from './canvasStyles';

export const renderTableObject = (
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
) => {
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

  const handleCellResize = (objId, row, col, e) => {
    e.stopPropagation();
    const cell = document.querySelector(`[data-cell-id="${objId}-${row}-${col}"]`);
    if (!cell) return;

    const newWidth = window.prompt('Enter cell width (px):', cell.offsetWidth);
    const newHeight = window.prompt('Enter cell height (px):', cell.offsetHeight);

    if (newWidth && newHeight) {
      const content = {
        customWidth: parseInt(newWidth),
        customHeight: parseInt(newHeight)
      };
      handleCellEdit(objId, row, col, content);
    }
  };

  return (
    <div
      key={obj.id}
      style={{
        ...commonStyle,
        backgroundColor: darkMode ? '#1e293b' : 'white',
        overflow: 'auto',
      }}
      onClick={handleClick}
      onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
    >
      <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {obj.cells.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  data-cell-id={`${obj.id}-${ri}-${ci}`}
                  style={{
                    border: '1px solid ' + (darkMode ? '#475569' : '#cbd5e1'),
                    padding: '4px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    position: 'relative',
                    minWidth: cell.customWidth || '80px',
                    minHeight: cell.customHeight || '60px',
                    width: cell.customWidth || 'auto',
                    height: cell.customHeight || 'auto',
                    maxWidth: '300px',
                    maxHeight: '200px',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onDoubleClick={(e) => handleCellResize(obj.id, ri, ci, e)}
                  onContextMenu={(e) => handleCellMediaMenu(e, obj.id, ri, ci)}
                >
                  {cell.image && (
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
                              <img src="${cell.image}" style="max-width: 90vw; max-height: 90vh;" />
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
                        handleCellResize(obj.id, ri, ci, e);
                      }}
                      >
                        Resize
                      </div>
                    </div>
                  )}

                  {cell.video && (
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

                  {cell.nestedTable && (
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

                  {!cell.image && !cell.video && !cell.nestedTable && (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        handleCellEdit(obj.id, ri, ci, { text: e.target.textContent });
                      }}
                      style={{
                        outline: 'none',
                        minHeight: '20px',
                        color: darkMode ? '#f1f5f9' : '#1e293b',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      {cell.text}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {renderResizeHandles(isSelected)}

      {showTableEditor === obj.id && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: darkMode ? '#1e293b' : 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 1000,
            minWidth: '400px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: '0 0 16px 0', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
            Table Editor
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              Click on a cell to edit text, or right-click to add media:
            </p>
          </div>

          <button
            onClick={() => setShowTableEditor(null)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
