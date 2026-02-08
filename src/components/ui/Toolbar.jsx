
import React from 'react';
import './Toolbar.css';
import { Square, Circle, LineChart, ArrowRight, Type, Pencil, MousePointer, Eraser, Table2 } from 'lucide-react';


const TOOL_LIST = [
	{ key: 'select', label: 'Select', icon: <MousePointer size={18} /> },
	{ key: 'draw', label: 'Draw', icon: <Pencil size={18} /> },
	{ key: 'rectangle', label: 'Rectangle', icon: <Square size={18} /> },
	{ key: 'ellipse', label: 'Ellipse', icon: <Circle size={18} /> },
	{ key: 'line', label: 'Line', icon: <LineChart size={18} /> },
	{ key: 'arrow', label: 'Arrow', icon: <ArrowRight size={18} /> },
	{ key: 'text', label: 'Text', icon: <Type size={18} /> },
	{ key: 'table', label: 'Table', icon: <Table2 size={18} /> },
	{ key: 'eraser', label: 'Eraser', icon: <Eraser size={18} /> },
];

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
			{TOOL_LIST.map(tool => (
				<button
					key={tool.key}
					onClick={() => setSelectedTool(tool.key)}
					className={selectedTool === tool.key ? 'active' : ''}
					title={tool.label}
				>
					{tool.icon}
				</button>
			))}
			<span style={{ flex: 1 }} />
			<button onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
				{darkMode ? 'Light' : 'Dark'} Mode
			</button>
			{/* Add more buttons and logic as needed */}
		</div>
	);
};

export default Toolbar;
