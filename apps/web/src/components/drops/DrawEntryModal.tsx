/**
 * DrawEntryModal Component
 * Modal for entering product raffles/draws
 * DTC Feature: Drops & Limited Editions (6.4)
 */

import React, { useState } from 'react';

interface DrawProduct {
  id: number;
  name: string;
  image: string;
  price: number;
}

export interface DrawEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: DrawProduct;
  drawEndsAt: string;
  entriesRemaining?: number;
  totalEntries?: number;
  onSubmit: (data: { shoeSize?: string; address?: string }) => void;
  requiresShoeSize?: boolean;
  requiresAddress?: boolean;
  loading?: boolean;
  className?: string;
}

export const DrawEntryModal: React.FC<DrawEntryModalProps> = ({
  isOpen,
  onClose,
  product,
  drawEndsAt,
  entriesRemaining,
  totalEntries,
  onSubmit,
  requiresShoeSize = true,
  requiresAddress = false,
  loading = false,
}) => {
  const [shoeSize, setShoeSize] = useState('');
  const [address, setAddress] = useState('');
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const shoeSizes = [
    '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5',
    '10', '10.5', '11', '11.5', '12', '12.5', '13', '14', '15'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    onSubmit({
      shoeSize: requiresShoeSize ? shoeSize : undefined,
      address: requiresAddress ? address : undefined,
    });
  };

  const canSubmit = agreed && (!requiresShoeSize || shoeSize) && (!requiresAddress || address);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">Enter Draw</h2>
          <p className="text-gray-500 text-sm mt-1">
            Submit your entry for a chance to purchase
          </p>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-bold text-gray-900">{product.name}</h3>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatPrice(product.price)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ends {formatDate(drawEndsAt)}</span>
              </div>
            </div>
          </div>

          {/* Entry Stats */}
          {(entriesRemaining !== undefined || totalEntries !== undefined) && (
            <div className="mt-4 flex gap-4 text-sm">
              {totalEntries !== undefined && (
                <div className="flex-1 p-3 bg-white rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{totalEntries.toLocaleString()}</p>
                  <p className="text-gray-500">Total Entries</p>
                </div>
              )}
              {entriesRemaining !== undefined && (
                <div className="flex-1 p-3 bg-white rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{entriesRemaining}</p>
                  <p className="text-gray-500">Your Entries Left</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Shoe Size */}
          {requiresShoeSize && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Size *
              </label>
              <div className="grid grid-cols-6 gap-2">
                {shoeSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setShoeSize(size)}
                    className={`py-2 text-sm font-medium rounded border transition-colors ${
                      shoeSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          {requiresAddress && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address *
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full shipping address"
              />
            </div>
          )}

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="agree" className="text-sm text-gray-600">
              I understand that this is a raffle entry and winning does not guarantee purchase.
              If selected, I will be charged {formatPrice(product.price)} and agree to complete the purchase.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Entry'
            )}
          </button>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center">
            Winners will be notified via email within 24 hours of draw close.
            One entry per customer.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DrawEntryModal;
