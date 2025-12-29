import ErrorBoundary from '@/components/ErrorBoundary';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <ErrorBoundary>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '2rem',
            borderRadius: '0.75rem',
            background: '#fff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          }}
        >
          <Outlet />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AuthLayout;
