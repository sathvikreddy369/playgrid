import React from 'react';
import { render, screen } from '../test/test-utils';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../providers/AuthProvider';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../providers/AuthProvider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: any) => <>{children}</> // dummy provider so test-utils doesn't crash
}));

const renderWithRouter = (ui: React.ReactElement, route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when auth is loading', () => {
    (useAuth as any).mockReturnValue({ isLoading: true });
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      firebaseUser: null,
    });
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated and no specific role is required', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      firebaseUser: { uid: '123' },
    });
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to unauthorized when user lacks required role', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      firebaseUser: { uid: '123' },
      user: { role: 'USER' },
    });
    renderWithRouter(
      <ProtectedRoute requireRole={['ADMIN']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });

  it('renders children when user has required role', () => {
    (useAuth as any).mockReturnValue({
      isLoading: false,
      firebaseUser: { uid: '123' },
      user: { role: 'ADMIN' },
    });
    renderWithRouter(
      <ProtectedRoute requireRole={['ADMIN']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
