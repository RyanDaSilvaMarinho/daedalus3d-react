import React, { useState } from 'react';

const ObjectPanel = ({ show, onSelectType }) => {
  const [model, setModel] = useState(null);
  const [color, setColor] = useState('#00ff88'); // Cor padrão

  const handleFileChange = (event) => { /* ... */ };

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleAddWithColor = (type) => {
    onSelectType(type, color); // Passa o tipo e a cor
  };

  if (!show) return null;

  return (
    <div id="object-panel" className="object-panel">
      <h3>Adicionar Objeto 3D</h3>
      
      {/* Seletor de Cor */}
      <div className="color-picker">
        <label>Cor do Objeto:</label>
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
        />
      </div>

      {/* Botões de Formato */}
      <div>
        <button onClick={() => handleAddWithColor('cube')} className="shape-btn">
          Cubo
        </button>
        <button onClick={() => handleAddWithColor('sphere')} className="shape-btn">
          Esfera
        </button>
        <button onClick={() => handleAddWithColor('cylinder')} className="shape-btn">
          Cilindro
        </button>
      </div>

      {/* Upload de Modelo */}
      <div>
        <label>Carregar Modelo 3D:</label>
        <input
          type="file"
          accept=".gltf,.glb"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>
      {model && <p>Modelo carregado!</p>}
    </div>
  );
};

export default ObjectPanel;