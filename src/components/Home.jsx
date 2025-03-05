import '../App.css';

import { useNavigate } from "react-router-dom";

const Home = () => {

  let navigate = useNavigate(); 
  const routeChange = (destiny) =>{ 
    let path = destiny; 
    navigate(path);
  }

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
          <div className='home-history'></div>
        </div>
        <div className='home-profile'></div>
        <div className='home-options'></div>
    </div>
            
  );
};

export default Home;