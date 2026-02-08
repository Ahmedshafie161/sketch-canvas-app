import React from 'react';
import { Edit3 } from 'lucide-react';

const NoFileSelected = ({ darkMode }) => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#64748b',
  }}>
    <Edit3 size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: darkMode ? '#94a3b8' : '#475569' }}>
      No File Selected
    </h3>
    <p style={{ fontSize: '1rem' }}>
      Create or open a file to start sketching
    </p>
  </div>
);

export default NoFileSelected;
