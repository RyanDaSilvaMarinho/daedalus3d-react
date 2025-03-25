import React, { useRef } from 'react';

const Toolbar = ({ 
  onAddObject, 
  showObjectPanel, 
  onBooleanOperation,
  onDelete, 
  canOperate, 
  selectedCount,
  onRotate, 
  onOBJUpload, 
  onSaveProject, 
  onExportOBJ,
  rotateMode,
  scaleMode,
  onScale 
}) => {
  const fileInputRef = useRef(null);

  const handleFileImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "model/obj" || file.name.endsWith(".obj")) {
        onOBJUpload(file);
      } else {
        alert("Por favor, selecione um arquivo .obj!");
      }
    }
  };

  return (
    <div className="sidebar">
      <button 
        className="tool-button" 
        onClick={() => onAddObject(!showObjectPanel)}
        title="Adicionar Objeto"
      >
        <img src='Criar_Formas.png' alt="Criar forma"/>
      </button>
      <button
        className="tool-button"
        onClick={onDelete}
        title="Excluir Objeto Selecionado"
        disabled={selectedCount === 0}
      >
        <img src='Excluir_Objetos.png' alt="Exluir Objetos"/>
      </button>
      <div className="boolean-operations">
        <button
          className="tool-button"
          onClick={() => onBooleanOperation('union')}
          disabled={!canOperate}
          title="União"
        >
          <img src='Unir_Objetos.png' alt="Unir dois objetos"/>
        </button>
        <button
          className="tool-button"
          onClick={() => onBooleanOperation('difference')}
          disabled={!canOperate}
          title="Diferença"
        >
          <img src="Subtração.png" alt="Subtração de duas formas"/>
        </button>
        <button
          className="tool-button"
          onClick={() => onBooleanOperation('intersection')}
          disabled={!canOperate}
          title="Interseção"
        >
          <img src ='Intersecção_Formas.png' alt= "Intersecção entre duas formas"/>
        </button>
      </div>
      
      <button
        className="tool-button"
        onClick={onRotate}
        title="Rotacionar"
        style={rotateMode ? { 
          backgroundColor: '#00ff88', 
          color: '#000',
          transform: 'scale(1.1)' 
        } : {}}
      >
        <img src ="rotacionar.png" alt = "Rotacionar Formas"/>
      </button>
      <button
        className="tool-button"
        onClick={onScale}
        title="Redimensionar"
        style={scaleMode ? { 
          backgroundColor: '#00ff88', 
          color: '#000',
          transform: 'scale(1.1)' 
        } : {}}
      >
        <img src='Redimensionar_Daedalus.png' alt="redimensionar"/>
      </button>
      <button
        className="tool-button"
        onClick={handleFileImport}
        title="Importar OBJ"
      >
        <img src="Importar_Objetos.png" alt="Importar Objetos"/> 
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".obj"
        onChange={handleFileChange}
      />
      <button
        className="tool-button"
        onClick={onSaveProject}
        title="Salvar Projeto"
      >
        <img src='Salvar_Daedalus.png' alt="Salvar Projeto"/>
      </button>
      <button
        className="tool-button"
        onClick={onExportOBJ}
        title="Exportar OBJ"
      >
        <img src="Exportar_Objeto.png" alt="Exportar o projeto"/>
      </button>
    </div>
  );
};

export default Toolbar;