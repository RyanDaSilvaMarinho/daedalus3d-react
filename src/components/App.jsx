import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import ProjectTabs from './ProjectTabs';
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
  const canvasRef = useRef();
  const id = useRef(-1);

  const isMounted = useRef(false)
  
  let navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.projectId) {
      const projects = JSON.parse(localStorage.getItem('projects')) || [];
      const project = projects.find(p => p.id === location.state.projectId);
      setObjects(project.data.objects || []);
      setModelFile(project.data.modelFile || null);
      setObjModelFile(project.data.objModelFile || null);
      id.current = project.id;
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

  const handleOBJUpload = (file) => {
    setObjModelFile(file);
  };

  const handleSelectObject = (id) => {
    setSelectedIds(prev => {
      if (prev.length < 2) {
        return [...prev, id];
      }
      return [id];
    });
  };

  const handleBooleanOperation = (operation) => {
    if (selectedIds.length === 2) {
      let result;
      switch(operation) {
        case 'union':
          result = canvasRef.current.performUnion(selectedIds);
          break;
        case 'difference':
          result = canvasRef.current.performDifference(selectedIds);
          break;
        case 'intersection':
          result = canvasRef.current.performIntersection(selectedIds);
          break;
      }
      
      if (result) {
        setObjects(prev => [
          ...prev.filter(obj => !selectedIds.includes(obj.id)),
          {
            id: result.newId,
            type: operation,
            color: '#ff8800',
            position: result.position
          }
        ]);
        setSelectedIds([]);
      }
    }
    
  };

  const saveCurrentProject = () => {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectNumber = projects.length + 1;
    let project = null;
    if (id.current <= 0) {
      project = {
        id: Date.now(),
        name: `Projeto ${projectNumber}`,
        date: new Date().toISOString(),
        data: { objects, modelFile, objModelFile },
      };
      id.current = project.id;
      projects.push(project);
    }else{
      project = projects.find(p => p.id === id.current);
      project.date = new Date().toISOString();
      project.data = { objects, modelFile, objModelFile };
      projects.map((proj) => proj.id === id.current? project : proj)
    }
    localStorage.setItem('projects', JSON.stringify(projects));
  };

  
  useEffect(() => {
    if(objects.length === 0){
      return;
    }
    if(!isMounted.current){
      isMounted.current = true
      return;
    }
     saveCurrentProject();
   }, [objects, modelFile, objModelFile])

  const manualSave = () => {
    saveCurrentProject();
    alert('Projeto salvo com sucesso!');
  };

  const handleExportOBJ = () => {
    canvasRef.current?.exportSceneToOBJ();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey) {
        document.body.classList.add('shift-pressed');
      }
    };

    const handleKeyUp = (e) => {
      if (!e.shiftKey) {
        document.body.classList.remove('shift-pressed');
      }
    };
    

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="main-content">
        <ProjectTabs />
        <Toolbar
          onAddObject={setShowObjectPanel}
          showObjectPanel={showObjectPanel}
          onBooleanOperation={handleBooleanOperation}
          canOperate={selectedIds.length === 2}
          onOBJUpload={handleOBJUpload}
          onSaveProject={manualSave}
          onExportOBJ={handleExportOBJ}
          routeChange={() => navigate('/')}
        />
        <Canvas
          ref={canvasRef}
          objects={objects}
          modelFile={modelFile}
          objModelFile={objModelFile}
          onSelectObject={handleSelectObject}
          selectedIds={selectedIds}
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

      <div className='home-profile'></div>
      <div className='home-options'>
        <button className='home-button' onClick={() => {saveCurrentProject(); navigate('/')}}>
          🏠 Inicio
        </button>
        <button className='exit-box' onClick={() => {saveCurrentProject(); navigate('/')}}>
          Sair <img src='Icon-logout.svg' alt="Sair"/>
        </button>
      </div>
    </div>
  );
};

export default App;