import React, { useState } from 'react';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import './style.css'
import axios from 'axios';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
console.log("API URL = ", apiUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //const response = await axios.post('${apiUrl}/login/login', {
	  const response = await axios.post(`${apiUrl}/login/login`,  { username, password });
      const token =response.data.token
      localStorage.setItem('token', token); // ou sessionStorage
console.log("tken",token)
      setToken(token);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
        <img src='../assets/boardHubLogo.png' alt='logo' style={{width:'129px', height:'auto'}}/>
        <p>Please enter your credentials to login</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username"
              required 
            />
            <span className="input-icon">
              <FiUser size={20} />
            </span>
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password"
              required 
            />
            <span className="input-icon">
              <FiLock size={20} />
            </span>
          </div>
          
          <button type="submit" className="login-button">
            Sign In
            <FiArrowRight size={20} />
          </button>
        </form>
        
      
      </div>
    </div>
  );
};

export default Login;