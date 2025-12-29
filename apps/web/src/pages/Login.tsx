import { LoginForm, SocialAuthButtons } from '@/components/auth';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <>
      <Helmet>
        <title>Login - eCom</title>
      </Helmet>

      <section>
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
          >
            eCom
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Social Authentication */}
        <SocialAuthButtons 
          mode="login"
          onSuccess={(provider, data) => {
            console.log('Social login success:', provider, data);
            // In production: dispatch auth action with social data
          }}
          onError={(provider, error) => {
            console.error('Social login error:', provider, error);
          }}
        />

        <LoginForm />

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            data-testid="register-link"
          >
            Sign up
          </Link>
        </p>
      </section>
    </>
  );
};

export default Login;
