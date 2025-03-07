import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import ObjectPanel from './ObjectPanel';
import '../App.css';
import { useNavigate, useLocation } from "react-router-dom";

const App = () => {
  const [showObjectPanel, setShowObjectPanel] = useState(false);
  const [objects, setObjects] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [objModelFile, setObjModelFile] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const canvasRef = useRef();
  
  let navigate = useNavigate();
  const location = useLocation();
  
  const routeChange = (destiny) => { 
    let path = destiny; 
    navigate(path);
  }
    // Carregar projeto salvo (se houver)
  useEffect(() => {
    if (location.state?.project) {
      const { project } = location.state;
      setObjects(project.data.objects || []);
      setModelFile(project.data.modelFile || null);
      setObjModelFile(project.data.objModelFile || null);
    }
  }, [location.state]);
  
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

  // Upload de arquivo OBJ
  const handleOBJUpload = (file) => {
    setObjModelFile(file);
  };
  const handleSelectObject = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(existingId => existingId !== id);
      } else {
        return [...prev, id];
      }
    });
    setSelectedObjectId(id);
  };

  const handleUnion = () => {
    if (selectedIds.length === 2) {
      const unionResult = canvasRef.current.performUnion(selectedIds);
      
      if (unionResult) {
        setObjects(prev => [
          ...prev.filter(obj => !unionResult.originalIds.includes(obj.id)),
          {
            id: unionResult.newId,
            type: 'union',
            color: '#00ff88',
            position: unionResult.position
          }
        ]);
      }
      setSelectedIds([]);
    }
  };

  const handleRotate = () => {
    if (selectedObjectId) {
      canvasRef.current.rotateObject(selectedObjectId, Math.PI/2);
    }
  };

  const saveCurrentProject = () => {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectNumber = projects.length + 1;

    const project = {
      id: Date.now(),
      name: `Projeto ${projectNumber}`,
      date: new Date().toISOString(),
      data: { objects, modelFile, objModelFile },
    };

    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));
    alert('Projeto salvo com sucesso!');
  };
  
  return (
    <div className="app-container">
      <div className="main-content">
        <Toolbar 
          onAddObject={setShowObjectPanel}
          showObjectPanel={showObjectPanel}
          onUnion={handleUnion}
          canUnion={selectedIds.length === 2}
          onRotate={handleRotate}
          canRotate={selectedObjectId !== null}
          onOBJUpload={handleOBJUpload}
          onSaveProject={saveCurrentProject}
          routeChange={() => navigate('/')}  
        />
        <Canvas 
          ref={canvasRef}
          objects={objects}
          modelFile={modelFile}
          objModelFile={objModelFile}
          onSelectObject={handleSelectObject}
          routeChange={() => navigate('/')}
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
        <button className='exit-box' onClick={() => routeChange('/')}>
          Sair <img src='Icon-logout.svg' alt="Sair"></img>
        </button>
      </div>
    </div>
  );
};

export default App;