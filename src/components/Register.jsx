import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Register = () => {
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

    // Verifica se o usuário já existe
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.username === username);

    if (userExists) {
      setError('Nome de usuário já cadastrado.');
      return;
    }

    // Cria um novo usuário
    const newUser = {
      id: Date.now(), // ID único
      username,
      projects: [], // Histórico de projetos vazio
    };

    // Salva o usuário no localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    setSuccess('Usuário cadastrado com sucesso!');
    setError('');
    setTimeout(() => navigate('/'), 2000); // Redireciona para a tela de login após 2 segundos
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