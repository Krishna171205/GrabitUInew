/**
 * LandingClient tests
 *
 * NOTE: grabit package has no test runner configured (no vitest/jest in package.json).
 * These tests are written for vitest + @testing-library/react.
 * To activate: add vitest, @testing-library/react, @testing-library/user-event,
 * jsdom, and @vitejs/plugin-react to devDependencies (requires UJJWAL approval).
 *
 * Until then these serve as living documentation of the expected behaviour.
 */

// import { render, screen, fireEvent } from '@testing-library/react';
// import LandingClient from './LandingClient';
// import type { GrabitCafe } from '@gradient365/gradient-commons';

// const makeCafe = (overrides: Partial<GrabitCafe> = {}): GrabitCafe => ({
//   id: 1,
//   slug: 'raydee-cafe',
//   name: 'Raydee Cafe',
//   phone: null,
//   address: '12 MG Road',
//   city: 'Bengaluru',
//   opening_time: '08:00',
//   closing_time: '22:00',
//   is_active: true,
//   ...overrides,
// });

// describe('LandingClient', () => {
//   // 1. Smoke test
//   it('renders without crashing', () => {
//     render(<LandingClient cafes={[]} />);
//   });

//   // 2. Nav renders logo + two CTA buttons
//   it('renders nav with Login and Find my cafe buttons', () => {
//     render(<LandingClient cafes={[]} />);
//     expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /find my cafe/i })).toBeInTheDocument();
//   });

//   // 3. Hero headline renders all three lines
//   it('renders hero headline lines', () => {
//     render(<LandingClient cafes={[]} />);
//     expect(screen.getByText('Your coffee')).toBeInTheDocument();
//     expect(screen.getByText('is already')).toBeInTheDocument();
//     expect(screen.getByText('waiting.')).toBeInTheDocument();
//   });

//   // 4. How it works renders three steps
//   it('renders three how-it-works steps', () => {
//     render(<LandingClient cafes={[]} />);
//     expect(screen.getByText('Browse')).toBeInTheDocument();
//     expect(screen.getByText('Pick a slot')).toBeInTheDocument();
//     expect(screen.getByText('Walk in')).toBeInTheDocument();
//   });

//   // 5. Empty state when no cafes
//   it('shows empty state when cafes array is empty', () => {
//     render(<LandingClient cafes={[]} />);
//     expect(screen.getByText(/no cafes found/i)).toBeInTheDocument();
//   });

//   // 6. Renders cafe cards
//   it('renders a card for each cafe', () => {
//     const cafes = [makeCafe({ id: 1, name: 'Raydee Cafe' }), makeCafe({ id: 2, name: 'Brew Lab', slug: 'brew-lab' })];
//     render(<LandingClient cafes={cafes} />);
//     expect(screen.getByText('Raydee Cafe')).toBeInTheDocument();
//     expect(screen.getByText('Brew Lab')).toBeInTheDocument();
//   });

//   // 7. Search filters cafes by name
//   it('filters cafes by name search', async () => {
//     const cafes = [makeCafe({ id: 1, name: 'Raydee Cafe' }), makeCafe({ id: 2, name: 'Brew Lab', slug: 'brew-lab' })];
//     render(<LandingClient cafes={cafes} />);
//     const input = screen.getByPlaceholderText(/search/i);
//     fireEvent.change(input, { target: { value: 'Raydee' } });
//     expect(screen.getByText('Raydee Cafe')).toBeInTheDocument();
//     expect(screen.queryByText('Brew Lab')).not.toBeInTheDocument();
//   });

//   // 8. Search filters cafes by city
//   it('filters cafes by city search', async () => {
//     const cafes = [
//       makeCafe({ id: 1, name: 'Raydee Cafe', city: 'Bengaluru' }),
//       makeCafe({ id: 2, name: 'Brew Lab', slug: 'brew-lab', city: 'Mumbai' }),
//     ];
//     render(<LandingClient cafes={cafes} />);
//     const input = screen.getByPlaceholderText(/search/i);
//     fireEvent.change(input, { target: { value: 'Mumbai' } });
//     expect(screen.queryByText('Raydee Cafe')).not.toBeInTheDocument();
//     expect(screen.getByText('Brew Lab')).toBeInTheDocument();
//   });

//   // 9. Cafe card links to correct slug
//   it('cafe card href points to /{slug}', () => {
//     render(<LandingClient cafes={[makeCafe()]} />);
//     const link = screen.getByRole('link', { name: /raydee cafe/i });
//     expect(link).toHaveAttribute('href', '/raydee-cafe');
//   });
// });
