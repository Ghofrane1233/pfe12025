import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './style.css'; // Assurez-vous d'avoir ce fichier CSS

function Layout({ children, username, onLogout }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState('Dashboard'); 
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleItemClick = (component) => {
    setActiveComponent(component);  // Change le composant actif lorsque l'élément du menu est cliqué
  };

  return (
    <div className="dashboard-layout">
     <Sidebar 
        isOpen={sidebarOpen} 
        handleItemClick={handleItemClick} 
        activeItem={activeComponent} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className="main-content">
        <Navbar 
          username={username} 
          onLogout={onLogout} 
          token={token}
          setToken={setToken}
        />
  
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
