import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { store } from '@/store';
import { logout, setAuthSuccess } from '@/store/slices/authSlice';

import ProtectedRoute from './ProtectedRoute';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  gender: 'male',
  image: 'https://example.com/avatar.jpg',
  phone: '+1234567890',
  age: 30,
  role: 'user' as const,
};

const renderWithProviders = (
  ui: React.ReactElement,
  { initialEntries = ['/'] } = {}
) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset auth state before each test
    store.dispatch(logout());
  });

  it('should redirect unauthenticated users to login', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth/login" element={<div>Login Page</div>} />
      </Routes>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should render children for authenticated users', () => {
    // Authenticate user
    store.dispatch(
      setAuthSuccess({
        user: mockUser,
        token: 'test-token',
      })
    );

    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to custom path when specified', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute redirectTo="/custom-login">
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/custom-login" element={<div>Custom Login</div>} />
      </Routes>
    );

    expect(screen.getByText('Custom Login')).toBeInTheDocument();
  });

  describe('guestOnly mode', () => {
    it('should render children for unauthenticated users', () => {
      renderWithProviders(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute guestOnly>
                <div>Guest Only Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      );

      expect(screen.getByText('Guest Only Content')).toBeInTheDocument();
    });

    it('should redirect authenticated users away from guest-only routes', () => {
      // Authenticate user
      store.dispatch(
        setAuthSuccess({
          user: mockUser,
          token: 'test-token',
        })
      );

      renderWithProviders(
        <Routes>
          <Route
            path="/auth/login"
            element={
              <ProtectedRoute guestOnly>
                <div>Login Form</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>,
        { initialEntries: ['/auth/login'] }
      );

      expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should redirect to custom path when authenticated in guestOnly mode', () => {
      // Authenticate user
      store.dispatch(
        setAuthSuccess({
          user: mockUser,
          token: 'test-token',
        })
      );

      renderWithProviders(
        <Routes>
          <Route
            path="/auth/login"
            element={
              <ProtectedRoute guestOnly authenticatedRedirect="/dashboard">
                <div>Login Form</div>
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>,
        { initialEntries: ['/auth/login'] }
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
