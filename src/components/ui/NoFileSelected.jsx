import React from 'react';

const NoFileSelected = ({ darkMode }) => (
	<div
		style={{
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: darkMode ? '#64748b' : '#64748b',
			fontSize: '1.2rem',
			opacity: 0.7,
		}}
	>
		No file selected. Please select a file from the sidebar.
	</div>
);

export default NoFileSelected;
