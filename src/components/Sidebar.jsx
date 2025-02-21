import React from 'react';

const Sidebar = ({ onAddObject, showObjectPanel }) => {
  return (
    <div className="sidebar">
      <div className="text-section">
        <h3>Texto para 3D</h3>
        <textarea placeholder="Digite seu texto aqui..." id="text-input" />
        <div className="param-controls">
          <label>Guidance Scale</label>
          <input type="number" id="guidance-scale" defaultValue="15" />
        </div>
        <div className="param-controls">
          <label>Passos</label>
          <input type="number" id="num-steps" defaultValue="64" />
        </div>
        <button id="generate-text-3d">Gerar</button>
      </div>

      <div className="image-section">
        <h3>Imagem para 3D</h3>
        <input type="file" id="image-input" />
        <button id="generate-image-3d">Converter</button>
      </div>
    </div>
  );
};

export default Sidebar;
