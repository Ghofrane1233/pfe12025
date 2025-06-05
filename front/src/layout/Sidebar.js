import React, { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiMonitor, FiAlertCircle } from 'react-icons/fi';
import './style.css';
import { Link, useLocation } from 'react-router-dom';
import { GiAutoRepair } from "react-icons/gi";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { MdSystemUpdateAlt } from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    const validPaths = [
      '/Dashboard', '/client', '/model', '/parts',
      '/repairs', '/documents', '/Firmware'
    ];
    if (validPaths.includes(location.pathname)) {
      setActiveItem(location.pathname);
    } else {
      setActiveItem('');
    }
  }, [location.pathname]);

  const isActive = (path) => activeItem === path;

  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src="../assets/boardHubLogo.png" alt="logo" style={{ width: "129px", height: "auto" }} />
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <ul>
            <li className={`nav-item ${isActive('/Dashboard') ? 'active' : ''}`}>
              <Link to="/Dashboard" className="link-style">
                <FiHome size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/client') ? 'active' : ''}`}>
              <Link to="/client" className="link-style">
                <FiUsers size={20} />
                <span>Client Management</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/model') ? 'active' : ''}`}>
              <Link to="/model" className="link-style">
                <FiMonitor size={20} />
                <span>Model Management</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/parts') ? 'active' : ''}`}>
              <Link to="/parts" className="link-style">
                <FiAlertCircle size={20} />
                <span>Parts Management</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/repairs') ? 'active' : ''}`}>
              <Link to="/repairs" className="link-style">
                <GiAutoRepair size={20} />
                <span>Repairs Management</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/documents') ? 'active' : ''}`}>
              <Link to="/documents" className="link-style">
                <UploadFileIcon fontSize="small" />
                <span>Technical Documents</span>
              </Link>
            </li>
            <li className={`nav-item ${isActive('/Firmware') ? 'active' : ''}`}>
              <Link to="/Firmware" className="link-style">
                <MdSystemUpdateAlt size={20} />
                <span>Firmware Manager</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
