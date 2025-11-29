import { render, screen, waitFor } from '@testing-library/react';
import ReportsPage from '../pages/ReportsPage';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/dom';
import { vi } from 'vitest';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ReportsPage />
    </MemoryRouter>
  );

describe('ReportsPage', () => {
  it('shows overview metrics', async () => {
    renderPage();

    const usersCardHeading = await screen.findAllByRole('heading', { level: 3, name: 'Users' });
    const usersContainer = usersCardHeading[0].closest('div');
    expect(within(usersContainer!).getByText(/20/)).toBeInTheDocument();

    const teamsCardHeading = screen.getAllByRole('heading', { level: 3, name: 'Teams' })[0];
    expect(within(teamsCardHeading.closest('div')!).getByText(/5/)).toBeInTheDocument();

    const venuesCardHeading = screen.getAllByRole('heading', { level: 3, name: 'Venues' })[0];
    expect(within(venuesCardHeading.closest('div')!).getByText(/3/)).toBeInTheDocument();
  });

  it('displays bookings statistics', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /bookings/i }));

    const statsHeading = await screen.findByText(/Bookings Statistics/i);
    const statsCard = statsHeading.closest('div');
    expect(within(statsCard!).getByText('12')).toBeInTheDocument();
    expect(within(statsCard!).getByText('9')).toBeInTheDocument();
    expect(within(statsCard!).getByText('3')).toBeInTheDocument();
    await screen.findByText(/\$120/);
  });

  it('shows users list and detail', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /users/i }));

    await screen.findByText(/Users Overview/i);
    const row = await screen.findByText(/user1@test.com/i);
    expect(row).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /details/i }));
    await waitFor(() => expect(screen.getByText(/User Details \/ Edit/i)).toBeInTheDocument());
    expect(screen.getByDisplayValue('User One')).toBeInTheDocument();
    await screen.findByText(/Los Tigres FC/i);
  });

  it('shows revenue and disputes tabs', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /revenue/i }));
    await screen.findByText(/Monthly Bookings/i);
    await userEvent.click(screen.getByRole('button', { name: /disputes/i }));
    await screen.findByText(/total disputes/i);
  });

  it('shows bookings calendar and loads booking detail', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /bookings/i }));
    await screen.findByText(/Scheduled Matches Calendar/i);
    const dayButton = (await screen.findAllByText(/confirmed/i))[0];
    await userEvent.click(dayButton.closest('button') ?? dayButton);
    expect(await screen.findByText(/Booking Details/i)).toBeInTheDocument();
  });

  it('allows toggling user status and saving edits', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /users/i }));
    await screen.findByText(/Users Overview/i);
    await userEvent.click(screen.getByRole('button', { name: /details/i }));
    await waitFor(() => expect(screen.getByText(/User Details \/ Edit/i)).toBeInTheDocument());
    const adminCheckbox = screen.getByLabelText(/Admin/i);
    await userEvent.click(adminCheckbox);
    await userEvent.click(screen.getByRole('button', { name: /^Save$/i }));
  });

  it('saves team edits after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /teams/i }));

    await screen.findByText(/Los Tigres FC/i);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await screen.findByText(/Team Details \/ Edit/i);

    const nameInput = screen.getByLabelText(/Name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Tigres');

    await userEvent.click(screen.getByRole('button', { name: /^Save$/i }));
    expect(await screen.findByText(/Team updated successfully/i)).toBeInTheDocument();
    await screen.findByDisplayValue(/Updated Tigres/i);
    confirmSpy.mockRestore();
  });

  it('removes a member after confirmation and refreshes list', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /teams/i }));
    await screen.findByText(/Los Tigres FC/i);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await screen.findByText(/Team Details \/ Edit/i);

    const removeButtons = await screen.findAllByRole('button', { name: /remove/i });
    await userEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(/cap2@test.com/i)).not.toBeInTheDocument();
    });
    expect(await screen.findByText(/Member removed/i)).toBeInTheDocument();
    confirmSpy.mockRestore();
  });
});
