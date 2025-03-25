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
  routeChange,
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
        +
      </button>
      <button
        className="tool-button"
        onClick={onDelete}
        title="Excluir Objeto Selecionado"
        disabled={selectedCount === 0}
      >
        🗑️
      </button>
      <div className="boolean-operations">
        <button
          className="tool-button"
          onClick={() => onBooleanOperation('union')}
          disabled={!canOperate}
          title="União"
        >
          ∪
        </button>
        <button
          className="tool-button"
          onClick={() => onBooleanOperation('difference')}
          disabled={!canOperate}
          title="Diferença"
        >
          −
        </button>
        <button
          className="tool-button"
          onClick={() => onBooleanOperation('intersection')}
          disabled={!canOperate}
          title="Interseção"
        >
          ∩
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
        ↻
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
        ⇲
      </button>
      <button
        className="tool-button"
        onClick={handleFileImport}
        title="Importar OBJ"
      >
        ⬇ 
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
        💾
      </button>
      <button
        className="tool-button"
        onClick={onExportOBJ}
        title="Exportar OBJ"
      >
        📥
      </button>
      <button
        className="tool-button"
        onClick={routeChange}
        title="Voltar ao Início"
      >
        🏠
      </button>
    </div>
  );
};

export default Toolbar;