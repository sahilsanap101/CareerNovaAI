import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock stores
vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    accessToken: null,
  })),
}));

vi.mock('@/store/ui.store', () => ({
  useUiStore: vi.fn(() => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
    showInfo: vi.fn(),
    removeToast: vi.fn(),
  })),
}));

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', async () => {
    const { ProtectedRoute } = await import('@/router/ProtectedRoute');
    const { Loader } = await import('@/components/ui/Loader');

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    // Should not render protected content
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });
});

describe('Button Component', () => {
  it('renders with correct text', async () => {
    const { Button } = await import('@/components/ui/Button');
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('shows spinner when loading', async () => {
    const { Button } = await import('@/components/ui/Button');
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('is disabled when loading', async () => {
    const { Button } = await import('@/components/ui/Button');
    render(<Button isLoading>Submit</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveProperty('disabled', true);
  });
});
