// Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="menu">
        <a href="#" className="menu-item">Arquivo</a>
        <a href="#" className="menu-item">Editar</a>
      </div>
      <div className="logo">Daedalus</div>
      <div className="user-info">
        <span>Bem vindo, Nome Sobrenome</span>
      </div>
    </header>
  );
};

export default Header;
