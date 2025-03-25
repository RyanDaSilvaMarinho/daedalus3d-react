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
  const id = useRef(-1);
  const isMounted = useRef(false);
  
  
  let navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.projectId) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const users = JSON.parse(localStorage.getItem('users')) || [];
  
      if (currentUser) {
        const user = users.find(u => u.username === currentUser.username);
  
        if (user) {
          const project = user.projects.find(p => p.id === location.state.projectId);
  
          if (project) {
            setObjects(project.data.objects || []);
            setModelFile(project.data.modelFile || null);
            setObjModelFile(project.data.objModelFile || null);
            id.current = project.id;
          } else {
            console.error('Projeto não encontrado');
            navigate('/home');
          }
        }
      }
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
  
    if (currentUser) {
      const userIndex = users.findIndex(u => u.username === currentUser.username);
  
      if (userIndex !== -1) {
        const project = {
          id: id.current || Date.now(), // Usa o ID existente ou gera um novo
          name: `Projeto ${users[userIndex].projects.length + 1}`, // Nome do projeto
          date: new Date().toISOString(), // Data de criação
          data: { 
            objects, // Objetos 3D
            modelFile, // Arquivo de modelo (se houver)
            objModelFile // Arquivo OBJ (se houver)
          },
        };
  
        // Verifica se o projeto já existe no histórico do usuário
        const projectIndex = users[userIndex].projects.findIndex(p => p.id === project.id);
  
        if (projectIndex !== -1) {
          // Atualiza o projeto existente
          users[userIndex].projects[projectIndex] = project;
        } else {
          // Adiciona um novo projeto ao histórico do usuário
          users[userIndex].projects.push(project);
        }
  
        // Atualiza o localStorage com os novos dados do usuário
        localStorage.setItem('users', JSON.stringify(users));
  
        //alert('Projeto salvo altomaticamente!');
      }
    }
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