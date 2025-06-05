import React from 'react';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import './style.css';

const Navbar = ({ username, onLogout }) => {
  const initial = username ? username.charAt(0).toUpperCase() : '';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle">
          <FiMenu size={24} />
        </button>
      </div>
      <div className="navbar-right">
        <div className="user-profile">
          <span>Welcome, {username || 'Guest'}</span>
          <div className="avatar">
            {initial}
          </div>
        </div>
        <button onClick={onLogout} className="logout-button">
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
