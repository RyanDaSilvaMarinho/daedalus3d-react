import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Obtém a lista de usuários do localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];

  const handleLogin = (username) => {
    // Define o usuário atual no localStorage
    localStorage.setItem('currentUser', JSON.stringify({ username }));
    navigate('/home'); // Redireciona para a página inicial
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="user-list">
          {users.length > 0 ? (
            users.map((user) => (
              <button
                key={user.id}
                className="user-button"
                onClick={() => handleLogin(user.username)}
              >
                Entrar como {user.username}
              </button>
            ))
          ) : (
            <p>Nenhum usuário cadastrado.</p>
          )}
        </div>
        <p className="login-link">
          Não tem uma conta? <a href="/register">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;