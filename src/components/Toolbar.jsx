import React from 'react';

const Toolbar = ({ onAddObject, showObjectPanel, onUnion, canUnion, onRotate, canRotate }) => {
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
      <button
        className="tool-button"
        onClick={onRotate}
        disabled={!canRotate}
      >
        ↻ Rotacionar
      </button>
    </div>
  );
};

export default Toolbar;