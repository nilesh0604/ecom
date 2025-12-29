/**
 * UserGeneratedContent.tsx
 * 
 * DTC Feature 6.5: User-Generated Content
 * Photo/video reviews, social media integration, UGC gallery, and community features
 * 
 * Components:
 * 1. PhotoUploadReview - Review with photo/video upload
 * 2. UGCGallery - Product page UGC gallery
 * 3. CommunityGallery - Site-wide community gallery page
 * 4. SocialMediaFeed - Instagram/social hashtag feed
 * 5. UGCModerationQueue - Admin moderation interface
 * 6. UGCSubmissionPrompt - Prompt to submit UGC after purchase
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UGCMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface UGCPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isVerifiedPurchaser?: boolean;
  };
  media: UGCMedia[];
  caption?: string;
  rating?: number;
  productId?: string;
  productName?: string;
  createdAt: Date;
  likes: number;
  isLiked?: boolean;
  source?: 'review' | 'instagram' | 'tiktok' | 'submission';
  socialHandle?: string;
  socialUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface UGCReviewData {
  rating: number;
  title: string;
  review: string;
  media: File[];
  recommendProduct: boolean;
  fit?: 'runs-small' | 'true-to-size' | 'runs-large';
}

export interface ModerationAction {
  postId: string;
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const ugcReviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  review: z.string().min(20, 'Review must be at least 20 characters'),
  recommendProduct: z.boolean(),
  fit: z.enum(['runs-small', 'true-to-size', 'runs-large']).optional(),
});

type UGCReviewFormData = z.infer<typeof ugcReviewSchema>;

// ============================================================================
// Components
// ============================================================================

/**
 * PhotoUploadReview - Review form with photo/video upload
 */
