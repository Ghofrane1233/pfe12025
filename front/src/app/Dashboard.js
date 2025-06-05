import React, { useState, useEffect } from 'react';
import Layout from '../layout/layout';
import StatsCards from './StatsCards';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Dashboard = ({ token, setToken }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded?.username || ''); // suppose que le token contient un champ "username"
      } catch (err) {
        setError('Token invalide. Veuillez vous reconnecter.');
        setToken('');
        localStorage.removeItem('token');
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [token, navigate, setToken]);

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <Layout username={username} onLogout={handleLogout}>
      <StatsCards />
    </Layout>
  );
};

export default Dashboard;
