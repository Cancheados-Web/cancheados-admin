import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { authApi, tokenManager } from '../lib/api';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('restores an admin session from storage', async () => {
    tokenManager.setToken('token-123');
    tokenManager.setUser({
      id: 'admin-1',
      userId: 'admin-1',
      email: 'admin@test.com',
      nombre: 'Admin',
      is_admin: true
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('admin@test.com');
  });

  it('clears state when stored user is not admin', async () => {
    tokenManager.setToken('token-123');
    tokenManager.setUser({
      id: 'user-1',
      email: 'user@test.com',
      nombre: 'Regular',
      is_admin: false
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenManager.getToken()).toBeNull();
  });

  it('rejects login for non-admin users', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      user: { id: 'user-1', email: 'user@test.com', nombre: 'User', is_admin: false },
      token: 'jwt-token'
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login({ email: 'user@test.com', password: 'Passw0rd!' });
      })
    ).rejects.toThrow(/admin/i);

    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenManager.getToken()).toBeNull();
  });

  it('logs out even if the API call fails', async () => {
    vi.spyOn(authApi, 'logout').mockRejectedValue(new Error('network down'));

    tokenManager.setToken('token-123');
    tokenManager.setUser({ id: 'admin-1', email: 'admin@test.com', nombre: 'Admin', is_admin: true });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(tokenManager.getToken()).toBeNull();
  });
});
