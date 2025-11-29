import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../test/testServer';
import TestReportPage from '../pages/TestReportPage';
import userEvent from '@testing-library/user-event';

const renderPage = () =>
  render(
    <MemoryRouter>
      <TestReportPage />
    </MemoryRouter>
  );

describe('TestReportPage', () => {
  it('shows frontend and backend coverage data', async () => {
    renderPage();

    await screen.findByText(/Test Coverage Dashboard/i);
    expect(screen.getByText(/Frontend/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Backend/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/82\.5%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/60\.0?\s*%/).length).toBeGreaterThan(0);
  });

  it('shows error state and retries', async () => {
    server.use(
      http.get('*/test-report.json', () => HttpResponse.json({ message: 'fail' }, { status: 500 }))
    );

    renderPage();
    await screen.findByText(/Failed to load test report/i);

    server.use(
      http.get('*/test-report.json', () =>
        HttpResponse.json({
          generatedAt: new Date().toISOString(),
          frontend: {
            project: 'admin',
            status: 'passed',
            coverage: {
              lines: { pct: 90, total: 10, covered: 9 },
              statements: { pct: 90, total: 10, covered: 9 },
              branches: { pct: 90, total: 10, covered: 9 },
              functions: { pct: 90, total: 10, covered: 9 }
            }
          },
          backend: { project: 'backend', status: 'missing', coverage: null }
        })
      )
    );

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    await screen.findByText(/Test Coverage Dashboard/i);
    expect(screen.getAllByText(/90\.0\s*%/).length).toBeGreaterThan(0);
  });
});
