/**
 * TradeInProgram.tsx
 *
 * DTC Feature 6.4: Trade-In Program
 * Apple-style trade-in value estimator, condition assessment, and store credit application
 *
 * Components:
 * 1. TradeInHero - Program introduction and benefits
 * 2. ProductSelector - Select product to trade in
 * 3. ConditionQuiz - Step-by-step condition assessment
 * 4. TradeInEstimate - Show estimated value
 * 5. TradeInSubmission - Submit trade-in request
 * 6. TradeInStatus - Track trade-in progress
 * 7. TradeInHistory - Past trade-ins list
 */

import { useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TradeInCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type TradeInStatus =
  | 'pending'
  | 'approved'
  | 'shipped'
  | 'received'
  | 'inspected'
  | 'completed'
  | 'rejected';

export interface TradeInProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  baseValue: number;
  maxValue: number;
}

export interface ConditionQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    deductionPercent: number;
  }[];
}

export interface TradeInEstimateData {
  product: TradeInProduct;
  condition: TradeInCondition;
  estimatedValue: number;
  deductions: {
    reason: string;
    amount: number;
  }[];
  expiresAt: Date;
}

export interface TradeInRequest {
  id: string;
  product: TradeInProduct;
  condition: TradeInCondition;
  estimatedValue: number;
  finalValue?: number;
  status: TradeInStatus;
  trackingNumber?: string;
  shippingLabel?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// ============================================================================
// Constants
// ============================================================================

const CONDITION_CONFIG: Record<
  TradeInCondition,
  { label: string; description: string; multiplier: number; color: string }
> = {
  excellent: {
    label: 'Excellent',
    description: 'Like new, minimal signs of use',
    multiplier: 1.0,
    color: 'green',
  },
  good: {
    label: 'Good',
    description: 'Light wear, fully functional',
    multiplier: 0.75,
    color: 'blue',
  },
  fair: {
    label: 'Fair',
    description: 'Moderate wear, some visible signs of use',
    multiplier: 0.5,
    color: 'yellow',
  },
  poor: {
    label: 'Poor',
    description: 'Heavy wear, but still functional',
    multiplier: 0.25,
    color: 'red',
  },
};

const STATUS_CONFIG: Record<
  TradeInStatus,
  { label: string; icon: string; color: string; step: number }
> = {
  pending: { label: 'Pending', icon: '⏳', color: 'yellow', step: 1 },
  approved: { label: 'Approved', icon: '✅', color: 'green', step: 2 },
  shipped: { label: 'Shipped', icon: '📦', color: 'blue', step: 3 },
  received: { label: 'Received', icon: '📬', color: 'blue', step: 4 },
  inspected: { label: 'Inspected', icon: '🔍', color: 'purple', step: 5 },
  completed: { label: 'Completed', icon: '🎉', color: 'green', step: 6 },
  rejected: { label: 'Rejected', icon: '❌', color: 'red', step: 0 },
};

const DEFAULT_QUESTIONS: ConditionQuestion[] = [
  {
    id: 'functionality',
    question: 'Is the item fully functional?',
    options: [
      { value: 'yes', label: 'Yes, works perfectly', deductionPercent: 0 },
      { value: 'minor', label: 'Minor issues', deductionPercent: 15 },
      { value: 'major', label: 'Major issues', deductionPercent: 40 },
      { value: 'broken', label: 'Not working', deductionPercent: 75 },
    ],
  },
  {
    id: 'cosmetic',
    question: 'What is the cosmetic condition?',
    options: [
      { value: 'excellent', label: 'Like new, no visible wear', deductionPercent: 0 },
      { value: 'good', label: 'Light scratches or scuffs', deductionPercent: 10 },
      { value: 'fair', label: 'Noticeable wear and tear', deductionPercent: 25 },
      { value: 'poor', label: 'Heavy wear or damage', deductionPercent: 50 },
    ],
  },
  {
    id: 'accessories',
    question: 'Do you have original accessories?',
    options: [
      { value: 'all', label: 'All original accessories', deductionPercent: 0 },
      { value: 'some', label: 'Some accessories', deductionPercent: 5 },
      { value: 'none', label: 'No accessories', deductionPercent: 10 },
    ],
  },
  {
    id: 'packaging',
    question: 'Do you have original packaging?',
    options: [
      { value: 'yes', label: 'Yes, original box', deductionPercent: 0 },
      { value: 'no', label: 'No original packaging', deductionPercent: 5 },
    ],
  },
];

// ============================================================================
// Components
// ============================================================================

/**
 * TradeInHero - Program introduction and benefits
 */
export function TradeInHero({
  onGetStarted,
  className = '',
}: {
  onGetStarted?: () => void;
  className?: string;
}) {
  const benefits = [
    { icon: '♻️', title: 'Sustainable', description: 'Give your items a second life' },
    { icon: '💰', title: 'Get Credit', description: 'Instant store credit' },
    { icon: '📦', title: 'Free Shipping', description: 'We cover shipping costs' },
    { icon: '⚡', title: 'Fast & Easy', description: 'Get value in minutes' },
  ];

  return (
    <div
      className={`bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl overflow-hidden ${className}`}
    >
      <div className="p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Trade In & Save
        </h1>
        <p className="text-lg text-white/90 mb-8 max-w-xl">
          Trade in your pre-owned items for instant store credit. It's fast, easy,
          and good for the planet.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl mb-2">{benefit.icon}</div>
              <p className="font-semibold">{benefit.title}</p>
              <p className="text-sm text-white/80">{benefit.description}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-white text-emerald-600 font-bold text-lg rounded-xl hover:bg-gray-100 shadow-lg"
        >
          Start Trade-In →
        </button>
      </div>
    </div>
  );
}

/**
 * ProductSelector - Select product to trade in
 */
export function ProductSelector({
  products,
  selectedProduct,
  onSelect,
  searchQuery,
  onSearch,
  className = '',
}: {
  products: TradeInProduct[];
  selectedProduct?: TradeInProduct;
  onSelect?: (product: TradeInProduct) => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  className?: string;
}) {
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        What would you like to trade in?
      </h3>

      {/* Search */}
      {onSearch && (
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      )}

      {/* Categories */}
      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {category}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products
              .filter((p) => p.category === category)
              .map((product) => (
                <button
                  key={product.id}
                  onClick={() => onSelect?.(product)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-lg mb-3"
                  />
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {product.name}
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                    Up to ${product.maxValue}
                  </p>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ConditionQuiz - Step-by-step condition assessment
 */
export function ConditionQuiz({
  questions = DEFAULT_QUESTIONS,
  onComplete,
  className = '',
}: {
  questions?: ConditionQuestion[];
  onComplete?: (answers: Record<string, string>, totalDeduction: number) => void;
  className?: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  const handleAnswer = (optionValue: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionValue };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      const totalDeduction = questions.reduce((total, q) => {
        const answer = newAnswers[q.id];
        const option = q.options.find((o) => o.value === answer);
        return total + (option?.deductionPercent || 0);
      }, 0);
      onComplete?.(newAnswers, Math.min(totalDeduction, 100));
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className={className}>
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full ${
              index <= currentStep
                ? 'bg-emerald-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Question {currentStep + 1} of {questions.length}
        </p>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currentQuestion.question}
        </h3>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
              answers[currentQuestion.id] === option.value
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="font-medium text-gray-900 dark:text-white">
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {currentStep > 0 && (
        <button
          onClick={handleBack}
          className="mt-6 text-gray-600 dark:text-gray-400 hover:underline"
        >
          ← Back
        </button>
      )}
    </div>
  );
}

/**
 * TradeInEstimate - Show estimated value
 */
export function TradeInEstimate({
  estimate,
  onAccept,
  onDecline,
  isLoading = false,
  className = '',
}: {
  estimate: TradeInEstimateData;
  onAccept?: () => void;
  onDecline?: () => void;
  isLoading?: boolean;
  className?: string;
}) {
  const conditionConfig = CONDITION_CONFIG[estimate.condition];
  const savings = estimate.product.maxValue - estimate.estimatedValue;
  const expiresIn = Math.ceil(
    (estimate.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Product Info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <img
            src={estimate.product.image}
            alt={estimate.product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {estimate.product.name}
            </h3>
            <span
              className={`inline-block px-2 py-1 text-sm rounded-full bg-${conditionConfig.color}-100 text-${conditionConfig.color}-700 dark:bg-${conditionConfig.color}-900/30 dark:text-${conditionConfig.color}-400`}
            >
              {conditionConfig.label} Condition
            </span>
          </div>
        </div>
      </div>

      {/* Estimated Value */}
      <div className="p-6 text-center bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Your Estimated Trade-In Value
        </p>
        <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
          ${estimate.estimatedValue}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          in instant store credit
        </p>
      </div>

      {/* Deductions */}
      {estimate.deductions.length > 0 && savings > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Value breakdown:
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Maximum value
              </span>
              <span className="text-gray-900 dark:text-white">
                ${estimate.product.maxValue}
              </span>
            </div>
            {estimate.deductions.map((deduction, index) => (
              <div key={index} className="flex justify-between text-red-600 dark:text-red-400">
                <span>{deduction.reason}</span>
                <span>-${deduction.amount}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-900 dark:text-white">Your value</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                ${estimate.estimatedValue}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expiration */}
      <div className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 text-center">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⏰ This quote expires in {expiresIn} days
        </p>
      </div>

      {/* Actions */}
      <div className="p-6 flex gap-3">
        <button
          onClick={onDecline}
          disabled={isLoading}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          No Thanks
        </button>
        <button
          onClick={onAccept}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  );
}

/**
 * TradeInSubmission - Submit trade-in request with shipping info
 */
export function TradeInSubmission({
  estimate,
  onSubmit,
  isLoading = false,
  className = '',
}: {
  estimate: TradeInEstimateData;
  onSubmit?: (formData: { name: string; email: string; address: string }) => void;
  isLoading?: boolean;
  className?: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 ${className}`}
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Complete Your Trade-In
      </h3>

      {/* Summary */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={estimate.product.image}
              alt={estimate.product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {estimate.product.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {CONDITION_CONFIG[estimate.condition].label} Condition
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${estimate.estimatedValue}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Shipping Address (for return label)
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            📦 What happens next?
          </h4>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
            <li>We'll email you a free prepaid shipping label</li>
            <li>Pack and ship your item within 14 days</li>
            <li>We'll inspect and verify the condition</li>
            <li>Store credit will be added to your account</li>
          </ol>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Submit Trade-In'}
        </button>
      </form>
    </div>
  );
}

/**
 * TradeInStatus - Track trade-in progress
 */
export function TradeInStatus({
  request,
  onTrackShipment,
  onDownloadLabel,
  className = '',
}: {
  request: TradeInRequest;
  onTrackShipment?: () => void;
  onDownloadLabel?: () => void;
  className?: string;
}) {
  const statusConfig = STATUS_CONFIG[request.status];
  const steps = ['approved', 'shipped', 'received', 'inspected', 'completed'];
  const currentStepIndex = steps.indexOf(request.status);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={request.product.image}
              alt={request.product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {request.product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Trade-In #{request.id}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700 dark:bg-${statusConfig.color}-900/30 dark:text-${statusConfig.color}-400`}
            >
              <span>{statusConfig.icon}</span>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {request.status !== 'rejected' && request.status !== 'pending' && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepStatus =
                index < currentStepIndex
                  ? 'completed'
                  : index === currentStepIndex
                  ? 'current'
                  : 'upcoming';

              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        stepStatus === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : stepStatus === 'current'
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-200 dark:ring-emerald-800'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {stepStatus === 'completed' ? '✓' : index + 1}
                    </div>
                    <p
                      className={`text-xs mt-2 text-center ${
                        stepStatus === 'upcoming'
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {STATUS_CONFIG[step as TradeInStatus]?.label || step}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentStepIndex
                          ? 'bg-emerald-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Value Info */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 dark:text-gray-400">
            Estimated Value
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${request.estimatedValue}
          </span>
        </div>
        {request.finalValue && request.finalValue !== request.estimatedValue && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Final Value</span>
            <span
              className={`font-semibold ${
                request.finalValue >= request.estimatedValue
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              ${request.finalValue}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {(request.status === 'approved' || request.status === 'shipped') && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {request.shippingLabel && onDownloadLabel && (
            <button
              onClick={onDownloadLabel}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
            >
              📄 Download Shipping Label
            </button>
          )}
          {request.trackingNumber && onTrackShipment && (
            <button
              onClick={onTrackShipment}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              📦 Track Shipment
            </button>
          )}
        </div>
      )}

      {/* Notes */}
      {request.notes && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> {request.notes}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * TradeInHistory - Past trade-ins list
 */
export function TradeInHistory({
  requests,
  onViewDetails,
  className = '',
}: {
  requests: TradeInRequest[];
  onViewDetails?: (requestId: string) => void;
  className?: string;
}) {
  if (requests.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-5xl mb-4">♻️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Trade-Ins Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Trade in your pre-owned items for store credit!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Trade-In History
      </h3>

      <div className="space-y-3">
        {requests.map((request) => {
          const statusConfig = STATUS_CONFIG[request.status];

          return (
            <button
              key={request.id}
              onClick={() => onViewDetails?.(request.id)}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 text-left transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src={request.product.image}
                  alt={request.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {request.product.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {request.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700 dark:bg-${statusConfig.color}-900/30 dark:text-${statusConfig.color}-400`}
                >
                  <span>{statusConfig.icon}</span>
                  {statusConfig.label}
                </span>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  ${request.finalValue || request.estimatedValue}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * TradeInValueCalculator - Quick value lookup widget
 */
export function TradeInValueCalculator({
  products,
  onStartTradeIn,
  className = '',
}: {
  products: TradeInProduct[];
  onStartTradeIn?: (product: TradeInProduct, condition: TradeInCondition) => void;
  className?: string;
}) {
  const [selectedProduct, setSelectedProduct] = useState<TradeInProduct | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<TradeInCondition>('good');

  const estimatedValue = selectedProduct
    ? Math.round(selectedProduct.maxValue * CONDITION_CONFIG[selectedCondition].multiplier)
    : 0;

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 ${className}`}
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        ♻️ Check Your Trade-In Value
      </h3>

      <div className="space-y-4">
        {/* Product Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Product
          </label>
          <select
            value={selectedProduct?.id || ''}
            onChange={(e) => {
              const product = products.find((p) => p.id === e.target.value);
              setSelectedProduct(product || null);
            }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Choose a product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (up to ${product.maxValue})
              </option>
            ))}
          </select>
        </div>

        {/* Condition Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Condition
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CONDITION_CONFIG) as TradeInCondition[]).map((condition) => {
              const config = CONDITION_CONFIG[condition];
              return (
                <button
                  key={condition}
                  onClick={() => setSelectedCondition(condition)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedCondition === condition
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {config.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estimated Value */}
        {selectedProduct && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Estimated Value
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              ${estimatedValue}
            </p>
            <button
              onClick={() => onStartTradeIn?.(selectedProduct, selectedCondition)}
              className="mt-3 px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
            >
              Start Trade-In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default {
  TradeInHero,
  ProductSelector,
  ConditionQuiz,
  TradeInEstimate,
  TradeInSubmission,
  TradeInStatus,
  TradeInHistory,
  TradeInValueCalculator,
  CONDITION_CONFIG,
  STATUS_CONFIG,
};
