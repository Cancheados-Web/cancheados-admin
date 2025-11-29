import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuditLogsPage from '../pages/AuditLogsPage';
import userEvent from '@testing-library/user-event';

const renderPage = () =>
  render(
    <MemoryRouter>
      <AuditLogsPage />
    </MemoryRouter>
  );

describe('AuditLogsPage', () => {
  it('shows audit logs and opens detail modal', async () => {
    renderPage();

    const headings = await screen.findAllByRole('heading', { name: /Audit Logs/i });
    expect(headings.length).toBeGreaterThan(0);
    expect(await screen.findByText(/admin1@test.com/i)).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: /View Details/i })[0]);
    expect(await screen.findByText(/Audit Log Details/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Abuse reports/i)).toBeInTheDocument());
  });

  it('applies filters and keeps list visible', async () => {
    renderPage();

    const headings = await screen.findAllByRole('heading', { name: /Audit Logs/i });
    expect(headings.length).toBeGreaterThan(0);
    await userEvent.selectOptions(screen.getByLabelText(/Entity Type/i), 'user');
    await userEvent.type(screen.getByPlaceholderText(/Filter by action/i), 'update');
    await userEvent.click(screen.getByText(/Apply Filters/i));
    expect(await screen.findByText(/Audit Logs \(2 total\)/i)).toBeInTheDocument();
  });
});
