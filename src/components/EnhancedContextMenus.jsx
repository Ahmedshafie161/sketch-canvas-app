import React, { useState } from 'react';
import { 
  Type, Square, Circle, Triangle, Image, Video, Table, Trash2,
  Mic, MicOff, FileText, Smartphone, Upload
} from 'lucide-react';

const EnhancedContextMenus = ({
  contextMenu,
  cellMediaMenu,
  darkMode,
  setContextMenu,
  setCellMediaMenu,
  convertDrawingToText,
  convertDrawingToShape,
  handleImageUpload,
  handleGifUpload,
  handleVideoUpload,
  handleNestedTableAdd,
  handleCellEdit,
  handleVoiceRecording,
  handleStopVoiceRecording,
  handlePDFImport,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const startRecording = async (objId, row, col) => {
    setIsRecording(true);
    const result = await handleVoiceRecording(objId, row, col, (transcript, isInterim) => {
      setCurrentTranscript(transcript);
    });

    if (!result.success) {
      alert('Failed to start recording: ' + result.error);
      setIsRecording(false);
    }
  };

  const stopRecording = async (objId, row, col) => {
    const result = await handleStopVoiceRecording(objId, row, col);
    setIsRecording(false);
    setCurrentTranscript('');
    setCellMediaMenu(null);

    if (result.success) {
      alert('Recording saved with transcript!');
    } else {
      alert('Failed to stop recording: ' + result.error);
    }
  };

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
              style={menuButtonStyle(darkMode)}
            >
              <Type size={14} />
              Convert to Text (OCR)
            </button>
            <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0' }} />
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'rectangle');
                setContextMenu(null);
              }}
              style={menuButtonStyle(darkMode)}
            >
              <Square size={14} />
              Convert to Rectangle
            </button>
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'circle');
                setContextMenu(null);
              }}
              style={menuButtonStyle(darkMode)}
            >
              <Circle size={14} />
              Convert to Circle
            </button>
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'triangle');
                setContextMenu(null);
              }}
              style={menuButtonStyle(darkMode)}
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
            minWidth: '250px',
            maxWidth: '350px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              Add to Cell
            </h4>

            <label style={menuButtonStyle(darkMode)}>
              <Image size={14} />
              Add Image / OCR Scan
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  handleImageUpload(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, e);
                  setCellMediaMenu(null);
                }}
                style={{ display: 'none' }}
              />
            </label>

            <label style={menuButtonStyle(darkMode)}>
              <Smartphone size={14} />
              Add GIF
              <input
                type="file"
                accept="image/gif"
                onChange={(e) => {
                  handleGifUpload(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, e);
                  setCellMediaMenu(null);
                }}
                style={{ display: 'none' }}
              />
            </label>

            <label style={menuButtonStyle(darkMode)}>
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
              style={menuButtonStyle(darkMode)}
            >
              <Table size={14} />
              Add Nested Table
            </button>

            <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0', margin: '4px 0' }} />

            {!isRecording ? (
              <button
                onClick={() => startRecording(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col)}
                style={menuButtonStyle(darkMode, false, '#ef4444')}
              >
                <Mic size={14} />
                Start Voice Recording
              </button>
            ) : (
              <div>
                <button
                  onClick={() => stopRecording(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col)}
                  style={menuButtonStyle(darkMode, false, '#22c55e')}
                >
                  <MicOff size={14} />
                  Stop Recording
                </button>
                {currentTranscript && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '4px',
                    fontSize: '11px',
                    maxHeight: '80px',
                    overflow: 'auto',
                    color: darkMode ? '#94a3b8' : '#64748b'
                  }}>
                    <strong>Live transcript:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>{currentTranscript}</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0', margin: '4px 0' }} />

            <label style={menuButtonStyle(darkMode, false, '#8b5cf6')}>
              <FileText size={14} />
              Import PDF & OCR
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  handlePDFImport(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, e);
                  setCellMediaMenu(null);
                }}
                style={{ display: 'none' }}
              />
            </label>

            <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0', margin: '4px 0' }} />

            <button
              onClick={() => {
                handleCellEdit(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, {
                  text: '',
                  image: null,
                  gif: null,
                  video: null,
                  audio: null,
                  transcript: null,
                  nestedTable: null
                });
                setCellMediaMenu(null);
              }}
              style={menuButtonStyle(darkMode, false, '#ef4444')}
            >
              <Trash2 size={14} />
              Clear Cell
            </button>

            <button
              onClick={() => {
                setCellMediaMenu(null);
                setIsRecording(false);
                setCurrentTranscript('');
              }}
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

const menuButtonStyle = (darkMode, disabled = false, color = null) => ({
  padding: '8px 12px',
  backgroundColor: color || 'transparent',
  border: 'none',
  color: color ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b'),
  cursor: disabled ? 'not-allowed' : 'pointer',
  textAlign: 'left',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  opacity: disabled ? 0.5 : 1,
});

export default EnhancedContextMenus;
