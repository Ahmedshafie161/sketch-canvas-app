import React from 'react';

const ContextMenu = ({ contextMenu, darkMode, convertDrawingToText, convertDrawingToShape, setContextMenu }) => {
	if (!contextMenu) return null;
	return (
		<div
			style={{
				position: 'fixed',
				top: contextMenu.y,
				left: contextMenu.x,
				backgroundColor: darkMode ? '#1e293b' : 'white',
				border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
				borderRadius: '8px',
				padding: '8px',
				zIndex: 1000,
				boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
			}}
			onClick={() => setContextMenu(null)}
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
				<button onClick={convertDrawingToText}>Convert to Text</button>
				<button onClick={() => convertDrawingToShape('rectangle')}>Convert to Rectangle</button>
				<button onClick={() => convertDrawingToShape('circle')}>Convert to Circle</button>
				<button onClick={() => convertDrawingToShape('triangle')}>Convert to Triangle</button>
			</div>
		</div>
	);
};

export default ContextMenu;
// ...existing code from ../ContextMenu.jsx...
