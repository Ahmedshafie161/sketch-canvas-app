import { useEffect } from 'react';

export default function useAppEffects({
  canvasRef,
  canvasScale,
  setCanvasOffset,
  setCanvasScale,
  setIsPanning,
  setPanStart,
  setIsDrawing,
  setDrawingPath,
  setSelectedObject,
  setConnectingFrom,
  setShowTableEditor,
  setContextMenu,
  setCellMediaMenu,
  isAuthenticated,
  setCurrentUser,
  setIsAuthenticated,
  loadUserData,
  darkMode,
  setDarkMode,
  folders,
  files,
  saveUserData,
  currentFile,
  canvasObjects,
  connections,
  animations,
  ...rest
}) {
  // Canvas wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (!canvasRef.current) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
        const newScale = Math.min(Math.max(0.1, canvasScale + delta), 5);
        const scaleRatio = newScale / canvasScale;
        setCanvasOffset(prev => ({
          x: prev.x - (mouseX / newScale) * (1 - scaleRatio),
          y: prev.y - (mouseY / newScale) * (1 - scaleRatio)
        }));
        setCanvasScale(newScale);
      }
    };
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [canvasRef, canvasScale, setCanvasOffset, setCanvasScale]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') document.body.style.cursor = 'grab';
      if (e.code.startsWith('Arrow')) {
        e.preventDefault();
        const step = 50 / canvasScale;
        switch(e.code) {
          case 'ArrowUp': setCanvasOffset(prev => ({ ...prev, y: prev.y - step })); break;
          case 'ArrowDown': setCanvasOffset(prev => ({ ...prev, y: prev.y + step })); break;
          case 'ArrowLeft': setCanvasOffset(prev => ({ ...prev, x: prev.x - step })); break;
          case 'ArrowRight': setCanvasOffset(prev => ({ ...prev, x: prev.x + step })); break;
        }
      }
    };
    const handleKeyUp = (e) => { if (e.code === 'Space') document.body.style.cursor = ''; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [canvasScale, setCanvasOffset]);

  // Auth and dark mode persistence
  useEffect(() => {
    const savedAuth = localStorage.getItem('canvasAuth');
    if (savedAuth) {
      const { user } = JSON.parse(savedAuth);
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadUserData(user);
    }
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  useEffect(() => { if (isAuthenticated) saveUserData(); }, [folders, files]);
  useEffect(() => { localStorage.setItem('darkMode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => {
    if (currentFile && isAuthenticated) {
      // ...existing code to update files with canvasObjects, connections, animations
    }
  }, [canvasObjects, connections, animations]);
}