export function PhotoUploadReview({
  productId: _productId,
  productName,
  onSubmit,
  isSubmitting = false,
  maxPhotos = 5,
  maxVideoSizeMB = 50,
  className = '',
}: {
  productId: string;
  productName: string;
  onSubmit?: (data: UGCReviewData) => void | Promise<void>;
  isSubmitting?: boolean;
  maxPhotos?: number;
  maxVideoSizeMB?: number;
  className?: string;
}) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UGCReviewFormData>({
    resolver: zodResolver(ugcReviewSchema),
    defaultValues: {
      rating: 0,
      recommendProduct: true,
    },
  });

  const rating = watch('rating');

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setUploadError(null);

      // Validate file count
      if (mediaFiles.length + files.length > maxPhotos) {
        setUploadError(`Maximum ${maxPhotos} files allowed`);
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of files) {
        // Check if image or video
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          setUploadError('Only images and videos are allowed');
          continue;
        }

        // Check video size
        if (file.type.startsWith('video/') && file.size > maxVideoSizeMB * 1024 * 1024) {
          setUploadError(`Videos must be under ${maxVideoSizeMB}MB`);
          continue;
        }

        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }

      setMediaFiles((prev) => [...prev, ...validFiles]);
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
    },
    [mediaFiles.length, maxPhotos, maxVideoSizeMB]
  );

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: UGCReviewFormData) => {
    onSubmit?.({
      ...data,
      media: mediaFiles,
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Write a Review
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Share your experience with {productName}
      </p>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Overall Rating *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue('rating', star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
          )}
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="Sum up your review in a few words"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Review *
          </label>
          <textarea
            {...register('review')}
            rows={5}
            placeholder="What did you like or dislike? How did the product work for you?"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          />
          {errors.review && (
            <p className="text-red-500 text-sm mt-1">{errors.review.message}</p>
          )}
        </div>

        {/* Fit (optional for apparel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How was the fit?
          </label>
          <div className="flex gap-4">
            {[
              { value: 'runs-small', label: 'Runs Small' },
              { value: 'true-to-size', label: 'True to Size' },
              { value: 'runs-large', label: 'Runs Large' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  {...register('fit')}
                  value={option.value}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photo/Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Photos or Videos (optional)
          </label>
          
          <div className="flex flex-wrap gap-3">
            {/* Previews */}
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative w-24 h-24">
                {mediaFiles[index].type.startsWith('video/') ? (
                  <video
                    src={preview}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <img
                    src={preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {mediaFiles[index].type.startsWith('video/') && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                    Video
                  </div>
                )}
              </div>
            ))}

            {/* Upload button */}
            {mediaFiles.length < maxPhotos && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs mt-1">Add</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Max {maxPhotos} files. Videos up to {maxVideoSizeMB}MB.
          </p>
        </div>

        {/* Recommend */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('recommendProduct')}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              I would recommend this product
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

/**
 * UGCGallery - Product page UGC gallery with lightbox
 */
export function UGCGallery({
  posts,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onLike,
  onShare,
  columns = 4,
  className = '',
}: {
  posts: UGCPost[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onLike?: (postId: string) => void;
  onShare?: (post: UGCPost) => void;
  columns?: 3 | 4 | 5;
  className?: string;
}) {
  const [selectedPost, setSelectedPost] = useState<UGCPost | null>(null);

  const gridCols = {
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-5xl mb-4">📸</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Be the First to Share
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No photos yet. Share your experience with this product!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Grid */}
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
            onClick={() => setSelectedPost(post)}
          >
            {post.media[0]?.type === 'video' ? (
              <video
                src={post.media[0].thumbnailUrl || post.media[0].url}
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <img
                src={post.media[0]?.url}
                alt={`Photo by ${post.author.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-4 text-white">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                  <span>{post.likes}</span>
                </div>
              </div>
            </div>

            {/* Video indicator */}
            {post.media[0]?.type === 'video' && (
              <div className="absolute top-2 right-2">
                <svg className="w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" />
                </svg>
              </div>
            )}

            {/* Multiple images indicator */}
            {post.media.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                +{post.media.length - 1}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPost && (
        <UGCLightbox
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={() => onLike?.(selectedPost.id)}
          onShare={() => onShare?.(selectedPost)}
        />
      )}
    </div>
  );
}

/**
 * UGCLightbox - Full-screen lightbox for viewing UGC
 */
function UGCLightbox({
  post,
  onClose,
  onLike,
  onShare,
}: {
  post: UGCPost;
  onClose: () => void;
  onLike?: () => void;
  onShare?: () => void;
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-black flex">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Media area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {post.media[currentMediaIndex]?.type === 'video' ? (
          <video
            src={post.media[currentMediaIndex].url}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-lg"
          />
        ) : (
          <img
            src={post.media[currentMediaIndex]?.url}
            alt=""
            className="max-h-full max-w-full object-contain rounded-lg"
          />
        )}

        {/* Navigation arrows */}
        {post.media.length > 1 && (
          <>
            <button
              onClick={() => setCurrentMediaIndex((i) => (i > 0 ? i - 1 : post.media.length - 1))}
              className="absolute left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentMediaIndex((i) => (i < post.media.length - 1 ? i + 1 : 0))}
              className="absolute right-80 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Sidebar with post info */}
      <div className="w-80 bg-white dark:bg-gray-800 flex flex-col">
        {/* Author */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
                {post.author.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {post.author.name}
              </p>
              {post.author.isVerifiedPurchaser && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Rating */}
          {post.rating && (
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= post.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}

          {/* Caption */}
          {post.caption && (
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              {post.caption}
            </p>
          )}

          {/* Product link */}
          {post.productName && (
            <a
              href={`/products/${post.productId}`}
              className="inline-block px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 mb-4"
            >
              📦 {post.productName}
            </a>
          )}

          {/* Social source */}
          {post.source && post.source !== 'review' && post.socialUrl && (
            <a
              href={post.socialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View on {post.source === 'instagram' ? 'Instagram' : 'TikTok'} →
            </a>
          )}

          {/* Date */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {post.createdAt.toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                post.isLiked
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={post.isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {post.likes}
            </button>
            
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CommunityGallery - Site-wide community gallery page component
 */
export function CommunityGallery({
  posts,
  hashtag = '#YourBrand',
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onSubmit,
  className = '',
}: {
  posts: UGCPost[];
  hashtag?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onSubmit?: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Community Gallery
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          See how our community styles their favorites
        </p>
        <div className="flex items-center justify-center gap-4">
          <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full">
            {hashtag}
          </span>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="px-6 py-2 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold rounded-full hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors"
            >
              Submit Your Photo
            </button>
          )}
        </div>
      </div>

      {/* Gallery */}
      <UGCGallery
        posts={posts}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        columns={5}
      />
    </div>
  );
}

/**
 * SocialMediaFeed - Instagram/TikTok feed integration display
 */
export function SocialMediaFeed({
  posts,
  platform = 'instagram',
  hashtag,
  username,
  onViewMore,
  className = '',
}: {
  posts: UGCPost[];
  platform?: 'instagram' | 'tiktok';
  hashtag?: string;
  username?: string;
  onViewMore?: () => void;
  className?: string;
}) {
  const platformInfo = {
    instagram: {
      icon: '📷',
      color: 'from-purple-500 via-pink-500 to-orange-500',
      name: 'Instagram',
    },
    tiktok: {
      icon: '🎵',
      color: 'from-black to-pink-500',
      name: 'TikTok',
    },
  };

  const info = platformInfo[platform];

  return (
    <section className={`py-12 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${info.color} flex items-center justify-center text-xl`}>
            {info.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {username ? `@${username}` : hashtag}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              on {info.name}
            </p>
          </div>
        </div>

        {onViewMore && (
          <a
            href={`https://${platform}.com/${username || `explore/tags/${hashtag?.replace('#', '')}`}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
          >
            View on {info.name}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {posts.slice(0, 12).map((post) => (
          <a
            key={post.id}
            href={post.socialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square relative group overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
          >
            <img
              src={post.media[0]?.thumbnailUrl || post.media[0]?.url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-2xl">{info.icon}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/**
 * UGCModerationQueue - Admin moderation interface
 */
export function UGCModerationQueue({
  posts,
  onModerate,
  isLoading = false,
  className = '',
}: {
  posts: UGCPost[];
  onModerate?: (action: ModerationAction) => void;
  isLoading?: boolean;
  className?: string;
}) {
  // Reserved for rejection reason selection (future enhancement)
  const selectedReason = '';
  void selectedReason; // Prevent unused variable warning

  const pendingPosts = posts.filter((p) => p.status === 'pending');

  if (pendingPosts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          All Caught Up!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No pending content to review.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Moderation Queue
        </h2>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-medium rounded-full">
          {pendingPosts.length} pending
        </span>
      </div>

      {pendingPosts.map((post) => (
        <div
          key={post.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            {/* Media preview */}
            <div className="md:w-64 flex-shrink-0">
              <div className="aspect-square">
                {post.media[0]?.type === 'video' ? (
                  <video
                    src={post.media[0].url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={post.media[0]?.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              {/* Author info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.createdAt.toLocaleString()}
                  </p>
                </div>
                {post.author.isVerifiedPurchaser && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-medium rounded">
                    Verified Purchaser
                  </span>
                )}
              </div>

              {/* Rating */}
              {post.rating && (
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= post.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}

              {/* Caption/review */}
              {post.caption && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {post.caption}
                </p>
              )}

              {/* Product */}
              {post.productName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Product: <span className="font-medium">{post.productName}</span>
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    onModerate?.({ postId: post.id, action: 'approve' })
                  }
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() =>
                    onModerate?.({
                      postId: post.id,
                      action: 'reject',
                      reason: selectedReason || 'Content does not meet guidelines',
                    })
                  }
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  ✕ Reject
                </button>
                <button
                  onClick={() =>
                    onModerate?.({
                      postId: post.id,
                      action: 'flag',
                      reason: 'Needs review',
                    })
                  }
                  disabled={isLoading}
                  className="px-4 py-2 border border-yellow-500 text-yellow-600 dark:text-yellow-400 font-medium rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 disabled:opacity-50"
                >
                  ⚑ Flag for Review
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * UGCSubmissionPrompt - Prompt to submit UGC after purchase
 */
export function UGCSubmissionPrompt({
  productName,
  productImage,
  orderId: _orderId,
  hashtag = '#YourBrand',
  onWriteReview,
  onSharePhoto,
  onDismiss,
  className = '',
}: {
  productName: string;
  productImage: string;
  orderId: string;
  hashtag?: string;
  onWriteReview?: () => void;
  onSharePhoto?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <img
          src={productImage}
          alt={productName}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
        />

        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Loving your {productName}?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Share your experience and get featured in our community gallery!
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onWriteReview}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Write a Review
            </button>
            <button
              onClick={onSharePhoto}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Share a Photo
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Or tag us on social with{' '}
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {hashtag}
            </span>
          </p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default {
  PhotoUploadReview,
  UGCGallery,
  CommunityGallery,
  SocialMediaFeed,
  UGCModerationQueue,
  UGCSubmissionPrompt,
};
