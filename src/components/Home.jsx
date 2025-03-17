import React, { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const routeChange = (destiny) =>{ 
    let path = destiny; 
    navigate(path);
  }
  useEffect(() => {
    // localStorage.setItem('projects', JSON.stringify([])); //CUIDADO, descomentar essa linha limpa os projetos

    const loadedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    
    // Ordenar projetos pelo nome
    const sortedProjects = loadedProjects.sort();
  
    setProjects(sortedProjects);
  }, []);
  // Função para abrir um projeto
  const openProject = (projectId) => {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
    if (project) {
      // Passar os dados do projeto para a página App
      navigate('/App', { state: { projectId } });
    }
  };
  return (
    <div className="home-container">
        <img className="logo" src="kp-logo-placeholder.png" alt='Logo'/>
        <div className='home-projects'>
          <div className='home-recent'>
            <div className='home-new' >
              <button className='new-project' src="new-button.svg" alt='+' onClick={() => routeChange('App')}></button>
              <br/>Novo Projeto
            </div>
          </div>
          <div className='home-history'>
          <h3>Histórico de Projetos</h3>
            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <span>{project.name}</span>
                  <span>{project.date}</span>
                  <button onClick={() => openProject(project.id)}>Abrir</button>
              </li>
            ))}
          </ul>
        </div>
        </div>
        <div className='home-profile'></div>
        <div className='home-options'>
          <button className="home-button">🏠Inicio</button>
        </div>
    </div>
            
  );
};

export default Home;