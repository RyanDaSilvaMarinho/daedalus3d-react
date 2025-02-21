// ObjectPanel.jsx
import React, { useState } from 'react';

const ObjectPanel = ({ show, onSelectType }) => {
  const [model, setModel] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        setModel(content); // Armazena o conteúdo do modelo
      };
      reader.readAsArrayBuffer(file);
    }
  };

  if (!show) return null;

  return (
    <div id="object-panel" className="object-panel">
      <h3>Adicionar Objeto 3D</h3>
      <div>
        <button
          onClick={() => onSelectType('cube')}
          className="shape-btn"
        >
          Cubo
        </button>
        <button
          onClick={() => onSelectType('sphere')}
          className="shape-btn"
        >
          Esfera
        </button>
        <button
          onClick={() => onSelectType('cylinder')}
          className="shape-btn"
        >
          Cilindro
        </button>
      </div>
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
