import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Obtém a lista de usuários do localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username) {
      setError('Por favor, insira um nome de usuário.');
      return;
    }
    if (!password) {
      setError('Por favor, insira uma senha.');
      return;
    }

    const requestOptions = {
      method: 'POST',
      redirect: 'follow',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({user:username, pass:password})
    }
    fetch('/trylogin',requestOptions)
    .then(response => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="user-list">
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Nome de Usuário:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Senha:</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="register-button">Login</button>
        </form>
        </div>
        <p className="login-link">
          Não tem uma conta? <a href="/register">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;