import { render, screen } from '@testing-library/react';
import ReportsPage from '../pages/ReportsPage';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ReportsPage />
    </MemoryRouter>
  );

describe('Teams tab', () => {
  it('shows 3-captain limit error when adding a captain', async () => {
    renderPage();

    // Go to Teams tab
    await userEvent.click(await screen.findByRole('button', { name: /teams/i }));

    // Wait for team row
    await screen.findByText(/los tigres fc/i);

    // Load detail
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await screen.findByText(/team details/i);

    // Add member as captain to trigger limit
    const emailInput = screen.getByPlaceholderText(/user email/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'newcap@test.com');

    const roleSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(roleSelect, 'capitan');

    await userEvent.click(screen.getByRole('button', { name: /add member/i }));

    const errors = await screen.findAllByText(/at most 3 captains/i);
    expect(errors.length).toBeGreaterThan(0);
  });
});
