import React from 'react';

const CanvasConnections = ({ connections, canvasObjects, getConnectionPoints }) => (
  <svg style={{
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  }}>
    {connections.map(conn => {
      const fromObj = canvasObjects.find(o => o.id === conn.from);
      const toObj = canvasObjects.find(o => o.id === conn.to);
      if (!fromObj || !toObj) return null;
      const from = getConnectionPoints(fromObj);
      const to = getConnectionPoints(toObj);
      return (
        <g key={conn.id}>
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#3b82f6"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        </g>
      );
    })}
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
      </marker>
    </defs>
  </svg>
);

export default CanvasConnections;
