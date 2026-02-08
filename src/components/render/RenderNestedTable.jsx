import React from 'react';
export default function RenderNestedTable({ nestedTable, cellStyle }) {
  return (
    <table style={{
      width: '100%',
      height: '100%',
      borderCollapse: 'collapse',
      fontSize: '10px',
    }}>
      <tbody>
        {nestedTable.cells.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td
                key={ci}
                style={{
                  border: '1px solid #cbd5e1',
                  padding: '2px',
                  fontSize: '10px',
                  ...cellStyle,
                }}
              >
                {cell.text}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
