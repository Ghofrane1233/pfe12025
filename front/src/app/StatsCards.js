import React, { useEffect, useState } from 'react';
import { FiUsers, FiMonitor, FiAlertCircle } from 'react-icons/fi';
import './style.css';

const StatsCards = () => {
  const [clientCount, setClientCount] = useState(0);
  const [modelCount, setModelCount] = useState(0);
  const [partsCount, setpartsCount] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token'); // ou sessionStorage
  
    fetch(`${apiUrl}/clients/clients/count`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Non autorisé ou erreur serveur');
        }
        return res.json();
      })
      .then(data => setClientCount(data.total))
      .catch(err => {
        console.error('Erreur de récupération du nombre de clients:', err);
        // Optionnel : gérer la déconnexion si token invalide
        if (err.message === 'Non autorisé ou erreur serveur') {
          localStorage.removeItem('token');
        
        }
      });
  }, []);
  
  // Récupérer le nombre de modèles
  useEffect(() => {
    const token = localStorage.getItem('token'); // Ou récupéré depuis un state/props
  
    if (!token) {
      console.error("Aucun token trouvé. Redirection ou gestion à ajouter.");
      return;
    }
  
    fetch(`${apiUrl}/model/model/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Non autorisé');
        return res.json();
      })
      .then(data => setModelCount(data.total))
      .catch(err => console.error('Erreur de récupération du nombre de modèles:', err));
  }, []);
  

  //  Récupérer le nombre de Part
  useEffect(() => {
    const token = localStorage.getItem('token'); // ou un state/props si tu utilises useContext ou autre
  
    if (!token) {
      console.error("Aucun token trouvé. Redirection ou gestion à ajouter.");
      return;
    }
  
    fetch(`${apiUrl}/parts/parts/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur d’autorisation');
        return res.json();
      })
      .then(data => setpartsCount(data.total))
      .catch(err => console.error('Erreur de récupération du nombre de pièces:', err));
  }, []);
  
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon clients">
          <FiUsers size={24} />
        </div>
        <div className="stat-info">
          <h3>Clients</h3>
          <p>{clientCount}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon models">
          <FiMonitor size={24} />
        </div>
        <div className="stat-info">
          <h3>Models</h3>
          <p>{modelCount}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon parts">
          <FiAlertCircle size={24} />
        </div>
        <div className="stat-info">
          <h3>Parts</h3>
          <p>{partsCount}</p> {/* Tu peux aussi le rendre dynamique si tu veux plus tard */}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
