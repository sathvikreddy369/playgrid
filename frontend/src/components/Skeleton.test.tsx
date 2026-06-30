import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton, PostSkeleton } from './Skeleton';
import { describe, it, expect } from 'vitest';

describe('Skeleton Components', () => {
  it('renders a base Skeleton with correct classes', () => {
    const { container } = render(<Skeleton className="w-10 h-10" />);
    const skeletonElement = container.firstChild as HTMLElement;
    expect(skeletonElement).toHaveClass('animate-pulse');
    expect(skeletonElement).toHaveClass('bg-border');
    expect(skeletonElement).toHaveClass('rounded-md');
    expect(skeletonElement).toHaveClass('w-10 h-10');
  });

  it('renders a PostSkeleton structure', () => {
    const { container } = render(<PostSkeleton />);
    const post = container.firstChild as HTMLElement;
    expect(post).toHaveClass('card');
    expect(post).toHaveClass('p-5');
    // Ensure the avatar skeleton is rendered
    expect(post.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
