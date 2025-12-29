import { BrandStory, FeaturedCollections, HeroSection } from '@/components/home';
import { Button } from '@/components/ui';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>eCom - Crafted for Excellence</title>
        <meta
          name="description"
          content="Discover our curated collection of premium products designed with precision and care. Shop electronics, fashion, home goods and more."
        />
      </Helmet>

      {/* Full-Width Hero Section */}
      <HeroSection />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Brand Story Section */}
      <BrandStory />

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Why Shop With Us
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              The eCom difference in every order
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Quality Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every product is carefully inspected and backed by our 100% satisfaction guarantee.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Free Shipping</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enjoy free shipping on all orders over $50. Fast and reliable delivery worldwide.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">Easy Returns</h3>
              <p className="text-gray-600 dark:text-gray-400">
                30-day hassle-free returns. If you're not satisfied, we'll make it right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-indigo-600 py-16 dark:bg-indigo-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Stay in the Loop</h2>
            <p className="mt-4 text-lg text-indigo-100">
              Subscribe to our newsletter for exclusive offers and early access to new arrivals.
            </p>
            <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border-0 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-sm text-indigo-200">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Ready to Discover Something New?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Browse our complete collection and find your next favorite product.
          </p>
          <div className="mt-10">
            <Link to="/products">
              <Button size="lg" className="px-12">
                Shop All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
