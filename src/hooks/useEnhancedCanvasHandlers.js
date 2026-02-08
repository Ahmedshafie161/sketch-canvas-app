import { voiceRecorder } from '../utils/voiceRecorder';
import { ocrProcessor } from '../utils/ocr';
import { db } from '../utils/database';

export const useEnhancedCanvasHandlers = (
  canvasObjects,
  setCanvasObjects,
  setSelectedObject,
  currentFile,
  animations,
  setAnimations
) => {
  
  const handleObjectDoubleClick = (obj, e) => {
    e.stopPropagation();
    if (['text', 'rectangle', 'circle', 'triangle'].includes(obj.type)) {
      const newText = prompt('Enter text:', obj.text || '');
      if (newText !== null) {
        setCanvasObjects(canvasObjects.map(o =>
          o.id === obj.id ? { ...o, text: newText } : o
        ));
      }
    }
  };

  const handleCellEdit = (objId, row, col, content) => {
    setCanvasObjects(canvasObjects.map(obj => {
      if (obj.id === objId && obj.type === 'table') {
        const newCells = obj.cells.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === row && ci === col) {
              return { ...c, ...content };
            }
            return c;
          })
        );
        return { ...obj, cells: newCells };
      }
      return obj;
    }));
  };

  const handleImageUpload = async (objId, row, col, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        let imageData = event.target.result;
        let extractedText = '';

        // Try OCR on the image
        try {
          extractedText = await ocrProcessor.extractTextFromImage(imageData);
        } catch (error) {
          console.error('OCR failed:', error);
        }

        handleCellEdit(objId, row, col, {
          image: imageData,
          text: extractedText || '',
          video: null,
          gif: null,
          audio: null,
          nestedTable: null
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGifUpload = (objId, row, col, e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCellEdit(objId, row, col, {
          gif: event.target.result,
          text: '',
          image: null,
          video: null,
          audio: null,
          nestedTable: null
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (objId, row, col, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCellEdit(objId, row, col, {
          video: event.target.result,
          text: '',
          image: null,
          gif: null,
          audio: null,
          nestedTable: null
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNestedTableAdd = (objId, row, col) => {
    const rows = parseInt(prompt('Number of rows:', '2'));
    const cols = parseInt(prompt('Number of columns:', '2'));

    if (rows && cols) {
      const nestedTable = {
        rows,
        cols,
        cells: Array(rows).fill().map(() => 
          Array(cols).fill().map(() => ({ 
            text: '', 
            style: {} 
          }))
        )
      };

      handleCellEdit(objId, row, col, {
        nestedTable,
        text: '',
        image: null,
        gif: null,
        video: null,
        audio: null
      });
    }
  };

  const handleVoiceRecording = async (objId, row, col, onUpdate) => {
    try {
      const result = await voiceRecorder.startRecording((transcript, isInterim) => {
        if (onUpdate) {
          onUpdate(transcript, isInterim);
        }
      });

      if (result.success) {
        return { success: true, message: 'Recording started' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleStopVoiceRecording = async (objId, row, col) => {
    try {
      const result = await voiceRecorder.stopRecording();

      if (result.success && currentFile) {
        // Save to database
        await db.voiceRecordings.add({
          fileId: currentFile.id,
          objectId: objId,
          audioData: result.audioData,
          transcript: result.transcript,
          createdAt: new Date().toISOString()
        });

        // Update cell with audio and transcript
        handleCellEdit(objId, row, col, {
          audio: result.audioUrl,
          transcript: result.transcript,
          text: result.transcript,
          image: null,
          gif: null,
          video: null,
          nestedTable: null
        });

        return { success: true, transcript: result.transcript };
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleMergeCells = (objId, selectedCells) => {
    if (selectedCells.length < 2) return;

    setCanvasObjects(canvasObjects.map(obj => {
      if (obj.id === objId && obj.type === 'table') {
        const minRow = Math.min(...selectedCells.map(c => c.row));
        const maxRow = Math.max(...selectedCells.map(c => c.row));
        const minCol = Math.min(...selectedCells.map(c => c.col));
        const maxCol = Math.max(...selectedCells.map(c => c.col));

        const rowSpan = maxRow - minRow + 1;
        const colSpan = maxCol - minCol + 1;

        // Collect all text from merged cells
        let mergedText = '';
        selectedCells.forEach(({ row, col }) => {
          const cell = obj.cells[row][col];
          if (cell.text) {
            mergedText += cell.text + ' ';
          }
        });

        const newCells = obj.cells.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === minRow && ci === minCol) {
              return {
                ...c,
                text: mergedText.trim(),
                rowSpan,
                colSpan
              };
            } else if (ri >= minRow && ri <= maxRow && ci >= minCol && ci <= maxCol) {
              return { ...c, merged: true };
            }
            return c;
          })
        );

        return { ...obj, cells: newCells };
      }
      return obj;
    }));
  };

  const handleSplitCell = (objId, cell) => {
    if (!cell) return;

    setCanvasObjects(canvasObjects.map(obj => {
      if (obj.id === objId && obj.type === 'table') {
        const newCells = obj.cells.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === cell.row && ci === cell.col) {
              return {
                ...c,
                rowSpan: 1,
                colSpan: 1
              };
            } else if (c.merged && ri >= cell.row && ri < cell.row + (c.rowSpan || 1) &&
                       ci >= cell.col && ci < cell.col + (c.colSpan || 1)) {
              return {
                ...c,
                merged: false,
                text: ''
              };
            }
            return c;
          })
        );

        return { ...obj, cells: newCells };
      }
      return obj;
    }));
  };

  const handleAddRow = (objId) => {
    setCanvasObjects(canvasObjects.map(obj => {
      if (obj.id === objId && obj.type === 'table') {
        const newRow = Array(obj.cols).fill().map(() => ({ 
          text: '', 
          style: {},
          image: null,
          gif: null,
          video: null,
          audio: null,
          nestedTable: null
        }));
        return {
          ...obj,
          rows: obj.rows + 1,
          cells: [...obj.cells, newRow]
        };
      }
      return obj;
    }));
  };

  const handleAddColumn = (objId) => {
    setCanvasObjects(canvasObjects.map(obj => {
      if (obj.id === objId && obj.type === 'table') {
        const newCells = obj.cells.map(row => [
          ...row,
          { 
            text: '', 
            style: {},
            image: null,
            gif: null,
            video: null,
            audio: null,
            nestedTable: null
          }
        ]);
        return {
          ...obj,
          cols: obj.cols + 1,
          cells: newCells
        };
      }
      return obj;
    }));
  };

  const handleDeleteRow = (objId, rowIndex) => {
    if (rowIndex === undefined) return;

    setCanvasObjects(canvasObjects.map(obj => {
      if (obj.id === objId && obj.type === 'table' && obj.rows > 1) {
        const newCells = obj.cells.filter((_, i) => i !== rowIndex);
        return {
          ...obj,
          rows: obj.rows - 1,
          cells: newCells
        };
      }
      return obj;
    }));
  };

  const handleDeleteColumn = (objId, colIndex) => {
    if (colIndex === undefined) return;

    setCanvasObjects(canvasObjects.map(obj => {
      if (obj.id === objId && obj.type === 'table' && obj.cols > 1) {
        const newCells = obj.cells.map(row => row.filter((_, i) => i !== colIndex));
        return {
          ...obj,
          cols: obj.cols - 1,
          cells: newCells
        };
      }
      return obj;
    }));
  };

  const convertDrawingToText = async (drawingId) => {
    const drawing = canvasObjects.find(obj => obj.id === drawingId);
    if (!drawing || drawing.type !== 'drawing') return;

    // Create a canvas to render the drawing
    const canvas = document.createElement('canvas');
    canvas.width = drawing.width;
    canvas.height = drawing.height;
    const ctx = canvas.getContext('2d');

    // Draw the path
    ctx.strokeStyle = drawing.strokeColor || '#000000';
    ctx.lineWidth = drawing.strokeWidth || 2;
    ctx.beginPath();
    
    drawing.path.forEach((point, i) => {
      const x = point.x - drawing.x;
      const y = point.y - drawing.y;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Convert to image for OCR
    const imageData = canvas.toDataURL('image/png');
    
    try {
      const text = await ocrProcessor.extractTextFromImage(imageData);
      
      setCanvasObjects(canvasObjects.map(obj =>
        obj.id === drawingId
          ? {
              ...obj,
              type: 'text',
              text: text || 'Recognized text',
              path: undefined,
              width: Math.max(100, obj.width),
              height: Math.max(40, obj.height)
            }
          : obj
      ));
      setSelectedObject(null);
    } catch (error) {
      console.error('OCR conversion failed:', error);
      const manualText = prompt('Enter text for this drawing:', 'Recognized text');
      if (manualText) {
        setCanvasObjects(canvasObjects.map(obj =>
          obj.id === drawingId
            ? {
                ...obj,
                type: 'text',
                text: manualText,
                path: undefined,
                width: Math.max(100, obj.width),
                height: Math.max(40, obj.height)
              }
            : obj
        ));
        setSelectedObject(null);
      }
    }
  };

  const convertDrawingToShape = (drawingId, shapeType) => {
    const drawing = canvasObjects.find(obj => obj.id === drawingId);
    if (!drawing || drawing.type !== 'drawing') return;

    setCanvasObjects(canvasObjects.map(obj =>
      obj.id === drawingId
        ? {
            ...obj,
            type: shapeType,
            path: undefined,
            width: Math.max(50, obj.width),
            height: Math.max(50, obj.height)
          }
        : obj
    ));
    setSelectedObject(null);
  };

  const handleCellMediaMenu = (e, objId, row, col) => {
    e.preventDefault();
    e.stopPropagation();
    return {
      x: e.clientX,
      y: e.clientY,
      objId,
      row,
      col
    };
  };

  // Animation functions
  const addAnimation = (objectId, animationType, duration, delay = 0) => {
    const newAnimation = {
      id: Date.now(),
      objectId,
      type: animationType, // 'fade', 'slide', 'rotate', 'scale', 'bounce'
      duration: duration || 1000, // milliseconds
      delay,
      iterations: 1,
      direction: 'normal'
    };

    setAnimations([...animations, newAnimation]);

    if (currentFile) {
      db.animations.add({
        ...newAnimation,
        fileId: currentFile.id
      });
    }
  };

  const removeAnimation = (animationId) => {
    setAnimations(animations.filter(a => a.id !== animationId));
    db.animations.delete(animationId);
  };

  const playAnimations = () => {
    animations.forEach(animation => {
      const obj = canvasObjects.find(o => o.id === animation.objectId);
      if (!obj) return;

      const element = document.querySelector(`[data-object-id="${obj.id}"]`);
      if (!element) return;

      setTimeout(() => {
        element.style.transition = `all ${animation.duration}ms ease-in-out`;

        switch (animation.type) {
          case 'fade':
            element.style.opacity = '0';
            setTimeout(() => {
              element.style.opacity = '1';
            }, animation.duration);
            break;

          case 'slide':
            element.style.transform = 'translateX(100px)';
            setTimeout(() => {
              element.style.transform = 'translateX(0)';
            }, 50);
            break;

          case 'rotate':
            element.style.transform = 'rotate(360deg)';
            setTimeout(() => {
              element.style.transform = 'rotate(0deg)';
            }, animation.duration);
            break;

          case 'scale':
            element.style.transform = 'scale(1.5)';
            setTimeout(() => {
              element.style.transform = 'scale(1)';
            }, animation.duration);
            break;

          case 'bounce':
            element.style.transform = 'translateY(-50px)';
            setTimeout(() => {
              element.style.transform = 'translateY(0)';
            }, animation.duration / 2);
            break;
        }
      }, animation.delay);
    });
  };

  return {
    handleObjectDoubleClick,
    handleCellEdit,
    handleImageUpload,
    handleGifUpload,
    handleVideoUpload,
    handleNestedTableAdd,
    handleVoiceRecording,
    handleStopVoiceRecording,
    handleMergeCells,
    handleSplitCell,
    handleAddRow,
    handleAddColumn,
    handleDeleteRow,
    handleDeleteColumn,
    convertDrawingToText,
    convertDrawingToShape,
    handleCellMediaMenu,
    addAnimation,
    removeAnimation,
    playAnimations,
  };
};
