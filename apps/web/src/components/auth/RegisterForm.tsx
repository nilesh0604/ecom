import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Button, Input } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAuthError, setAuthPending, setAuthSuccess } from '@/store/slices/authSlice';

import { registerSchema, type RegisterFormData } from './authSchemas';

/**
 * RegisterForm Component
 *
 * Handles new user registration with:
 * - Comprehensive Zod schema validation
 * - Password strength requirements
 * - Confirm password matching
 * - Terms acceptance checkbox
 *
 * Note: DummyJSON doesn't have a real register endpoint,
 * so we simulate registration and auto-login the user.
 */

const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    control,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Watch password for strength indicator using useWatch for better memoization
  const password = useWatch({ control, name: 'password', defaultValue: '' });

  // Auto-focus first field on mount
  useEffect(() => {
    setFocus('firstName');
  }, [setFocus]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(setAuthPending());

    try {
      // Note: DummyJSON doesn't have a real register endpoint
      // In a real app, you would call your registration API
      // For demo purposes, we simulate a successful registration
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate unique values inside the async handler (not during render)
      const timestamp = new Date().getTime();
      const uniqueId = Math.floor(timestamp % 10000);

      // Create a mock user (in real app, server would return this)
      const mockUser = {
        id: uniqueId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: '',
        image: 'https://dummyjson.com/icon/emilys/128',
        phone: '',
        age: 0,
        role: 'user' as const,
      };

      dispatch(
        setAuthSuccess({
          user: mockUser,
          token: `mock-token-${timestamp}`,
          refreshToken: `mock-refresh-${timestamp}`,
        })
      );

      navigate('/', { replace: true });
    } catch (err) {
      dispatch(setAuthError(err instanceof Error ? err.message : 'Registration failed'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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

      {/* Name Fields - Two columns */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          label="First Name"
          type="text"
          placeholder="John"
          error={errors.firstName?.message}
          autoComplete="given-name"
          required
          data-testid="first-name-input"
        />
        <Input
          {...register('lastName')}
          label="Last Name"
          type="text"
          placeholder="Doe"
          error={errors.lastName?.message}
          autoComplete="family-name"
          required
          data-testid="last-name-input"
        />
      </div>

      {/* Email Field */}
      <Input
        {...register('email')}
        label="Email"
        type="email"
        placeholder="john@example.com"
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
      <div>
        <Input
          {...register('password')}
          label="Password"
          type="password"
          placeholder="Create a strong password"
          error={errors.password?.message}
          autoComplete="new-password"
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
        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${
                passwordStrength.label === 'Weak' ? 'text-red-500' :
                passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                'text-green-500'
              }`}>
                {passwordStrength.label}
              </span>
            </div>
            <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
              <li className={password.length >= 8 ? 'text-green-500' : ''}>
                {password.length >= 8 ? '✓' : '○'} At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
                {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
              </li>
              <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>
                {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>
                {/[0-9]/.test(password) ? '✓' : '○'} One number
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <Input
        {...register('confirmPassword')}
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
        required
        data-testid="confirm-password-input"
        leftIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        }
      />

      {/* Terms Checkbox */}
      <div>
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            {...register('acceptTerms')}
            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
            data-testid="accept-terms-checkbox"
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            I agree to the{' '}
            <Link
              to="/terms"
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              target="_blank"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-1 text-sm text-red-500">{errors.acceptTerms.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        loading={loading}
        disabled={loading}
        data-testid="register-button"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
};

export default RegisterForm;
