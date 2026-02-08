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
