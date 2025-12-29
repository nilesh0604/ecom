import { Button } from '@/components/ui';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - eCom</title>
      </Helmet>

      <section className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-8xl font-bold text-indigo-600 dark:text-indigo-400">404</div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default NotFound;
