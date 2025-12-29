import { Breadcrumbs } from '@/components/layout';
import {
    AddToCartButton,
    NotifyMe,
    ProductGallery,
    ProductInfo,
    QuantitySelector,
    ReviewsList,
} from '@/components/product';
import { Button, PriceDisplay, Spinner } from '@/components/ui';
import { useFetch, useToast } from '@/hooks';
import { productService } from '@/services/productService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectItemQuantity } from '@/store/selectors';
import { addCartItem } from '@/store/slices/cartSlice';
import type { CartItem, Product } from '@/types';
import { calculateDiscountedPrice } from '@/utils/formatCurrency';
import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

/**
 * ProductDetail Page - Full product details with add to cart functionality
 * 
 * Features:
 * - Product gallery with image zoom
 * - Full product information
 * - Quantity selection
 * - Add to cart with Redux integration
 * - Customer reviews
 * - Loading and error states
 */

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch product data
  const { data: product, isLoading, error } = useFetch<Product>(
    (signal) => productService.getById(Number(id), signal),
    { deps: [id], enabled: !!id }
  );

  // Check if product is already in cart and get quantity
  const cartQuantity = useAppSelector(selectItemQuantity(Number(id)));
  const isInCart = cartQuantity > 0;

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    setIsAdding(true);

    // Create cart item from product
    const cartItem: CartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: quantity,
      total: product.price * quantity,
      discountPercentage: product.discountPercentage,
      discountedTotal: calculateDiscountedPrice(product.price, product.discountPercentage) * quantity,
      thumbnail: product.thumbnail,
    };

    // Dispatch to Redux
    dispatch(addCartItem(cartItem));

    // Show success toast
    toast.success(`${product.title} added to cart!`);

    // Reset quantity after adding
    setQuantity(1);

    // Simulate brief loading for UX feedback
    setTimeout(() => setIsAdding(false), 300);
  }, [product, quantity, dispatch, toast]);

  // Loading State
  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading Product - eCom</title>
        </Helmet>
        <section className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product details...</p>
          </div>
        </section>
      </>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <>
        <Helmet>
          <title>Product Not Found - eCom</title>
        </Helmet>
        <section className="text-center py-16">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Product Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error?.message || "We couldn't find the product you're looking for."}
          </p>
          <div className="mt-6">
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </section>
      </>
    );
  }

  const isOutOfStock = product.stock === 0;
  const maxQuantity = Math.min(product.stock, 99);

  return (
    <>
      <Helmet>
        <title>{product.title} - eCom</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <section>
        {/* Breadcrumb */}
        <Breadcrumbs productName={product.title} className="mb-6" />

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <ProductGallery images={product.images} productTitle={product.title} />

          {/* Right: Product Details */}
          <div className="space-y-6">
            <ProductInfo
              title={product.title}
              description={product.description}
              brand={product.brand}
              category={product.category}
              stock={product.stock}
              sku={`SKU-${product.id}`}
              rating={product.rating}
              reviewCount={product.reviews?.length || 0}
            />

            {/* Price Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <PriceDisplay
                price={product.price}
                discountPercentage={product.discountPercentage}
                showDiscount
                size="lg"
              />
            </div>

            {/* Quantity and Add to Cart */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantity:
                  </label>
                  <QuantitySelector
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    max={maxQuantity}
                    size="md"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {product.stock} available
                  </span>
                </div>

                <AddToCartButton
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                  isInCart={isInCart}
                  cartQuantity={cartQuantity}
                />

                {isInCart && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    You have {cartQuantity} of this item in your cart.{' '}
                    <Link
                      to="/cart"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Cart
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* Out of Stock - Notify Me */}
            {isOutOfStock && (
              <NotifyMe
                productId={product.id}
                productTitle={product.title}
              />
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsList reviews={product.reviews || []} />
      </section>
    </>
  );
};

export default ProductDetail;
