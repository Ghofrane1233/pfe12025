import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './app/login';
import Dashboard from './app/Dashboard';
import './App.css';
import ClientsManager from './app/client/client'; 
import ModelManager from './app/model/model';
import PartsManager from './app/parts/parts';
import TechnicalDocuments from './app/Part-model/partmodel';
import FirmwareManager from './app/Firmware/Firmware';
import RepairManager from './app/Repair/repair';
import PCBEditor from './app/photoeditor/photoeditor';

function App() {
  const [token, setToken] = React.useState(() => {
    const tokenStocké = localStorage.getItem('token');
    return tokenStocké || '';
  });

  // Vérification simple de la présence du token
  const estAuthentifié = !!token;

  React.useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

return (
    <div data-testid="app-container">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={estAuthentifié ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />} 
          />
          <Route 
            path="/dashboard" 
            element={estAuthentifié ? <Dashboard token={token} setToken={setToken} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/client" 
            element={estAuthentifié ? <ClientsManager token={token} setToken={setToken} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/model"  
            element={estAuthentifié ? <ModelManager token={token} setToken={setToken} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/parts"  
            element={estAuthentifié ? <PartsManager token={token} setToken={setToken} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/repairs"  
            element={estAuthentifié ? <RepairManager token={token} setToken={setToken} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/documents"  
            element={estAuthentifié ? <TechnicalDocuments token={token} setToken={setToken} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/firmware"  
            element={estAuthentifié ? <FirmwareManager token={token} setToken={setToken} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/pcb-editor"  
            element={<PCBEditor/>} 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;