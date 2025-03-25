import React, { useState } from 'react';

const ObjectPanel = ({ show, onSelectType }) => {
  const [color, setColor] = useState('#00ff88');

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleAddWithColor = (type) => {
    onSelectType(type, color);
  };

  if (!show) return null;

  return (
    <div id="object-panel" className="object-panel">
      <h3>Adicionar Objeto 3D</h3>

      <div className="color-picker">
        <label>Cor do Objeto:</label>
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
        />
      </div>

      <div>
        <button onClick={() => handleAddWithColor('cube')} className="shape-btn">
          <img src="Criar_Cubo.png" alt="Criar cubo"/>
        </button>
        <button onClick={() => handleAddWithColor('sphere')} className="shape-btn">
          <img src="Criar_Esfera.png" alt="Criar esfera"/>
        </button>
        <button onClick={() => handleAddWithColor('cylinder')} className="shape-btn">
          <img src="Criar_Cilindro.png" alt="Criar Cilindro"/>
        </button>
      </div>
    </div>
  );
};

export default ObjectPanel;