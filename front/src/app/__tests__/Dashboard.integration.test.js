// src/app/__tests__/Dashboard.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../../layout/layout', () => ({ children, username, onLogout }) => (
  <div data-testid="layout">
    <span>{username}</span>
    {children}
  </div>
));

jest.mock('../StatsCards', () => () => (
  <div data-testid="stats-cards">StatsCards</div>
));

describe('Dashboard', () => {
  it('should render username if token is valid', () => {
    jwtDecode.mockReturnValue({ username: 'Ghufran' });

    render(<Dashboard token="valid.token" setToken={() => {}} />);
    
    expect(screen.getByText('Ghufran')).toBeInTheDocument();
    expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
  });
});
