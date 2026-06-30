import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import { BrowserRouter } from 'react-router-dom';

const ThrowError = () => {
  throw new Error('Test Error');
};

describe('ErrorBoundary', () => {
  const originalError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn(); // Suppress the actual error logging during tests
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('catches error and renders fallback UI', () => {
    render(
      <BrowserRouter>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('provides a button to reload the page', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <BrowserRouter>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(reloadMock).toHaveBeenCalled();
  });
});
