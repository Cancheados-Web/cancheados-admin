import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/testServer';
import DisputesPage from '../pages/DisputesPage';

const renderDisputes = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <DisputesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('DisputesPage', () => {
  it('renders pending disputes and pagination details', async () => {
    renderDisputes();

    await screen.findByText(/Disputes Management/i);
    expect((await screen.findAllByText(/Reporter/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/Pending/i)).length).toBeGreaterThan(0);
    expect(await screen.findByText(/behavior/i)).toBeInTheDocument();
    expect(await screen.findByText(/reporter@test\.com/i)).toBeInTheDocument();
  });

  it('switches to resolved tab and shows resolved disputes', async () => {
    renderDisputes();

    await userEvent.click(screen.getByRole('button', { name: /Resolved/i }));
    expect((await screen.findAllByText(/payment issue/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/Resolved/i)).length).toBeGreaterThan(0);
  });

  it('shows error state when the API fails', async () => {
    server.use(
      http.get('http://localhost:3001/api/admin/disputes/pending', () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 })
      )
    );

    renderDisputes();
    expect(await screen.findByText(/Error loading disputes/i)).toBeInTheDocument();
  });
});
