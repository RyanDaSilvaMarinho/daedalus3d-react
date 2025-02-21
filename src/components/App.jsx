import React, { useState, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import ObjectPanel from './ObjectPanel';
import Timeline from './Timeline';
import '../App.css';  // ou o caminho correto para o seu arquivo CSS


const App = () => {
  const [showObjectPanel, setShowObjectPanel] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState('cube');
  const [sceneData, setSceneData] = useState(null);
  const [modelFile, setModelFile] = useState(null);

  // Função para carregar o arquivo de modelo 3D
  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModelFile(file);
    }
  };

  const handleSceneReady = useCallback((data) => {
    setSceneData(data);
  }, []);

  return (
    <div className="app-container">
      <Header />
      <Timeline />
      <div className="main-content">
        <Toolbar 
          onAddObject={setShowObjectPanel}
          showObjectPanel={showObjectPanel}
        />
        <Canvas 
          onSceneReady={handleSceneReady} 
          modelFile={modelFile} 
        />
      </div>
      <ObjectPanel 
        show={showObjectPanel}
        onSelectType={setSelectedObjectType}
      />
      <div className="properties-panel">
        <div className="properties-card">
          <h3>Texto para 3D</h3>
          <textarea 
            id="text-input" 
            placeholder="Digite seu texto aqui..."
          >
            Lorem ipsum is simply dummy text of the printing and typesetting industry.
          </textarea>

          <div className="param-controls">
            <div className="param-group">
              <div className="param-item">
                <label className="param-label" for="guidance-scale">Guidance Scale</label>
                <input 
                  type="number" 
                  id="guidance-scale" 
                  className="param-input"
                  value="15" 
                  min="5" 
                  max="20"
                />
              </div>
              <div className="param-item">
                <label className="param-label" for="num-steps">Passos</label>
                <input 
                  type="number" 
                  id="num-steps" 
                  className="param-input"
                  value="64" 
                  min="25" 
                  max="100"
                />
              </div>
            </div>
          </div>

          <button className="generate-button" id="generate-text-3d">Gerar</button>
        </div>

        <div className="properties-card">
          <h3>Imagem para 3D</h3>
          <input 
            type="file" 
            id="image-input" 
            accept="image/*" 
            className="file-input"
            onChange={handleModelUpload} 
          />
          <button className="generate-button" id="generate-image-3d">Converter</button>
        </div>
      </div>
    </div>
  );
};

export default App;
