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
}) => (
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
      />
    ))}
  </>
);

export default CanvasObjectsList;
