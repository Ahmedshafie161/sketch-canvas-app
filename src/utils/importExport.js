// src/utils/importExport.js
export const exportCanvas = (currentFile, canvasObjects, connections) => {
  const data = {
    objects: canvasObjects,
    connections: connections,
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentFile?.name || 'canvas'}.json`;
  a.click();
};

export const importCanvas = (e, setCanvasObjects, setConnections) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setCanvasObjects(data.objects || []);
        setConnections(data.connections || []);
      } catch (error) {
        alert('Failed to import file');
      }
    };
    reader.readAsText(file);
  }
};

export const importOneNote = async (e, setCanvasObjects) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    let content = '';
    const titleElement = doc.querySelector('title') || doc.querySelector('h1');
    if (titleElement) {
      content += `Title: ${titleElement.textContent}\n\n`;
    }
    
    const paragraphs = doc.querySelectorAll('p, div[class*="paragraph"]');
    if (paragraphs.length > 0) {
      paragraphs.forEach((p, i) => {
        if (p.textContent.trim()) {
          content += `${p.textContent}\n`;
        }
      });
    } else {
      const body = doc.body;
      if (body && body.textContent) {
        content = body.textContent.substring(0, 5000);
      }
    }
    
    if (!content.trim()) {
      content = text.substring(0, 2000);
      if (text.length > 2000) content += '...';
    }
    
    const importedText = {
      id: Date.now(),
      type: 'text',
      x: 100,
      y: 100,
      width: 600,
      height: 400,
      text: `OneNote Import\n\n${content}`,
      backgroundColor: '#f0f9ff',
      border: '2px solid #0ea5e9',
      fontSize: '14px',
      overflow: 'auto'
    };
    
    setCanvasObjects(prev => [...prev, importedText]);
    alert('OneNote imported successfully!');
    
  } catch (error) {
    console.error('OneNote import error:', error);
    alert('Failed to parse OneNote file.');
  }
};