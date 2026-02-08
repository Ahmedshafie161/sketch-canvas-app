// src/utils/canvasHelpers.js

// Helper function to check if a point is inside an object
export const isPointInObject = (point, obj) => {
  return point.x >= obj.x &&
         point.x <= obj.x + obj.width &&
         point.y >= obj.y &&
         point.y <= obj.y + obj.height;
};

// Get resize handle at a point
export const getResizeHandle = (point, obj) => {
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
};

// Get connection points for an object
export const getConnectionPoints = (obj) => {
  return {
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2,
  };
};

// Calculate object bounds
export const calculateObjectBounds = (obj) => {
  switch (obj.type) {
    case 'drawing':
      if (obj.path && obj.path.length > 0) {
        return {
          x: Math.min(...obj.path.map(p => p.x)),
          y: Math.min(...obj.path.map(p => p.y)),
          width: Math.max(...obj.path.map(p => p.x)) - Math.min(...obj.path.map(p => p.x)),
          height: Math.max(...obj.path.map(p => p.y)) - Math.min(...obj.path.map(p => p.y)),
        };
      }
      break;
    default:
      return {
        x: obj.x || 0,
        y: obj.y || 0,
        width: obj.width || 100,
        height: obj.height || 100,
      };
  }
  return { x: 0, y: 0, width: 100, height: 100 };
};

// Generate a unique ID for objects
export const generateId = () => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Calculate distance between two points
export const calculateDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Check if two objects overlap
export const doObjectsOverlap = (obj1, obj2) => {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
};

// Calculate center of object
export const getObjectCenter = (obj) => {
  return {
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2,
  };
};

// Convert coordinates with scale and offset
export const convertCoordinates = (x, y, canvasScale, canvasOffset) => {
  return {
    x: (x / canvasScale) - canvasOffset.x,
    y: (y / canvasScale) - canvasOffset.y,
  };
};

// Format object for export
export const formatObjectForExport = (obj) => {
  const baseObj = {
    id: obj.id,
    type: obj.type,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
  };

  // Add type-specific properties
  switch (obj.type) {
    case 'text':
      return { ...baseObj, text: obj.text, fontSize: obj.fontSize, backgroundColor: obj.backgroundColor };
    case 'rectangle':
      return { ...baseObj, backgroundColor: obj.backgroundColor, imageUrl: obj.imageUrl, text: obj.text };
    case 'circle':
      return { ...baseObj, text: obj.text };
    case 'triangle':
      return { ...baseObj, text: obj.text };
    case 'drawing':
      return { ...baseObj, path: obj.path, strokeColor: obj.strokeColor, strokeWidth: obj.strokeWidth };
    case 'table':
      return { ...baseObj, rows: obj.rows, cols: obj.cols, cells: obj.cells };
    default:
      return baseObj;
  }
};

// Parse imported object
export const parseImportedObject = (obj) => {
  const baseObj = {
    id: obj.id || generateId(),
    type: obj.type,
    x: obj.x || 0,
    y: obj.y || 0,
    width: obj.width || 100,
    height: obj.height || 100,
  };

  // Add type-specific properties
  switch (obj.type) {
    case 'text':
      return { ...baseObj, text: obj.text || '', fontSize: obj.fontSize || '16px', backgroundColor: obj.backgroundColor };
    case 'rectangle':
      return { ...baseObj, backgroundColor: obj.backgroundColor || '#e2e8f0', imageUrl: obj.imageUrl, text: obj.text || '' };
    case 'circle':
      return { ...baseObj, text: obj.text || '' };
    case 'triangle':
      return { ...baseObj, text: obj.text || '' };
    case 'drawing':
      return { ...baseObj, path: obj.path || [], strokeColor: obj.strokeColor || '#000000', strokeWidth: obj.strokeWidth || 2 };
    case 'table':
      return { 
        ...baseObj, 
        rows: obj.rows || 3, 
        cols: obj.cols || 3, 
        cells: obj.cells || Array(obj.rows || 3).fill().map(() => 
          Array(obj.cols || 3).fill({ text: '', image: null, video: null, nestedTable: null })
        ) 
      };
    default:
      return baseObj;
  }
};

// Create a new object based on type
export const createNewObject = (type, x, y, width, height, darkMode = false) => {
  const baseObject = {
    id: generateId(),
    type,
    x,
    y,
    width: Math.max(width, 50),
    height: Math.max(height, 50),
  };

  switch (type) {
    case 'rectangle':
      return {
        ...baseObject,
        backgroundColor: darkMode ? '#334155' : '#e2e8f0',
        text: '',
      };
    case 'circle':
      return {
        ...baseObject,
        text: '',
      };
    case 'triangle':
      return {
        ...baseObject,
        text: '',
      };
    case 'text':
      return {
        ...baseObject,
        text: 'Double-click to edit',
        fontSize: '16px',
        backgroundColor: 'transparent',
      };
    case 'drawing':
      return {
        ...baseObject,
        path: [],
        strokeColor: darkMode ? '#f1f5f9' : '#000000',
        strokeWidth: 2,
      };
    case 'table':
      return {
        ...baseObject,
        rows: 3,
        cols: 3,
        cells: Array(3).fill().map(() => 
          Array(3).fill({ text: '', image: null, video: null, nestedTable: null })
        ),
      };
    default:
      return baseObject;
  }
};