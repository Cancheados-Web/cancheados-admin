import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth loads', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true, user: null, login: vi.fn(), logout: vi.fn(), checkAuth: vi.fn() });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null, login: vi.fn(), logout: vi.fn(), checkAuth: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { email: 'a@test.com' }, login: vi.fn(), logout: vi.fn(), checkAuth: vi.fn() });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText(/Secret/i)).toBeInTheDocument();
  });
});

describe('Layout', () => {
  it('highlights active nav links and calls logout', async () => {
    const logout = vi.fn();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { nombre: 'Admin User', email: 'admin@test.com' },
      login: vi.fn(),
      logout,
      checkAuth: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/disputes']}>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin User/)).toBeInTheDocument();
    expect(screen.getByText(/Disputes/).className).toMatch(/border-indigo-500/);

    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    logoutBtn.click();
    expect(logout).toHaveBeenCalled();
  });
});
