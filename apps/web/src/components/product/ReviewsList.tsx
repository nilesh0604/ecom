import type { Review } from '@/types';

/**
 * ReviewsList - Displays customer reviews with ratings
 * 
 * Features:
 * - Star rating display
 * - Reviewer name and date
 * - Empty state when no reviews
 * - Accessible markup
 */

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList = ({ reviews }: ReviewsListProps) => {
  if (!reviews || reviews.length === 0) {
    return (
      <section id="reviews-section" className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Customer Reviews
        </h2>
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      </section>
    );
  }

  // Calculate average rating (convert string ratings to numbers)
  const averageRating = reviews.reduce((sum, r) => {
    const rating = typeof r.rating === 'string' ? parseFloat(r.rating) : r.rating;
    return sum + rating;
  }, 0) / reviews.length;

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section id="reviews-section" className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Customer Reviews
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center" aria-label={`Average rating: ${averageRating.toFixed(1)} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => {
          const reviewRating = typeof review.rating === 'string' ? parseFloat(review.rating) : review.rating;
          return (
          <article
            key={review.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                {/* Reviewer Name */}
                <p className="font-medium text-gray-900 dark:text-white">
                  {review.reviewerName}
                </p>
                {/* Date */}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(review.date)}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center" aria-label={`Rating: ${reviewRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= reviewRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Comment */}
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
              {review.comment}
            </p>
          </article>
        );
        })}
      </div>
    </section>
  );
};

export default ReviewsList;
