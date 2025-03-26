import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Register = () => {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
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
    fetch('/tryregister',requestOptions)
    .then(response => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })

  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Cadastro</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleRegister}>
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
          <button type="submit" className="register-button">Cadastrar</button>
        </form>
        <p className="login-link">
          Já tem uma conta? <a href="/">Faça login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;