import { describe, expect, it, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import RevenueChart from '../components/dashboard/RevenueChart';
import BookingsChart from '../components/dashboard/BookingsChart';

// Provide a minimal ResizeObserver so Recharts can compute dimensions
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).ResizeObserver = class {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: any;
      constructor(callback: any) {
        this.callback = callback;
      }
      observe(target: Element) {
        const width = (target as HTMLElement).clientWidth || 800;
        const height = (target as HTMLElement).clientHeight || 400;
        this.callback([{ target, contentRect: { width, height } }]);
      }
      unobserve() {}
      disconnect() {}
    };
  }
});

const wrapperStyle = { width: '800px', height: '400px' };

describe('RevenueChart', () => {
  it('renders chart with formatted months and lines', async () => {
    const data = [
      { month: '2025-12', revenue: 120, booking_count: 9 },
      { month: '2026-01', revenue: 90, booking_count: 6 }
    ];

    render(
      <div style={wrapperStyle}>
        <RevenueChart data={data} />
      </div>
    );

    expect((await screen.findAllByText(/Revenue/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/Bookings/i)).length).toBeGreaterThan(0);
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('shows empty state when data missing', () => {
    render(
      <div style={wrapperStyle}>
        <RevenueChart data={[]} />
      </div>
    );
    expect(screen.getByText(/No revenue data available/i)).toBeInTheDocument();
  });
});

describe('BookingsChart', () => {
  it('renders booking trends with formatted labels', async () => {
    const data = [
      { month: '2025-11', booking_count: 12 },
      { month: '2025-12', booking_count: 18 }
    ];

    render(
      <div style={wrapperStyle}>
        <BookingsChart data={data} />
      </div>
    );

    expect((await screen.findAllByText(/Bookings/i)).length).toBeGreaterThan(0);
    expect(document.querySelector('svg')).toBeTruthy();
  });

  it('shows empty state when no booking data', () => {
    render(
      <div style={wrapperStyle}>
        <BookingsChart data={[]} />
      </div>
    );
    expect(screen.getByText(/No bookings data available/i)).toBeInTheDocument();
  });
});
