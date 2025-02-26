import React, { useRef } from 'react';

const Header = ({ onOBJUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileImport = () => {
    fileInputRef.current.click();
  };

  return (
    <header className="header">
      <div className="menu">
        <a href="#" className="menu-item" onClick={handleFileImport}>
          Arquivo
        </a>
        <a href="#" className="menu-item">Editar</a>
      </div>
      <div className="logo">Daedalus</div>
      <div className="user-info">
        <span>Bem vindo, Nome Sobrenome</span>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".obj"
        onChange={(e) => onOBJUpload(e.target.files[0])}
      />
    </header>
  );
};

export default Header;