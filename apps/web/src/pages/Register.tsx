import { RegisterForm, SocialAuthButtons } from '@/components/auth';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

/**
 * Register Page
 *
 * User registration page with form validation.
 * Uses AuthLayout for centered card display.
 */
const Register = () => {
  return (
    <>
      <Helmet>
        <title>Create Account - eCom</title>
      </Helmet>

      <section>
        <div className="text-center mb-6">
          <Link
            to="/"
            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
          >
            eCom
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join us today and start shopping
          </p>
        </div>

        {/* Social Authentication */}
        <SocialAuthButtons 
          mode="register"
          onSuccess={(provider, data) => {
            console.log('Social signup success:', provider, data);
            // In production: dispatch auth action with social data
          }}
          onError={(provider, error) => {
            console.error('Social signup error:', provider, error);
          }}
        />

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            data-testid="login-link"
          >
            Sign in
          </Link>
        </p>
      </section>
    </>
  );
};

export default Register;
