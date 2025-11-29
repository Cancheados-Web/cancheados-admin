import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import LoginPage from '../pages/LoginPage';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock authApi.login via AuthContext by mocking tokenManager to skip actual storage
vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      login: vi.fn(async ({ email }) => ({
        user: { userId: 'admin-1', id: 'admin-1', email, nombre: 'Admin', is_admin: true },
        token: 'fake-token',
      })),
      logout: vi.fn(async () => {}),
    },
    tokenManager: {
      getUser: () => null,
      getToken: () => null,
      clear: vi.fn(),
      setToken: vi.fn(),
      setUser: vi.fn(),
    },
  };
});

function AppShell() {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/disputes" element={<div>Disputes landing</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  it('submits credentials and redirects on success', async () => {
    render(<AppShell />);

    await userEvent.type(screen.getByPlaceholderText(/email address/i), 'admin@test.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText(/Disputes landing/i)).toBeInTheDocument());
  });

  it('shows error when backend rejects non-admin', async () => {
    const { authApi } = await import('../lib/api');
    (authApi.login as any).mockRejectedValueOnce(new Error('Access denied: Admin privileges required'));

    render(<AppShell />);
    await userEvent.type(screen.getByPlaceholderText(/email address/i), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'bad');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await screen.findByText(/Access denied/i);
  });
});
