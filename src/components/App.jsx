import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [rotateMode, setRotateMode] = useState(false);
  const [scaleMode, setScaleMode] = useState(false);
  const canvasRef = useRef();
  const id = useRef(false);
  const isMounted = useRef(false);
  
  
  let navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state){
      id.current = -1
      fetch("/loadproject")
        .then(r => r.json())
        .then(proj => {
          setObjects(proj.data.objects);
          setModelFile(proj.data.modelFile);
          setObjModelFile(proj.data.objModelFile);
          id.current = proj.id;})
    }
  }, [location.state, navigate]);

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
  const handleDeleteObjects = () => {
    setObjects(prev => prev.filter(obj => !selectedIds.includes(obj.id)));
    setSelectedIds([]);
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
      try {
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
          default:
            console.error('Operação desconhecida');
            return;
        }
        
        if (result) {
          setObjects(prev => [
            ...prev.filter(obj => !selectedIds.includes(obj.id)),
            {
              id: result.newId,
              type: operation,
              color: '#FF00FF',
              position: result.position // Garantir que é um array [x, y, z]
            }
          ]);
          setSelectedIds([]);
        }
      } catch (error) {
        alert(error.message || 'Erro na operação booleana');
      }
    }
  };
  

  const saveCurrentProject = useCallback(() => {
    if(id.current !== -1){
      const project = {
        id: id.current || Date.now(), // Usa o ID existente ou gera um novo
        name: `Projeto`, // Nome do projeto
        date: new Date().toISOString(), // Data de criação
        data: { 
          objects, // Objetos 3D
          modelFile, // Arquivo de modelo (se houver)
          objModelFile // Arquivo OBJ (se houver)
        },

      };

      id.current = project.id;

      const requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(project)
      }

      fetch("/saveproject", requestOptions)
    }
    //alert('Projeto salvo altomaticamente!');
  }, [objects, modelFile, objModelFile]);

  useEffect(() => {
    if (objects.length === 0 && !isMounted.current) {
      isMounted.current = true;
      return;  
    }
    saveCurrentProject();
  }, [objects, modelFile, objModelFile,selectedIds,saveCurrentProject]);

  const manualSave = () => {
    saveCurrentProject();

    //alert('Projeto salvo com sucesso!');
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
      <img className="logo" src="logo.png" alt="Logo" />
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
          onRotate={() => setRotateMode(prev => !prev)}
          rotateMode={rotateMode}
          selectedCount={selectedIds.length}
          onDelete={handleDeleteObjects}
          onScale={() => setScaleMode(prev => !prev)}
          scaleMode={scaleMode}
        />
        <Canvas
          ref={canvasRef}
          objects={objects}
          modelFile={modelFile}
          objModelFile={objModelFile}
          onSelectObject={handleSelectObject}
          rotateMode={rotateMode}
          scaleMode={scaleMode}
        />
      </div>
      
      <ObjectPanel
        show={showObjectPanel}
        onSelectType={handleAddObject}
      />

      <div className="properties-panel">
        <div className="properties-card">
          <h3>Texto para 3D</h3>
          <textarea placeholder="Digite seu texto aqui!"></textarea>
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
        <button className='home-button' onClick={() => {saveCurrentProject(); navigate('/Home')}}>
        <img src="inicio.svg" alt="Inicio"/>
        <ul>Inicio</ul>
        </button>
        <button className='exit-box' onClick={() => {saveCurrentProject(); navigate('/')}}>
          Sair <img src='Icon-logout.svg' alt="Sair"/>
        </button>
      </div>
    </div>
  );
};

export default App;