import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the public UmNi landing page', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /draw\. ask\.\s*solve/i })
  ).toBeInTheDocument();
});
