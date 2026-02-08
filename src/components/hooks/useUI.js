import { useState } from 'react';

const useUI = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundPattern, setBackgroundPattern] = useState('grid');
  const [showTableEditor, setShowTableEditor] = useState(null);
  const [resizingObject, setResizingObject] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [cellMediaMenu, setCellMediaMenu] = useState(null);

  return {
    darkMode,
    setDarkMode,
    backgroundPattern,
    setBackgroundPattern,
    showTableEditor,
    setShowTableEditor,
    resizingObject,
    setResizingObject,
    resizeHandle,
    setResizeHandle,
    editingCell,
    setEditingCell,
    cellMediaMenu,
    setCellMediaMenu,
  };
};

export default useUI;
