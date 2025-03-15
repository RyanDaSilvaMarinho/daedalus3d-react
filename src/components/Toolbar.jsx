import React, { useRef } from 'react';

const Toolbar = ({ 
  onAddObject, 
  showObjectPanel, 
  onUnion, 
  onDifference, 
  onIntersection, 
  canBooleanOp, 
  selectedCount,
  onRotate, 
  canRotate, 
  onOBJUpload, 
  onSaveProject, 
  onExportOBJ,
  routeChange
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
      
      {/* Operações Booleanas - agora agrupadas visualmente */}
      <div className="boolean-operations">
        <button
          className="tool-button"
          onClick={onUnion}
          disabled={!canBooleanOp}
          title="União"
          style={canBooleanOp ? {background: 'rgba(0, 255, 136, 0.2)'} : {}}
        >
          ∪
        </button>
        <button
          className="tool-button"
          onClick={onDifference}
          disabled={!canBooleanOp}
          title="Diferença"
          style={canBooleanOp ? {background: 'rgba(255, 136, 0, 0.2)'} : {}}
        >
          −
        </button>
        <button
          className="tool-button"
          onClick={onIntersection}
          disabled={!canBooleanOp}
          title="Interseção"
          style={canBooleanOp ? {background: 'rgba(0, 136, 255, 0.2)'} : {}}
        >
          ∩
        </button>
        
        {/* Indicador de seleção */}
        {selectedCount > 0 && (
          <div className="selection-indicator">
            {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      <button
        className="tool-button"
        onClick={onRotate}
        disabled={!canRotate}
        title="Rotacionar"
      >
        ↻
      </button>
      <button
        className="tool-button"
        onClick={handleFileImport}
        title="Importar OBJ"
      >
        ⬇️ 
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
    </div>
  );
};

export default Toolbar;