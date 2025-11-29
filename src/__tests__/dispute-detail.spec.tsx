import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DisputeDetailPage from '../pages/DisputeDetailPage';

const renderPage = (id = 'disp-1') =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[`/disputes/${id}`]}>
        <Routes>
          <Route path="/disputes/:id" element={<DisputeDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('DisputeDetailPage', () => {
  it('renders dispute info, evidence, and comments', async () => {
    renderPage();

    expect((await screen.findAllByText(/Dispute #disp-1/i)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Rough play reported/i)).toBeInTheDocument();
    expect(await screen.findByText(/Evidence \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Reviewing this now/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resolve/i })).toBeInTheDocument();
  });

  it('shows error state for missing dispute', async () => {
    renderPage('missing-id');

    await screen.findByText(/Dispute Not Found/i);
    expect(screen.getByRole('button', { name: /Back to Disputes/i })).toBeInTheDocument();
  });
});
