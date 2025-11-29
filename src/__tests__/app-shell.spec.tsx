import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { tokenManager } from '../lib/api';

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated users to the login page', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Cancheados Admin/i)).toBeInTheDocument();
    });
  });

  it('renders dashboard content when an admin session exists', async () => {
    tokenManager.setToken('test-token');
    tokenManager.setUser({
      id: 'admin-1',
      userId: 'admin-1',
      email: 'admin@test.com',
      nombre: 'Admin User',
      is_admin: true
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
  });
});

describe('main bootstrap', () => {
  it('mounts the React app into the root element', async () => {
    vi.resetModules();
    const renderMock = vi.fn();
    const createRootMock = vi.fn(() => ({ render: renderMock }));

    vi.doMock('react-dom/client', async () => {
      const actual = await vi.importActual<typeof import('react-dom/client')>('react-dom/client');
      return { ...actual, createRoot: createRootMock };
    });

    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    await import('../main');

    expect(createRootMock).toHaveBeenCalledWith(root);
    expect(renderMock).toHaveBeenCalled();
  });
});
