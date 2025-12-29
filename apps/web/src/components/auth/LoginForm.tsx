import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button, Input } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAuthError, setAuthPending, setAuthSuccess } from '@/store/slices/authSlice';
import { authClient } from '@/utils/apiClient';

import { loginSchema, type LoginFormData } from './authSchemas';

/**
 * LoginForm Component
 *
 * Handles user authentication with:
 * - Zod schema validation
 * - React Hook Form for efficient form state
 * - Redux integration for auth state
 * - Redirect to intended page after login
 *
 * Security considerations:
 * - Uses DummyJSON auth API for demo (mocked)
 * - In production, use HttpOnly cookies for tokens
 * - Never store sensitive tokens in localStorage in production
 */

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Get redirect destination from location state or default to home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Auto-focus email field on mount
  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    dispatch(setAuthPending());

    try {
      // Using local API for authentication
      // The apiClient unwraps the response, so we get the data object directly
      interface LoginResponseData {
        user: {
          id: number;
          email: string;
          firstName: string;
          lastName: string;
          phone?: string | null;
          gender?: string | null;
          image?: string | null;
          role: string;
        };
        token: string;
        expiresAt: string;
      }
      
      const responseData = await authClient.post<LoginResponseData>('/auth/login', {
        email: data.email,
        password: data.password,
      }, { skipAuthToken: true });
      
      dispatch(
        setAuthSuccess({
          user: {
            id: String(responseData.user.id),
            email: responseData.user.email,
            firstName: responseData.user.firstName,
            lastName: responseData.user.lastName,
            gender: responseData.user.gender || '',
            image: responseData.user.image || '',
            phone: responseData.user.phone || '',
            age: 0,
            role: responseData.user.role.toLowerCase() as 'user' | 'admin',
          },
          token: responseData.token,
          refreshToken: '', // Refresh token is handled via HTTP-only cookie
        })
      );

      navigate(from, { replace: true });
    } catch (err) {
      // Handle API error format
      const errorMessage = (err as { message?: string })?.message || 'Login failed';
      dispatch(setAuthError(errorMessage));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Error Alert */}
      {error && (
        <div
          className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Email Field */}
      <Input
        {...register('email')}
        label="Email"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        autoComplete="email"
        required
        data-testid="email-input"
        leftIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />

      {/* Password Field */}
      <Input
        {...register('password')}
        label="Password"
        type="password"
        placeholder="Enter your password"
        error={errors.password?.message}
        autoComplete="current-password"
        required
        data-testid="password-input"
        leftIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        }
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Remember me
          </span>
        </label>

        <Link
          to="/auth/forgot-password"
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          data-testid="forgot-password-link"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        isLoading={loading}
        disabled={loading}
        data-testid="login-button"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      {/* Demo Credentials Hint */}
      <div className="p-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
        <p className="font-medium mb-1">Demo Credentials:</p>
        <p>
          Email: <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">user@ecommerce.com</code>
        </p>
        <p>
          Password: <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">UserPass123!</code>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
