import React from 'react';
import RenderNestedTable from './RenderNestedTable';
export default function RenderObject(props) {
  // Destructure all needed props
  const {
    obj, selectedObject, selectedTool, darkMode, canvasScale,
    setSelectedObject, handleConnect, handleObjectDoubleClick,
    handleCellResize, handleCellMediaMenu, setEditingCell, editingCell,
    setShowTableEditor, showTableEditor, handleCellEdit
  } = props;
  const isSelected = selectedObject?.id === obj.id;
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
  const renderResizeHandles = () => {
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
  switch (obj.type) {
    case 'table':
      return (
        <div
          key={obj.id}
          style={{
            ...commonStyle,
            background: darkMode ? '#1e293b' : '#fff',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={e => {
            e.stopPropagation();
            if (selectedTool === 'select') setSelectedObject(obj);
          }}
          onDoubleClick={e => handleObjectDoubleClick(obj, e)}
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
                      data-cell-id={`${obj.id}-${ri}-${ci}`}
                      onDoubleClick={e => {
                        e.stopPropagation();
                        setEditingCell && setEditingCell({ objId: obj.id, row: ri, col: ci });
                      }}
                      onContextMenu={e => {
                        e.preventDefault();
                        handleCellMediaMenu && handleCellMediaMenu(obj.id, ri, ci, e);
                      }}
                    >
                      {/* Render nested table if present */}
                      {cell.nestedTable ? (
                        <RenderNestedTable nestedTable={cell.nestedTable} cellStyle={{ fontSize: '10px' }} />
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
          {renderResizeHandles()}
        </div>
      );
    // ...other cases for shapes, text, etc. (not shown for brevity)
    default:
      return null;
  }
}
