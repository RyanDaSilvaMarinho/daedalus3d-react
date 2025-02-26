import React, { useState } from 'react';
import Header from './Header';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import ObjectPanel from './ObjectPanel';
import Timeline from './Timeline';
import '../App.css';

const App = () => {
  const [showObjectPanel, setShowObjectPanel] = useState(false);
  const [objects, setObjects] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [objModelFile, setObjModelFile] = useState(null);

  const handleAddObject = (type, color = '#00ff88') => {
    const newObject = {
      type,
      color,
      id: Date.now(),
      position: [
        Math.random() * 20 - 10,
        0,
        Math.random() * 20 - 10
      ]
    };
    setObjects(prev => [...prev, newObject]);
  };

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    file && setModelFile(file);
  };

  return (
    <div className="app-container">
      <Header onOBJUpload={setObjModelFile} />
      <Timeline />
      <div className="main-content">
        <Toolbar 
          onAddObject={setShowObjectPanel}
          showObjectPanel={showObjectPanel}
        />
        <Canvas 
          objects={objects}
          modelFile={modelFile}
          objModelFile={objModelFile}
        />
      </div>
      <ObjectPanel 
        show={showObjectPanel}
        onSelectType={handleAddObject}
      />
      <div className="properties-panel">
        <div className="properties-card">
          <h3>Texto para 3D</h3>
          <textarea placeholder="Digite seu texto aqui..."></textarea>
          <div className="param-controls">
            <div className="param-item">
              <label>Guidance Scale</label>
              <input type="number" defaultValue="15" />
            </div>
            <div className="param-item">
              <label>Passos</label>
              <input type="number" defaultValue="64" />
            </div>
          </div>
          <button className="generate-button">Gerar</button>
        </div>
        <div className="properties-card">
          <h3>Imagem para 3D</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleModelUpload}
          />
          <button className="generate-button">Converter</button>
        </div>
      </div>
    </div>
  );
};

export default App;