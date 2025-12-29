import { Helmet } from 'react-helmet-async';

// ============================================================================
// TYPES
// ============================================================================

interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    description: string;
    image: string | string[];
    price: number;
    currency?: string;
    sku?: string;
    brand?: string;
    category?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued';
    rating?: {
      value: number;
      count: number;
    };
    offers?: {
      price: number;
      priceCurrency: string;
      priceValidUntil?: string;
      availability: string;
      url: string;
    }[];
  };
  url: string;
}

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs?: string[];
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  publisherName: string;
  publisherLogo: string;
  url: string;
}

// ============================================================================
// PRODUCT SCHEMA
// ============================================================================

/**
 * ProductSchema Component
 *
 * Generates JSON-LD structured data for products.
 * Helps search engines understand product information for rich results.
 */
export const ProductSchema = ({ product, url }: ProductSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: Array.isArray(product.image) ? product.image : [product.image],
    sku: product.sku || product.id,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : undefined,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      url: url,
      seller: {
        '@type': 'Organization',
        name: 'Your Store',
      },
    },
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating.value,
          reviewCount: product.rating.count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(cleanSchema)}</script>
    </Helmet>
  );
};

// ============================================================================
// ORGANIZATION SCHEMA
// ============================================================================

/**
 * OrganizationSchema Component
 *
 * Generates JSON-LD structured data for the organization/business.
 * Helps establish brand identity in search results.
 */
export const OrganizationSchema = ({
  name,
  url,
  logo,
  description,
  email,
  phone,
  address,
  sameAs,
}: OrganizationSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    email,
    telephone: phone,
    address: address
      ? {
          '@type': 'PostalAddress',
          streetAddress: address.streetAddress,
          addressLocality: address.addressLocality,
          addressRegion: address.addressRegion,
          postalCode: address.postalCode,
          addressCountry: address.addressCountry,
        }
      : undefined,
    sameAs,
  };

  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(cleanSchema)}</script>
    </Helmet>
  );
};

// ============================================================================
// BREADCRUMB SCHEMA
// ============================================================================

/**
 * BreadcrumbSchema Component
 *
 * Generates JSON-LD structured data for breadcrumb navigation.
 * Helps search engines understand site hierarchy.
 */
export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// ============================================================================
// ARTICLE SCHEMA
// ============================================================================

/**
 * ArticleSchema Component
 *
 * Generates JSON-LD structured data for articles/blog posts.
 */
export const ArticleSchema = ({
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  publisherName,
  publisherLogo,
  url,
}: ArticleSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: [image],
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// ============================================================================
// FAQ SCHEMA
// ============================================================================

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * FAQSchema Component
 *
 * Generates JSON-LD structured data for FAQ sections.
 */
export const FAQSchema = ({ faqs }: FAQSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// ============================================================================
// LOCAL BUSINESS SCHEMA
// ============================================================================

interface LocalBusinessSchemaProps {
  name: string;
  image: string;
  url: string;
  phone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
}

/**
 * LocalBusinessSchema Component
 *
 * Generates JSON-LD structured data for local businesses.
 */
export const LocalBusinessSchema = ({
  name,
  image,
  url,
  phone,
  address,
  geo,
  openingHours,
  priceRange,
}: LocalBusinessSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    image,
    url,
    telephone: phone,
    priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    },
    geo: geo
      ? {
          '@type': 'GeoCoordinates',
          latitude: geo.latitude,
          longitude: geo.longitude,
        }
      : undefined,
    openingHoursSpecification: openingHours,
  };

  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(cleanSchema)}</script>
    </Helmet>
  );
};

export default {
  ProductSchema,
  OrganizationSchema,
  BreadcrumbSchema,
  ArticleSchema,
  FAQSchema,
  LocalBusinessSchema,
};
