// Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um email válido.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
  
    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao cadastrar usuário.');
      }
  
      const data = await response.json();
      setSuccess(data.message);
      setError('');
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Cadastro</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
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