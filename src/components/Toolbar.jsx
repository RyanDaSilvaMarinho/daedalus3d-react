import React, {useRef} from 'react';

const Toolbar = ({ onAddObject, showObjectPanel, onUnion, canUnion, onRotate, canRotate, onOBJUpload, onSaveProject }) => {
  const fileInputRef = useRef(null);

  const handleFileImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();  // Verifica se a referência não é nula
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verifica se o arquivo é do tipo .obj
      if (file.type === "model/obj" || file.name.endsWith(".obj")) {
        onOBJUpload(file);  // Chama a função de upload do arquivo
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
      >
        ✢
      </button>
      <button
        className="tool-button"
        onClick={onUnion}
        disabled={!canUnion}
      >
        🔗
      </button>
      <button
        className="tool-button"
        onClick={onRotate}
        disabled={!canRotate}
      >
        ↻
      </button>
      <button
        className="tool-button"
        onClick={handleFileImport} // Aciona o click no input invisível
      >
        ⬇️ 
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}  // Esconde o input de arquivo
        accept=".obj"
        onChange={handleFileChange}  // Chamamos a função com a verificação do tipo
      />
      {/* Botão de Salvar */}
      <button
        className="tool-button"
        onClick={onSaveProject}
      >
        💾 Salvar
      </button>
    </div>
  );
};

export default Toolbar;