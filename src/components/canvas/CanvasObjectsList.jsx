import React from 'react';
import CanvasObject from '../canvas/CanvasObject';


const CanvasObjectsList = ({
  canvasObjects,
  selectedObject,
  selectedTool,
  darkMode,
  setSelectedObject,
  handleConnect,
  handleObjectDoubleClick
}) => {
  // Provide resize handles for selected objects
  const renderResizeHandles = (isSelected) => {
    if (!isSelected) return null;
    const handleStyle = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: '#3b82f6',
      border: '2px solid white',
      borderRadius: '50%',
      cursor: 'nwse-resize',
      zIndex: 2,
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
  return (
    <>
      {canvasObjects.map(obj => (
        <CanvasObject
          key={obj.id}
          obj={obj}
          isSelected={selectedObject?.id === obj.id}
          selectedTool={selectedTool}
          darkMode={darkMode}
          setSelectedObject={setSelectedObject}
          handleConnect={handleConnect}
          handleObjectDoubleClick={handleObjectDoubleClick}
          renderResizeHandles={() => renderResizeHandles(selectedObject?.id === obj.id)}
        />
      ))}
    </>
  );
};

export default CanvasObjectsList;
