import { z } from 'zod';

// ==========================================
// Auth Validators
// ==========================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().int().min(13).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// ==========================================
// Product Validators
// ==========================================

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  discountPercentage: z.number().min(0).max(100).optional(),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  images: z.array(z.string().url()).optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  stock: z.number().int().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'price', 'title', 'rating']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  inStock: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ==========================================
// Cart Validators
// ==========================================

export const addToCartSchema = z.object({
  productId: z.number().int().positive('Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
});

// ==========================================
// Order Validators
// ==========================================

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone is required'),
});

export const createOrderSchema = z.object({
  products: z
    .array(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, 'At least one product is required'),
  shippingAddress: shippingAddressSchema,
  paymentIntentId: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.coerce.date().optional(),
});

// ==========================================
// User Validators
// ==========================================

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().int().min(13).max(120).optional(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone is required'),
  isDefault: z.boolean().default(false),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  currency: z.string().length(3).optional(),
  language: z.string().length(2).optional(),
});

// ==========================================
// Review Validators
// ==========================================

export const createReviewSchema = z.object({
  productId: z.number().int().positive('Product ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ==========================================
// Payment Validators
// ==========================================

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  orderId: z.string().optional(),
});

// ==========================================
// Common Validators
// ==========================================

export const paginationSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid ID'),
});

export const stringIdParamSchema = z.object({
  id: z.string().min(1, 'Invalid ID'),
});
