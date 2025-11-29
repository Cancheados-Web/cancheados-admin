import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisputeEvidence } from '../components/disputes/DisputeEvidence';
import { DisputeComments } from '../components/disputes/DisputeComments';

const sampleEvidence = [
  {
    id: 'ev1',
    dispute_id: 'disp-1',
    file_url: 'https://example.com/photo.jpg',
    file_type: 'image/jpeg',
    uploaded_at: new Date().toISOString(),
    uploader: { id: 'u1', nombre: 'Uploader', email: 'u@test.com' }
  },
  {
    id: 'ev2',
    dispute_id: 'disp-1',
    file_url: 'https://example.com/clip.mp4',
    file_type: 'video/mp4',
    uploaded_at: new Date().toISOString(),
    uploader: { id: 'u2', nombre: 'Video User', email: 'v@test.com' }
  }
];

const sampleComments = [
  {
    id: 'c1',
    dispute_id: 'disp-1',
    user_id: 'admin-1',
    comment: 'Admin note',
    is_internal: true,
    created_at: new Date().toISOString(),
    user: { id: 'admin-1', nombre: 'Admin', email: 'admin@test.com', is_admin: true }
  },
  {
    id: 'c2',
    dispute_id: 'disp-1',
    user_id: 'user-1',
    comment: 'Public update',
    is_internal: false,
    created_at: new Date().toISOString(),
    user: { id: 'user-1', nombre: 'Reporter', email: 'reporter@test.com', is_admin: false }
  }
];

describe('DisputeEvidence', () => {
  it('shows loading state', () => {
    render(<DisputeEvidence evidence={[]} loading />);
    expect(screen.getByText(/Loading evidence/i)).toBeInTheDocument();
  });

  it('renders gallery items for images and videos', () => {
    render(<DisputeEvidence evidence={sampleEvidence as any} />);
    expect(screen.getByText(/Evidence \(2\)/i)).toBeInTheDocument();
    expect(screen.getByAltText('Evidence')).toBeInTheDocument();
    expect(screen.getByText(/MP4/i)).toBeInTheDocument();
  });
});

describe('DisputeComments', () => {
  it('renders timeline with internal badge and counts', () => {
    render(<DisputeComments comments={sampleComments as any} />);
    expect(screen.getByText(/Activity Timeline \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin note/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Public update/i)).toBeInTheDocument();
  });

  it('shows empty state when no comments', () => {
    render(<DisputeComments comments={[]} />);
    expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
  });
});
