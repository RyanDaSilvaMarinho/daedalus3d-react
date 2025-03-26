import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  // Carrega os projetos do usuário atual ao montar o componente
  useEffect(() => {
    fetch("/getproject")
    .then(r => r.json())
    .then(r => {setProjects(r)}); // Define os projetos do usuário
  }, [navigate]);

  // Função para abrir um projeto
  const openProject = (projectId) => {
    const requestOptions = {
      method: 'POST',
      redirect: 'follow',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({id : projectId})
    }
    fetch("lockproject",requestOptions)
    .then((r) => { navigate('/App')});
  };

  return (
    <div className="home-container">
      <img className="logo" src="logo.png" alt="Logo" />
      <div className="home-projects">
        <div className="home-recent">
          <div className="home-new">
            <button
              className="new-project"
              onClick={() => navigate('/App', {state: true})} // Navega para a página de criação de projetos
            >
              +
            </button>
            <br />
            Novo Projeto
          </div>
        </div>
        <div className="home-history">
          <h3>Histórico de Projetos</h3>
          <ul>
            {projects.length > 0 ? (
              projects.map((project) => (
                <li key={project.id}>
                  <span>{project.name}</span>
                  <span>{project.date}</span>
                  <button onClick={() => openProject(project.id)}>Abrir</button>
                </li>
              ))
            ) : (
              <p>Nenhum projeto encontrado.</p>
            )}
          </ul>
        </div>
      </div>
      <div className="home-profile"></div>
      <div className="home-options">
        <button className="home-button" onClick={() => navigate('/Home')}>
          <img src="inicio.svg" alt="Inicio"/>
          <ul>Inicio</ul>
        </button>
        <button className='exit-box' onClick={() => navigate('/')}>
          Sair <img src='Icon-logout.svg' alt="Sair"/>
        </button>
      </div>
    </div>
  );
};

export default Home;