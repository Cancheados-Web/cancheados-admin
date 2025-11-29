import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DisputeResolutionForm } from '../components/disputes/DisputeResolutionForm';
import { disputesApi } from '../lib/api/disputes';

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    },
    logger: {
      error: () => {}
    } as any
  });

const renderForm = (client: QueryClient, props: Partial<React.ComponentProps<typeof DisputeResolutionForm>> = {}) => {
  const defaultProps = {
    disputeId: 'disp-1',
    isOpen: true,
    onClose: vi.fn()
  };

  return render(
    <QueryClientProvider client={client}>
      <DisputeResolutionForm {...defaultProps} {...props} />
    </QueryClientProvider>
  );
};

describe('DisputeResolutionForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error - jsdom allows overriding alert
    window.alert = vi.fn();
  });

  it('submits a review action and refreshes dispute queries', async () => {
    const reviewSpy = vi.spyOn(disputesApi, 'reviewDispute').mockResolvedValue({} as any);
    const client = createClient();
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');
    const onClose = vi.fn();

    renderForm(client, { onClose });

    fireEvent.change(screen.getByLabelText(/Admin Notes/i), { target: { value: 'Investigating' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    fireEvent.click(await screen.findByRole('button', { name: /Confirm/i }));

    await waitFor(() => expect(reviewSpy).toHaveBeenCalledWith('disp-1', expect.any(Object)));
    expect(invalidateSpy).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('handles resolve and request-info actions across tabs', async () => {
    const resolveSpy = vi.spyOn(disputesApi, 'resolveDispute').mockResolvedValue({} as any);
    const requestInfoSpy = vi.spyOn(disputesApi, 'requestDisputeInfo').mockResolvedValue({} as any);
    const client = createClient();

    renderForm(client, { defaultAction: 'resolve' });

    // Resolve tab
    fireEvent.change(screen.getByLabelText(/Resolution Details/i), { target: { value: 'Refund issued' } });
    fireEvent.change(screen.getByLabelText(/Admin Notes/i), { target: { value: 'Documented' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Confirm/i }));
    await waitFor(() => expect(resolveSpy).toHaveBeenCalled());

    // Switch to request info tab
    fireEvent.click(screen.getByText(/Request Info/i));
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Need more context' } });
    fireEvent.click(screen.getByLabelText(/Both Parties/i));
    fireEvent.click(screen.getAllByRole('button', { name: /Submit/i })[0]);
    fireEvent.click(await screen.findByRole('button', { name: /Confirm/i }));

    await waitFor(() => expect(requestInfoSpy).toHaveBeenCalledWith('disp-1', expect.objectContaining({ requested_from: 'both' })));
  });
});
