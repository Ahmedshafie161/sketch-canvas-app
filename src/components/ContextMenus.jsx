import React from 'react';
import { Type, Square, Circle, Triangle, Image, Video, Table, Trash2 } from 'lucide-react';

const ContextMenus = ({
  contextMenu,
  cellMediaMenu,
  darkMode,
  setContextMenu,
  setCellMediaMenu,
  convertDrawingToText,
  convertDrawingToShape,
  handleImageUpload,
  handleVideoUpload,
  handleNestedTableAdd,
  handleCellEdit,
}) => {
  return (
    <>
      {/* Context Menu for Drawing Objects */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: darkMode ? '#1e293b' : 'white',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
          onClick={() => setContextMenu(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => {
                convertDrawingToText(contextMenu.objectId);
                setContextMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Type size={14} />
              Convert to Text
            </button>
            <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0' }} />
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'rectangle');
                setContextMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Square size={14} />
              Convert to Rectangle
            </button>
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'circle');
                setContextMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Circle size={14} />
              Convert to Circle
            </button>
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'triangle');
                setContextMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Triangle size={14} />
              Convert to Triangle
            </button>
          </div>
        </div>
      )}

      {/* Context Menu for Cell Media */}
      {cellMediaMenu && (
        <div
          style={{
            position: 'fixed',
            top: cellMediaMenu.y,
            left: cellMediaMenu.x,
            backgroundColor: darkMode ? '#1e293b' : 'white',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              Add to Cell
            </h4>

            <label style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}>
              <Image size={14} />
              Add Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleImageUpload(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, e);
                  setCellMediaMenu(null);
                }}
                style={{ display: 'none' }}
              />
            </label>

            <label style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}>
              <Video size={14} />
              Add Video
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  handleVideoUpload(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, e);
                  setCellMediaMenu(null);
                }}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={() => {
                handleNestedTableAdd(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col);
                setCellMediaMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Table size={14} />
              Add Nested Table
            </button>

            <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0', margin: '4px 0' }} />

            <button
              onClick={() => {
                handleCellEdit(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, {
                  text: '',
                  image: null,
                  video: null,
                  nestedTable: null
                });
                setCellMediaMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Trash2 size={14} />
              Clear Cell
            </button>

            <button
              onClick={() => setCellMediaMenu(null)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ContextMenus;
