// ProjectTabs.jsx
import React from 'react';

const ProjectTabs = () => {
  const containerStyle = {
    position: 'absolute',
    top: '95px',
    left: '115px',
    backgroundColor: 'rgba(11, 31, 31, 0.8)',
    border: '1px solid #0D838333',
    borderRadius: '20px',
    padding: '10px 15px',
    color: 'white',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
  };

  const textStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: 'Open Sans, Arial, sans-serif',
    letterSpacing: '0.5px',
    margin: 0,
    textTransform: 'uppercase'
  };

  return (
    <div id="ambiente-modelagem" style={containerStyle}>
      <h6 style={textStyle}>ambiente de trabalho</h6>
    </div>
  );
};

export default ProjectTabs;