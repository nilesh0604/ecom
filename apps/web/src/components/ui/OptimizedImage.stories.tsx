import type { Meta, StoryObj } from '@storybook/react';
import { OptimizedImage, ResponsivePicture } from './OptimizedImage';

/**
 * OptimizedImage Component Stories
 * 
 * Demonstrates lazy loading images with srcset,
 * blur placeholders, and responsive images.
 */
const meta: Meta<typeof OptimizedImage> = {
  title: 'UI/OptimizedImage',
  component: OptimizedImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Lazy loading image with blur placeholder and responsive srcset support.',
      },
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL',
    },
    alt: {
      control: 'text',
      description: 'Alt text for accessibility',
    },
    width: {
      control: 'number',
    },
    height: {
      control: 'number',
    },
    eager: {
      control: 'boolean',
      description: 'Load immediately without lazy loading',
    },
    placeholder: {
      control: 'select',
      options: ['blur', 'skeleton', 'none'],
    },
    threshold: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: 'Intersection Observer threshold',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OptimizedImage>;

// Sample image URLs (using picsum for demo)
const sampleImage = 'https://picsum.photos/800/600';
const sampleImage2 = 'https://picsum.photos/600/400';

/**
 * Default lazy loading image
 */
export const Default: Story = {
  args: {
    src: sampleImage,
    alt: 'Sample image',
    width: 400,
    height: 300,
    className: 'rounded-lg',
  },
};

/**
 * Image with blur placeholder
 */
export const BlurPlaceholder: Story = {
  args: {
    src: sampleImage,
    alt: 'Image with blur placeholder',
    width: 400,
    height: 300,
    placeholder: 'blur',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshGxsdIR0hHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=',
    className: 'rounded-lg',
  },
};

/**
 * Skeleton placeholder
 */
export const SkeletonPlaceholder: Story = {
  args: {
    src: sampleImage2,
    alt: 'Image with skeleton placeholder',
    width: 400,
    height: 300,
    placeholder: 'skeleton',
    className: 'rounded-lg',
  },
};

/**
 * Eager loading (no lazy load)
 */
export const EagerLoading: Story = {
  args: {
    src: sampleImage,
    alt: 'Eagerly loaded image',
    width: 400,
    height: 300,
    eager: true,
    className: 'rounded-lg',
  },
};

/**
 * With srcset for responsive images
 */
export const WithSrcSet: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Responsive image with srcset',
    width: 400,
    height: 300,
    srcSet: `
      https://picsum.photos/400/300 400w,
      https://picsum.photos/600/450 600w,
      https://picsum.photos/800/600 800w
    `,
    sizes: '(max-width: 600px) 400px, (max-width: 900px) 600px, 800px',
    className: 'rounded-lg',
  },
};

/**
 * Multiple images demonstrating lazy loading
 */
export const LazyLoadGallery: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      {Array.from({ length: 8 }, (_, i) => (
        <OptimizedImage
          key={i}
          src={`https://picsum.photos/400/300?random=${i}`}
          alt={`Gallery image ${i + 1}`}
          width={200}
          height={150}
          placeholder="skeleton"
          className="rounded-lg"
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Scroll down to see images load as they enter the viewport.',
      },
    },
  },
};

/**
 * ResponsivePicture component
 */
export const ResponsivePictureExample: Story = {
  render: () => (
    <ResponsivePicture
      sources={[
        {
          srcSet: 'https://picsum.photos/800/600',
          media: '(min-width: 800px)',
          type: 'image/jpeg',
        },
        {
          srcSet: 'https://picsum.photos/600/450',
          media: '(min-width: 500px)',
          type: 'image/jpeg',
        },
      ]}
      src="https://picsum.photos/400/300"
      alt="Responsive picture element"
      width={400}
      height={300}
      className="rounded-lg"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Uses the picture element for art direction and format selection.',
      },
    },
  },
};

/**
 * Error state fallback
 */
export const ErrorState: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.com/image.jpg',
    alt: 'Image that will fail to load',
    width: 400,
    height: 300,
    eager: true,
    fallbackSrc: 'https://picsum.photos/400/300?grayscale',
    className: 'rounded-lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows fallback when image fails to load.',
      },
    },
  },
};
