// CanvasImportExport.js
// Handles import/export and OneNote import for SketchCanvas

export function exportCanvas(canvasObjects, connections, animations, currentFile) {
  const data = {
    objects: canvasObjects,
    connections: connections,
    animations: animations,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentFile?.name || 'canvas'}.json`;
  a.click();
}

export function importCanvas(e, setCanvasObjects, setConnections, setAnimations) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setCanvasObjects(data.objects || []);
        setConnections(data.connections || []);
        setAnimations(data.animations || []);
      } catch (error) {
        alert('Failed to import file');
      }
    };
    reader.readAsText(file);
  }
}

// ...You can add importOneNote here as well if needed...
