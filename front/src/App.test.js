import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Check for any element that should definitely be in your app
  const appElement = screen.getByTestId('app-container'); // or use other queries
  expect(appElement).toBeInTheDocument();
});