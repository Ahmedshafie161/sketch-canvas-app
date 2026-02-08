// Canvas background styles and utilities

export const getBackgroundStyle = (darkMode, backgroundPattern) => {
  const baseStyle = {
    backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
    transition: 'background-color 0.3s ease',
  };

  if (backgroundPattern === 'grid') {
    return {
      ...baseStyle,
      backgroundImage: darkMode
        ? 'radial-gradient(circle, #334155 1px, transparent 1px)'
        : 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    };
  } else if (backgroundPattern === 'lines') {
    return {
      ...baseStyle,
      backgroundImage: darkMode
        ? 'linear-gradient(#334155 1px, transparent 1px)'
        : 'linear-gradient(#cbd5e1 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    };
  }

  return baseStyle;
};

export const getCommonObjectStyle = (obj, isSelected, darkMode, canvasScale) => {
  return {
    position: 'absolute',
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    border: isSelected ? '2px solid #3b82f6' : '2px solid ' + (darkMode ? '#475569' : '#94a3b8'),
    cursor: 'move',
    transition: 'border-color 0.2s',
    transform: `scale(${1 / canvasScale})`,
    transformOrigin: '0 0',
  };
};

export const renderResizeHandles = (isSelected) => {
  if (!isSelected) return null;

  const handleStyle = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: '#3b82f6',
    border: '2px solid white',
    borderRadius: '50%',
    cursor: 'nwse-resize',
  };

  return (
    <>
      <div style={{ ...handleStyle, left: '-5px', top: '-5px', cursor: 'nw-resize' }} />
      <div style={{ ...handleStyle, right: '-5px', top: '-5px', cursor: 'ne-resize' }} />
      <div style={{ ...handleStyle, left: '-5px', bottom: '-5px', cursor: 'sw-resize' }} />
      <div style={{ ...handleStyle, right: '-5px', bottom: '-5px', cursor: 'se-resize' }} />
    </>
  );
};
