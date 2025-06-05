import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../login'; // adapte le chemin
import axios from 'axios';

jest.mock('axios');

describe('Login Integration Test', () => {
  const mockSetToken = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    mockSetToken.mockClear();
  });

  test('successful login', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'test-token' } });

    render(<Login setToken={mockSetToken} />);

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'testuser' },
    });

    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() =>
      expect(mockSetToken).toHaveBeenCalledWith('test-token')
    );

    expect(localStorage.getItem('token')).toBe('test-token');
  });
});
