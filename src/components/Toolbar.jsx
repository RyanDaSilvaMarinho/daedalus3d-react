// Toolbar.jsx
import React from 'react';

const Toolbar = ({ onAddObject, showObjectPanel }) => {
  return (
    <div className="sidebar">
      <button className="tool-button">▶</button>
      <button className="tool-button">🔊</button>
      <button className="tool-button">🔍</button>
      <button 
        className="tool-button" 
        onClick={() => onAddObject(!showObjectPanel)}
      >
        ➕
      </button>
    </div>
  );
};

export default Toolbar;
