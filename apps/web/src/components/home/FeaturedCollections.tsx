import { Link } from 'react-router-dom';

/**
 * FeaturedCollections Component
 *
 * Displays curated product collections in an editorial grid layout.
 *
 * Features:
 * - Editorial-style collection cards
 * - Hover animations
 * - Featured product spotlights
 * - Responsive grid layout
 */

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  featured?: boolean;
}

const COLLECTIONS: Collection[] = [
  {
    id: 'electronics',
    title: 'Electronics',
    description: 'Cutting-edge technology for modern living',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80',
    link: '/products?category=electronics',
    featured: true,
  },
  {
    id: 'fashion',
    title: 'Fashion',
    description: 'Timeless style, contemporary design',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    link: '/products?category=fashion',
  },
  {
    id: 'home',
    title: 'Home & Living',
    description: 'Transform your space',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80',
    link: '/products?category=home',
  },
  {
    id: 'beauty',
    title: 'Beauty',
    description: 'Premium skincare & cosmetics',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    link: '/products?category=beauty',
  },
];

const FeaturedCollections = () => {
  const featuredCollection = COLLECTIONS.find((c) => c.featured);
  const otherCollections = COLLECTIONS.filter((c) => !c.featured);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Shop by Collection
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Curated categories designed for your lifestyle
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured Large Card */}
          {featuredCollection && (
            <Link
              to={featuredCollection.link}
              className="group relative col-span-full overflow-hidden rounded-2xl lg:col-span-2 lg:row-span-2"
            >
              <div className="aspect-[16/9] lg:aspect-[4/3]">
                <img
                  src={featuredCollection.image}
                  alt={featuredCollection.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="mb-2 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  Featured
                </span>
                <h3 className="text-3xl font-bold text-white md:text-4xl">
                  {featuredCollection.title}
                </h3>
                <p className="mt-2 text-lg text-gray-200">
                  {featuredCollection.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white transition-transform group-hover:translate-x-2">
                  Shop Now
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          )}

          {/* Other Collections */}
          {otherCollections.map((collection) => (
            <Link
              key={collection.id}
              to={collection.link}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="aspect-[4/3]">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white">{collection.title}</h3>
                <p className="mt-1 text-sm text-gray-200">{collection.description}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white transition-transform group-hover:translate-x-2">
                  Explore
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
