import React from 'react';
import './Toolbar.css';

const Toolbar = ({
	selectedTool,
	setSelectedTool,
	darkMode,
	setDarkMode,
	backgroundPattern,
	setBackgroundPattern,
	selectedObject,
	convertDrawingToText,
	convertDrawingToShape,
	saveCurrentFile,
	currentFile,
	exportCanvas,
	importOneNote,
	importCanvas,
	deleteSelected,
	connectingFrom
}) => {
	return (
		<div className={`toolbar${darkMode ? ' dark' : ''}`}> 
			{/* Example toolbar buttons, add your actual logic here */}
			<button onClick={() => setSelectedTool('select')} className={selectedTool === 'select' ? 'active' : ''}>Select</button>
			<button onClick={() => setSelectedTool('draw')} className={selectedTool === 'draw' ? 'active' : ''}>Draw</button>
			<button onClick={() => setDarkMode(!darkMode)}>{darkMode ? 'Light' : 'Dark'} Mode</button>
			{/* Add more buttons and logic as needed */}
		</div>
	);
};

export default Toolbar;
