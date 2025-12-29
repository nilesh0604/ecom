import PageLoader from '@/components/PageLoader';
import { ProtectedRoute } from '@/components/auth';
import { AuthLayout, MainLayout } from '@/layouts';
import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const HomePage = lazy(() => import('@/pages/Home'));
const AboutPage = lazy(() => import('@/pages/About'));
const ProductsPage = lazy(() => import('@/pages/Products'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetail'));
const CartPage = lazy(() => import('@/pages/Cart'));
const CheckoutPage = lazy(() => import('@/pages/Checkout'));
const LoginPage = lazy(() => import('@/pages/Login'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const OrdersPage = lazy(() => import('@/pages/Orders'));
const OrderTrackingPage = lazy(() => import('@/pages/OrderTracking'));
const ReturnsPortalPage = lazy(() => import('@/pages/ReturnsPortal'));
const GiftCardsPage = lazy(() => import('@/pages/GiftCards'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

const withFallback = (node: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>
    {node}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: withFallback(<HomePage />) },
      { path: 'about', element: withFallback(<AboutPage />) },
      { path: 'products', element: withFallback(<ProductsPage />) },
      { path: 'products/:id', element: withFallback(<ProductDetailPage />) },
      { path: 'cart', element: withFallback(<CartPage />) },
      { 
        path: 'checkout', 
        element: withFallback(
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'orders', 
        element: withFallback(
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'orders/:orderId', 
        element: withFallback(
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'returns/:orderId', 
        element: withFallback(
          <ProtectedRoute>
            <ReturnsPortalPage />
          </ProtectedRoute>
        ) 
      },
      { path: 'gift-cards', element: withFallback(<GiftCardsPage />) },
      { 
        path: 'profile', 
        element: withFallback(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ) 
      },
      { path: '*', element: withFallback(<NotFoundPage />) },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { 
        path: 'login', 
        element: withFallback(
          <ProtectedRoute guestOnly>
            <LoginPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'register', 
        element: withFallback(
          <ProtectedRoute guestOnly>
            <RegisterPage />
          </ProtectedRoute>
        ) 
      },
    ],
  },
  { path: '*', element: withFallback(<NotFoundPage />) },
]);
