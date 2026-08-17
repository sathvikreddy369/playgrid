import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotificationBell from './NotificationBell';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';

vi.mock('../api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        notifications: [
          {
            id: 'n-1',
            title: 'Request Accepted!',
            body: 'Your join request was accepted.',
            isRead: false,
            createdAt: new Date().toISOString()
          }
        ]
      }
    }),
    post: vi.fn().mockResolvedValue({ data: { message: 'ok' } })
  }
}));

describe('NotificationBell Component', () => {
  it('renders notification bell button', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <NotificationBell />
        </MemoryRouter>
      </AuthProvider>
    );

    const button = screen.getByRole('button', { name: /notifications/i });
    expect(button).toBeInTheDocument();
  });

  it('opens notification dropdown on click', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <NotificationBell />
        </MemoryRouter>
      </AuthProvider>
    );

    const button = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(button);

    const title = await screen.findByText('Notifications');
    expect(title).toBeInTheDocument();
  });
});
