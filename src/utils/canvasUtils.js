// Returns canvas coordinates from mouse/touch event, accounting for scale and offset
export function getCanvasCoords(e, canvasRef, canvasScale, canvasOffset) {
  const rect = canvasRef.current.getBoundingClientRect();
  let x, y;
  if (e.touches) {
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  } else {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  // Apply scale and offset
  x = (x / canvasScale) - canvasOffset.x;
  y = (y / canvasScale) - canvasOffset.y;
  return { x, y };
}
// Utility functions extracted from App.jsx
export function isPointInObject(point, obj) {
  return point.x >= obj.x &&
    point.x <= obj.x + obj.width &&
    point.y >= obj.y &&
    point.y <= obj.y + obj.height;
}

export function getResizeHandle(point, obj) {
  const handleSize = 10;
  const handles = {
    'nw': { x: obj.x, y: obj.y },
    'ne': { x: obj.x + obj.width, y: obj.y },
    'sw': { x: obj.x, y: obj.y + obj.height },
    'se': { x: obj.x + obj.width, y: obj.y + obj.height },
  };
  for (const [name, pos] of Object.entries(handles)) {
    if (Math.abs(point.x - pos.x) < handleSize && Math.abs(point.y - pos.y) < handleSize) {
      return name;
    }
  }
  return null;
}

export function getConnectionPoints(obj) {
  return {
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2,
  };
}
