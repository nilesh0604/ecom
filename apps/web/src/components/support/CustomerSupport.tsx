import { Badge, Button } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * CustomerSupport - Help Center, FAQ, Contact, and Order Lookup components
 *
 * Features:
 * - Help Center with categorized FAQ
 * - Contact form with order association
 * - Guest order lookup
 * - Live chat widget trigger
 */

// ============================================================================
// Types & Schemas
// ============================================================================

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful?: number;
  notHelpful?: number;
}

export interface FaqCategory {
  id: string;
  name: string;
  icon?: React.ReactNode;
  description?: string;
}

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  orderId: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.enum(['order', 'product', 'shipping', 'returns', 'account', 'other']),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  attachments: z.array(z.string()).optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const orderLookupSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  email: z.string().email('Please enter a valid email address'),
});

type OrderLookupData = z.infer<typeof orderLookupSchema>;

// ============================================================================
// Help Center / FAQ Component
// ============================================================================

export interface HelpCenterProps {
  categories: FaqCategory[];
  faqs: FaqItem[];
  onSearch?: (query: string) => void;
  onFeedback?: (faqId: string, helpful: boolean) => void;
  className?: string;
}

export const HelpCenter = ({
  categories,
  faqs,
  onSearch,
  onFeedback,
  className = '',
}: HelpCenterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() =>
              setSelectedCategory(selectedCategory === category.id ? null : category.id)
            }
            className={`
              p-4 rounded-lg border text-center transition-all
              ${
                selectedCategory === category.id
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }
            `}
          >
            {category.icon && (
              <div className="flex justify-center mb-2">{category.icon}</div>
            )}
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              No results found. Try a different search term.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    expandedFaq === faq.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedFaq === faq.id && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {faq.answer}
                  </p>

                  {/* Feedback */}
                  {onFeedback && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Was this helpful?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onFeedback(faq.id, true)}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 hover:text-green-600 transition-colors"
                        >
                          👍 Yes
                        </button>
                        <button
                          onClick={() => onFeedback(faq.id, false)}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 hover:text-red-600 transition-colors"
                        >
                          👎 No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Contact Form Component
// ============================================================================

export interface ContactFormProps {
  orderId?: string;
  onSubmit: (data: ContactFormData) => Promise<void>;
  className?: string;
}

export const ContactForm = ({ orderId, onSubmit, className = '' }: ContactFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      orderId: orderId || '',
      category: 'order',
    },
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      setTicketNumber(`TKT-${Date.now().toString(36).toUpperCase()}`);
      setIsSubmitted(true);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Message Sent!
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your ticket number is <span className="font-mono font-bold">{ticketNumber}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          We'll get back to you within 24 hours.
        </p>
        <Button variant="secondary" onClick={() => setIsSubmitted(false)} className="mt-6">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
      {/* Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Order ID & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order ID (if applicable)
          </label>
          <input
            type="text"
            {...register('orderId')}
            placeholder="e.g., ORD-12345"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            {...register('category')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <option value="order">Order Issue</option>
            <option value="product">Product Question</option>
            <option value="shipping">Shipping</option>
            <option value="returns">Returns & Refunds</option>
            <option value="account">Account</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subject *
        </label>
        <input
          type="text"
          {...register('subject')}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message *
        </label>
        <textarea
          {...register('message')}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        Send Message
      </Button>
    </form>
  );
};

// ============================================================================
// Guest Order Lookup Component
// ============================================================================

export interface OrderLookupResult {
  orderId: string;
  status: string;
  orderDate: Date | string;
  total: number;
  items: number;
  trackingUrl?: string;
}

export interface GuestOrderLookupProps {
  onLookup: (orderId: string, email: string) => Promise<OrderLookupResult | null>;
  className?: string;
}

export const GuestOrderLookup = ({ onLookup, className = '' }: GuestOrderLookupProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<OrderLookupResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderLookupData>({
    resolver: zodResolver(orderLookupSchema),
  });

  const handleLookup = async (data: OrderLookupData) => {
    setIsSearching(true);
    setNotFound(false);
    setResult(null);

    try {
      const order = await onLookup(data.orderId, data.email);
      if (order) {
        setResult(order);
      } else {
        setNotFound(true);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error',
      refunded: 'default',
    };
    return statusMap[status.toLowerCase()] || 'default';
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      {!result ? (
        <>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Track Your Order
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your order ID and email to view order status
            </p>
          </div>

          <form onSubmit={handleSubmit(handleLookup)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order ID
              </label>
              <input
                type="text"
                {...register('orderId')}
                placeholder="e.g., ORD-12345"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              {errors.orderId && (
                <p className="mt-1 text-sm text-red-500">{errors.orderId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="Email used for the order"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {notFound && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Order not found. Please check your order ID and email.
                </p>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth isLoading={isSearching}>
              Look Up Order
            </Button>
          </form>
        </>
      ) : (
        <div className="space-y-6">
          {/* Order found */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Order Found
            </h3>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Order ID</span>
              <span className="font-mono font-medium text-gray-900 dark:text-white">
                {result.orderId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
              <Badge variant={getStatusBadge(result.status)}>
                {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Order Date</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(result.orderDate)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Items</span>
              <span className="text-gray-900 dark:text-white">{result.items}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${result.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {result.trackingUrl && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.open(result.trackingUrl, '_blank')}
              >
                Track Shipment
              </Button>
            )}
            <Button variant="secondary" fullWidth onClick={() => setResult(null)}>
              Look Up Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Live Chat Widget Trigger
// ============================================================================

export interface LiveChatTriggerProps {
  isOnline?: boolean;
  agentName?: string;
  agentAvatar?: string;
  waitTime?: string;
  onOpen: () => void;
  className?: string;
}

export const LiveChatTrigger = ({
  isOnline = true,
  agentName = 'Support',
  agentAvatar,
  waitTime = 'Under 2 min',
  onOpen,
  className = '',
}: LiveChatTriggerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            {agentAvatar ? (
              <img
                src={agentAvatar}
                alt={agentName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{agentName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isOnline ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Online • {waitTime} wait
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    Offline
                  </span>
                )}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isOnline
              ? "We're here to help! Click to start a chat."
              : "Leave a message and we'll get back to you."}
          </p>
        </div>
      )}

      {/* Button */}
      <button
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Open chat"
      >
        <svg
          className="w-6 h-6 group-hover:scale-110 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>

        {/* Online indicator */}
        {isOnline && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
        )}
      </button>
    </div>
  );
};

// ============================================================================
// Quick Action Cards
// ============================================================================

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActions = ({ actions, className = '' }: QuickActionsProps) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {actions.map((action) => {
        const Component = action.href ? 'a' : 'button';
        return (
          <Component
            key={action.id}
            href={action.href}
            onClick={action.onClick}
            className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all text-left"
          >
            <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {action.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{action.title}</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </div>
          </Component>
        );
      })}
    </div>
  );
};
