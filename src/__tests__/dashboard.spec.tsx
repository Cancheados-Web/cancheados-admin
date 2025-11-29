import { describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../pages/DashboardPage';
import { server } from '../test/testServer';

// Mock the chart to avoid Recharts/ResizeObserver complexity in tests
vi.mock('../components/dashboard/RevenueChart', () => ({
  __esModule: true,
  default: ({ data }: { data: Array<{ month: string; revenue: number; booking_count: number }> }) => (
    <div data-testid="revenue-chart">points:{data.length}</div>
  )
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  it('renders stats, revenue data and activity feed from the API', async () => {
    renderPage();

    await screen.findByText(/Dashboard/i);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText(/Revenue \(30d\)/i)).toBeInTheDocument();
    expect(screen.getByText(/\$3,800/)).toBeInTheDocument();

    expect(screen.getByTestId('revenue-chart')).toHaveTextContent('points:2');
    expect(screen.getByText(/New user registered/i)).toBeInTheDocument();
  });

  it('surfaces load errors and recovers on retry', async () => {
    server.use(
      http.get('http://localhost:3001/api/admin/dashboard/stats', () =>
        HttpResponse.json({ message: 'failed' }, { status: 500 })
      )
    );

    renderPage();

    await screen.findByText(/Failed to load dashboard data/i);

    server.use(
      http.get('http://localhost:3001/api/admin/dashboard/stats', ({ request }) =>
        HttpResponse.json({
          total_users: 10,
          new_users_7d: 1,
          new_users_30d: 2,
          active_teams: 5,
          total_venues: 3,
          verified_venues: 2,
          total_bookings: 8,
          confirmed_bookings: 6,
          cancelled_bookings: 2,
          pending_disputes: 0,
          completed_matches: 6,
          revenue_today: '15.00',
          revenue_week: '120.00',
          revenue_month: '320.00'
        })
      )
    );

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    await screen.findByText(/Dashboard/i);
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
