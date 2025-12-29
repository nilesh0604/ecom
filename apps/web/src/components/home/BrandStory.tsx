import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

/**
 * BrandStory Component
 *
 * Showcases brand values and story on the homepage.
 *
 * Features:
 * - Brand mission statement
 * - Values highlight
 * - Visual storytelling
 * - CTA to About page
 */

const VALUES = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Quality First',
    description: 'Every product meets our rigorous quality standards before reaching you.',
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Sustainability',
    description: 'Committed to responsible sourcing and eco-friendly packaging.',
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    title: 'Customer Joy',
    description: 'Your satisfaction is our measure of success. Always.',
  },
];

const BrandStory = () => {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
                alt="Our workshop"
                className="h-full w-full object-cover"
              />
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -right-6 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800 md:-bottom-8 md:-right-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">10K+</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Happy Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">4.9</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Our Story
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Crafting Excellence Since Day One
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              We started with a simple belief: everyone deserves access to quality products that 
              enhance their daily lives. Today, we continue that mission by curating the finest 
              products from around the world and delivering them straight to your door.
            </p>

            {/* Values Grid */}
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {VALUES.map((value, index) => (
                <div key={index} className="text-center sm:text-left">
                  <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 sm:mx-0">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{value.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10">
              <Link to="/about">
                <Button variant="secondary" className="inline-flex items-center gap-2">
                  Read Our Full Story
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
