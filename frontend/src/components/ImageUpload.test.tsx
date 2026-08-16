import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImageUpload from './ImageUpload';

describe('ImageUpload Component', () => {
  it('renders the upload placeholder when no images are provided', () => {
    render(<ImageUpload onUpload={vi.fn()} />);
    
    expect(screen.getByText(/Click to upload images/i)).toBeInTheDocument();
    expect(screen.getByText(/PNG, JPG up to 5MB/i)).toBeInTheDocument();
  });

  it('renders existing images if provided', () => {
    const mockImages = ['http://example.com/image1.jpg'];
    render(<ImageUpload onUpload={vi.fn()} currentImages={mockImages} />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('src', 'http://example.com/image1.jpg');
  });
});
