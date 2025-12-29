import { Helmet } from 'react-helmet-async';

// ============================================================================
// TYPES
// ============================================================================

interface SEOMetaProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  locale?: string;
  noindex?: boolean;
  nofollow?: boolean;
  
  // OpenGraph specific
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  
  // Twitter specific
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  
  // Article specific
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  
  // Product specific
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: 'in stock' | 'out of stock' | 'preorder';
  productBrand?: string;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULTS = {
  siteName: 'Your Store',
  locale: 'en_US',
  twitterCard: 'summary_large_image' as const,
  twitterSite: '@yourstore',
  defaultImage: '/og-default.jpg',
};

// ============================================================================
// SEO META COMPONENT
// ============================================================================

/**
 * SEOMeta Component
 *
 * Comprehensive SEO meta tags component for all pages.
 *
 * Features:
 * - Standard meta tags (title, description)
 * - OpenGraph tags for Facebook/social sharing
 * - Twitter Card tags
 * - Canonical URL handling
 * - Robots directives
 * - Article & Product specific tags
 */
const SEOMeta = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  siteName = DEFAULTS.siteName,
  locale = DEFAULTS.locale,
  noindex = false,
  nofollow = false,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterCard = DEFAULTS.twitterCard,
  twitterSite = DEFAULTS.twitterSite,
  twitterCreator,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  productPrice,
  productCurrency = 'USD',
  productAvailability,
  productBrand,
}: SEOMetaProps) => {
  const fullTitle = `${title} | ${siteName}`;
  const metaImage = image || ogImage || DEFAULTS.defaultImage;
  const metaUrl = canonical || ogUrl;

  // Build robots directive
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:alt" content={ogTitle || title} />
      {metaUrl && <meta property="og:url" content={metaUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={metaImage} />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && <meta property="article:author" content={author} />}
      {type === 'article' && section && <meta property="article:section" content={section} />}
      {type === 'article' &&
        tags?.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

      {/* Product specific */}
      {type === 'product' && productPrice && (
        <>
          <meta property="product:price:amount" content={productPrice.toString()} />
          <meta property="product:price:currency" content={productCurrency} />
        </>
      )}
      {type === 'product' && productAvailability && (
        <meta property="product:availability" content={productAvailability} />
      )}
      {type === 'product' && productBrand && (
        <meta property="product:brand" content={productBrand} />
      )}
    </Helmet>
  );
};

// ============================================================================
// PRODUCT SEO COMPONENT
// ============================================================================

interface ProductSEOProps {
  product: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency?: string;
    brand?: string;
    availability?: 'in stock' | 'out of stock' | 'preorder';
    sku?: string;
  };
  url: string;
}

/**
 * ProductSEO Component
 *
 * Specialized SEO component for product pages.
 */
export const ProductSEO = ({ product, url }: ProductSEOProps) => {
  return (
    <SEOMeta
      title={product.name}
      description={product.description}
      canonical={url}
      image={product.image}
      type="product"
      productPrice={product.price}
      productCurrency={product.currency}
      productAvailability={product.availability}
      productBrand={product.brand}
    />
  );
};

// ============================================================================
// CATEGORY SEO COMPONENT
// ============================================================================

interface CategorySEOProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  productCount?: number;
}

/**
 * CategorySEO Component
 *
 * Specialized SEO component for category/collection pages.
 */
export const CategorySEO = ({ name, description, image, url }: CategorySEOProps) => {
  return (
    <SEOMeta
      title={`${name} Collection`}
      description={description}
      canonical={url}
      image={image}
      type="website"
    />
  );
};

// ============================================================================
// HOME SEO COMPONENT
// ============================================================================

interface HomeSEOProps {
  tagline?: string;
}

/**
 * HomeSEO Component
 *
 * Specialized SEO component for the home page.
 */
export const HomeSEO = ({ tagline }: HomeSEOProps) => {
  const description =
    tagline ||
    'Discover premium products crafted with care. Shop the latest collections with free shipping on orders over $50.';

  return (
    <SEOMeta
      title="Home"
      description={description}
      type="website"
      ogTitle="Welcome to Your Store"
      ogDescription={description}
    />
  );
};

export { SEOMeta };
export default SEOMeta;
