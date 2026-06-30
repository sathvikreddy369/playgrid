import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { CreatePostForm } from './CreatePostForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCreatePost } from '../hooks/usePosts';

// Mock the hook
vi.mock('../hooks/usePosts', () => ({
  useCreatePost: vi.fn(),
}));

describe('CreatePostForm', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCreatePost as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders the text area correctly', () => {
    render(<CreatePostForm />);
    expect(screen.getByPlaceholderText("What's happening in your sports world?")).toBeInTheDocument();
  });

  it('disables the submit button when content is empty', () => {
    render(<CreatePostForm />);
    const button = screen.getByRole('button', { name: /post/i });
    expect(button).toBeDisabled();
  });

  it('enables the submit button when content is provided', () => {
    render(<CreatePostForm />);
    const textarea = screen.getByPlaceholderText("What's happening in your sports world?");
    const button = screen.getByRole('button', { name: /post/i });
    
    fireEvent.change(textarea, { target: { value: 'Test post content' } });
    expect(button).not.toBeDisabled();
  });

  it('calls mutate with correct data on submit', async () => {
    render(<CreatePostForm />);
    
    // Type content
    const textarea = screen.getByPlaceholderText("What's happening in your sports world?");
    fireEvent.change(textarea, { target: { value: 'Test post content' } });

    // Focus to expand and show tags/location
    fireEvent.focus(textarea);
    
    // Select type
    const typeSelects = screen.getAllByRole('combobox');
    const postTypeSelect = typeSelects[1]; // The second select is for post type
    fireEvent.change(postTypeSelect, { target: { value: 'LOOKING_FOR_PLAYERS' } });

    // Submit
    const button = screen.getByRole('button', { name: /post/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test post content',
          type: 'LOOKING_FOR_PLAYERS',
        }),
        expect.any(Object)
      );
    });
  });

  it('shows loading state on submit button when isPending is true', () => {
    (useCreatePost as any).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });
    
    render(<CreatePostForm />);
    
    const textarea = screen.getByPlaceholderText("What's happening in your sports world?");
    fireEvent.change(textarea, { target: { value: 'Test' } });
    
    const button = screen.getByRole('button', { name: /posting/i });
    expect(button).toBeDisabled();
    expect(button).toBeInTheDocument();
  });
});
