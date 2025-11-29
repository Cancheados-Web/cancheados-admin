import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TeamsPage from '../pages/TeamsPage';
import UsersPage from '../pages/UsersPage';
import VenuesPage from '../pages/VenuesPage';

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Management pages', () => {
  it('renders teams and suspends a team with reason', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderWithClient(<TeamsPage />);

    await screen.findByText(/Teams Management/i);
    await screen.findByText(/Active Team/i);

    await userEvent.click(screen.getByRole('button', { name: /Suspend/i }));
    await userEvent.type(screen.getByPlaceholderText(/Enter reason/i), 'Because testing');
    await userEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Team suspended successfully'));
    alertSpy.mockRestore();
  });

  it('renders users and suspends a user with reason', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderWithClient(<UsersPage />);

    await screen.findByText(/Users Management/i);
    await screen.findByText(/user1@test.com/i);

    await userEvent.click(screen.getByRole('button', { name: /Suspend/i }));
    await userEvent.type(screen.getByPlaceholderText(/Enter reason/i), 'Testing reason');
    await userEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('User suspended successfully'));
    alertSpy.mockRestore();
  });

  it('renders venues and verifies then suspends a venue', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderWithClient(<VenuesPage />);

    await screen.findByText(/Venues Management/i);
    await screen.findByText(/Central Park Arena/i);

    await userEvent.click(screen.getByRole('button', { name: /Verify/i }));
    await userEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Venue verified successfully'));

    await userEvent.click(screen.getByRole('button', { name: /Suspend/i }));
    await userEvent.type(screen.getByPlaceholderText(/Enter reason/i), 'Maintenance');
    await userEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Venue suspended successfully'));
    alertSpy.mockRestore();
  });
});
