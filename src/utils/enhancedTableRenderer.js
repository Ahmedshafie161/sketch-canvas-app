import React, { useState, useRef, useEffect } from 'react';
import { renderResizeHandles } from './canvasStyles';
import { 
  Bold, Italic, Underline, Highlighter, Plus, Minus, 
  Merge, Split, Image, Video, Table as TableIcon, Mic, Upload
} from 'lucide-react';

export const EnhancedTableRenderer = ({
  obj,
  commonStyle,
  isSelected,
  darkMode,
  showTableEditor,
  handleClick,
  handleObjectDoubleClick,
  handleCellEdit,
  handleCellMediaMenu,
  setShowTableEditor,
  handleImageUpload,
  handleVideoUpload,
  handleNestedTableAdd,
  handleVoiceRecording,
  handleMergeCells,
  handleSplitCell,
  handleAddRow,
  handleAddColumn,
  handleDeleteRow,
  handleDeleteColumn,
}) => {
  const [selectedCells, setSelectedCells] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [cellSelection, setCellSelection] = useState({ start: null, end: null });

  const handleCellMouseDown = (row, col, e) => {
    if (e.shiftKey && selectedCells.length > 0) {
      // Multi-select cells
      const lastCell = selectedCells[selectedCells.length - 1];
      const minRow = Math.min(lastCell.row, row);
      const maxRow = Math.max(lastCell.row, row);
      const minCol = Math.min(lastCell.col, col);
      const maxCol = Math.max(lastCell.col, col);
      
      const newSelected = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newSelected.push({ row: r, col: c });
        }
      }
      setSelectedCells(newSelected);
    } else {
      setSelectedCells([{ row, col }]);
    }
  };

  const handleCellDoubleClick = (row, col, e) => {
    e.stopPropagation();
    setEditingCell({ row, col });
  };

  const renderTextFormatting = (row, col) => {
    const cell = obj.cells[row][col];
    
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        background: darkMode ? '#1e293b' : 'white',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        gap: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <button
          onClick={() => {
            const newStyle = { ...cell.style, fontWeight: cell.style?.fontWeight === 'bold' ? 'normal' : 'bold' };
            handleCellEdit(obj.id, row, col, { style: newStyle });
          }}
          style={{
            padding: '4px 8px',
            background: cell.style?.fontWeight === 'bold' ? '#3b82f6' : 'transparent',
            border: '1px solid #94a3b8',
            borderRadius: '4px',
            cursor: 'pointer',
            color: cell.style?.fontWeight === 'bold' ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b')
          }}
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => {
            const newStyle = { ...cell.style, fontStyle: cell.style?.fontStyle === 'italic' ? 'normal' : 'italic' };
            handleCellEdit(obj.id, row, col, { style: newStyle });
          }}
          style={{
            padding: '4px 8px',
            background: cell.style?.fontStyle === 'italic' ? '#3b82f6' : 'transparent',
            border: '1px solid #94a3b8',
            borderRadius: '4px',
            cursor: 'pointer',
            color: cell.style?.fontStyle === 'italic' ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b')
          }}
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => {
            const newStyle = { ...cell.style, textDecoration: cell.style?.textDecoration === 'underline' ? 'none' : 'underline' };
            handleCellEdit(obj.id, row, col, { style: newStyle });
          }}
          style={{
            padding: '4px 8px',
            background: cell.style?.textDecoration === 'underline' ? '#3b82f6' : 'transparent',
            border: '1px solid #94a3b8',
            borderRadius: '4px',
            cursor: 'pointer',
            color: cell.style?.textDecoration === 'underline' ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b')
          }}
        >
          <Underline size={14} />
        </button>
        <input
          type="color"
          value={cell.style?.backgroundColor || '#ffffff'}
          onChange={(e) => {
            const newStyle = { ...cell.style, backgroundColor: e.target.value };
            handleCellEdit(obj.id, row, col, { style: newStyle });
          }}
          style={{ width: '32px', height: '28px', cursor: 'pointer' }}
          title="Highlight color"
        />
        <input
          type="number"
          value={cell.style?.fontSize || 14}
          onChange={(e) => {
            const newStyle = { ...cell.style, fontSize: parseInt(e.target.value) };
            handleCellEdit(obj.id, row, col, { style: newStyle });
          }}
          style={{ width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid #94a3b8' }}
          min="8"
          max="72"
          title="Font size"
        />
        <input
          type="color"
          value={cell.style?.color || '#000000'}
          onChange={(e) => {
            const newStyle = { ...cell.style, color: e.target.value };
            handleCellEdit(obj.id, row, col, { style: newStyle });
          }}
          style={{ width: '32px', height: '28px', cursor: 'pointer' }}
          title="Text color"
        />
      </div>
    );
  };

  const renderCell = (row, col) => {
    const cell = obj.cells[row][col];
    
    if (!cell || cell.merged) return null;

    const isEditing = editingCell?.row === row && editingCell?.col === col;
    const isCellSelected = selectedCells.some(c => c.row === row && c.col === col);
    
    const rowSpan = cell.rowSpan || 1;
    const colSpan = cell.colSpan || 1;

    return (
      <td
        key={`${row}-${col}`}
        rowSpan={rowSpan}
        colSpan={colSpan}
        data-cell-id={`${obj.id}-${row}-${col}`}
        style={{
          border: '1px solid ' + (darkMode ? '#475569' : '#cbd5e1'),
          padding: '8px',
          position: 'relative',
          minWidth: cell.customWidth || '100px',
          minHeight: cell.customHeight || '60px',
          width: cell.customWidth || 'auto',
          height: cell.customHeight || 'auto',
          maxWidth: '500px',
          maxHeight: '400px',
          overflow: 'auto',
          backgroundColor: isCellSelected ? (darkMode ? '#1e40af' : '#dbeafe') : (cell.style?.backgroundColor || 'transparent'),
          ...cell.style
        }}
        onMouseDown={(e) => handleCellMouseDown(row, col, e)}
        onDoubleClick={(e) => handleCellDoubleClick(row, col, e)}
        onContextMenu={(e) => handleCellMediaMenu(e, obj.id, row, col)}
      >
        {isCellSelected && isEditing && renderTextFormatting(row, col)}
        
        {cell.image && (
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
              window.open(cell.image, '_blank');
            }}
          />
        )}

        {cell.gif && (
          <img
            src={cell.gif}
            alt="GIF content"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        )}

        {cell.video && (
          <video
            src={cell.video}
            controls
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        )}

        {cell.audio && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <audio src={cell.audio} controls style={{ width: '100%' }} />
            {cell.transcript && (
              <div style={{
                fontSize: '12px',
                color: darkMode ? '#94a3b8' : '#64748b',
                padding: '8px',
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '4px',
                maxHeight: '100px',
                overflow: 'auto'
              }}>
                <strong>Transcript:</strong>
                <p>{cell.transcript}</p>
              </div>
            )}
          </div>
        )}

        {cell.nestedTable && (
          <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <tbody>
                {cell.nestedTable.cells.map((nestedRow, ri) => (
                  <tr key={ri}>
                    {nestedRow.map((nestedCell, ci) => (
                      <td
                        key={ci}
                        style={{
                          border: '1px solid #cbd5e1',
                          padding: '4px',
                          fontSize: '10px',
                        }}
                      >
                        {nestedCell.text}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!cell.image && !cell.gif && !cell.video && !cell.audio && !cell.nestedTable && (
          <div
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              handleCellEdit(obj.id, row, col, { text: e.target.textContent });
              setEditingCell(null);
            }}
            onInput={(e) => {
              // Real-time update
              handleCellEdit(obj.id, row, col, { text: e.target.textContent });
            }}
            style={{
              outline: isEditing ? '2px solid #3b82f6' : 'none',
              minHeight: '20px',
              width: '100%',
              height: '100%',
              cursor: isEditing ? 'text' : 'default',
            }}
          >
            {cell.text}
          </div>
        )}
      </td>
    );
  };

  return (
    <div
      key={obj.id}
      style={{
        ...commonStyle,
        backgroundColor: darkMode ? '#1e293b' : 'white',
        overflow: 'visible',
      }}
      onClick={handleClick}
      onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
    >
      <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <tbody>
          {obj.cells.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => renderCell(ri, ci))}
            </tr>
          ))}
        </tbody>
      </table>

      {renderResizeHandles(isSelected)}

      {/* Table toolbar */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '-45px',
          left: 0,
          background: darkMode ? '#1e293b' : 'white',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
        }}>
          <button
            onClick={() => handleAddRow(obj.id)}
            style={toolButtonStyle(darkMode)}
            title="Add row"
          >
            <Plus size={14} /> Row
          </button>
          <button
            onClick={() => handleAddColumn(obj.id)}
            style={toolButtonStyle(darkMode)}
            title="Add column"
          >
            <Plus size={14} /> Col
          </button>
          <button
            onClick={() => handleDeleteRow(obj.id, selectedCells[0]?.row)}
            disabled={selectedCells.length === 0}
            style={toolButtonStyle(darkMode, selectedCells.length === 0)}
            title="Delete row"
          >
            <Minus size={14} /> Row
          </button>
          <button
            onClick={() => handleDeleteColumn(obj.id, selectedCells[0]?.col)}
            disabled={selectedCells.length === 0}
            style={toolButtonStyle(darkMode, selectedCells.length === 0)}
            title="Delete column"
          >
            <Minus size={14} /> Col
          </button>
          <button
            onClick={() => handleMergeCells(obj.id, selectedCells)}
            disabled={selectedCells.length < 2}
            style={toolButtonStyle(darkMode, selectedCells.length < 2)}
            title="Merge cells"
          >
            <Merge size={14} />
          </button>
          <button
            onClick={() => handleSplitCell(obj.id, selectedCells[0])}
            disabled={selectedCells.length !== 1}
            style={toolButtonStyle(darkMode, selectedCells.length !== 1)}
            title="Split cell"
          >
            <Split size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const toolButtonStyle = (darkMode, disabled = false) => ({
  padding: '6px 10px',
  background: disabled ? '#64748b' : (darkMode ? '#334155' : '#e2e8f0'),
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  color: disabled ? '#94a3b8' : (darkMode ? '#f1f5f9' : '#1e293b'),
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  opacity: disabled ? 0.5 : 1
});
