import React from 'react';

const CellMediaMenu = ({ cellMediaMenu, darkMode, handleImageUpload, handleVideoUpload, handleNestedTableAdd, handleCellEdit, setCellMediaMenu }) => {
	if (!cellMediaMenu) return null;
	return (
		<div
			style={{
				position: 'fixed',
				top: cellMediaMenu.y,
				left: cellMediaMenu.x,
				backgroundColor: darkMode ? '#1e293b' : 'white',
				border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
				borderRadius: '8px',
				padding: '8px',
				zIndex: 1000,
				boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
			}}
			onClick={() => setCellMediaMenu(null)}
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
				<button onClick={handleImageUpload}>Add Image</button>
				<button onClick={handleVideoUpload}>Add Video</button>
				<button onClick={handleNestedTableAdd}>Add Nested Table</button>
				<button onClick={handleCellEdit}>Edit Cell</button>
			</div>
		</div>
	);
};

export default CellMediaMenu;
