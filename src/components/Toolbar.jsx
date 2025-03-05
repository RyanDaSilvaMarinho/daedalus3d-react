import React from 'react';

const Toolbar = ({ onAddObject, showObjectPanel, onUnion, canUnion }) => {
  return (
    <div className="sidebar">
      <button 
        className="tool-button" 
        onClick={() => onAddObject(!showObjectPanel)}
      >
        ➕
      </button>
      <button
        className="tool-button"
        onClick={onUnion}
        disabled={!canUnion}
      >
        🡇 Unir
      </button>
    </div>
  );
};

export default Toolbar;