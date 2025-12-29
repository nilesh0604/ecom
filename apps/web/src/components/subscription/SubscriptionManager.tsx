/**
 * SubscriptionManager Component
 * Manage active subscription with skip, pause, edit options
 * DTC Feature: Subscription Commerce (6.1)
 */

import React, { useState } from 'react';

interface SubscriptionItem {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

interface UpcomingDelivery {
  id: string;
  scheduledDate: string;
  items: SubscriptionItem[];
  total: number;
  status: 'SCHEDULED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'SKIPPED';
}

export interface SubscriptionManagerProps {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  frequency: {
    interval: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
    label: string;
  };
  nextDeliveryDate: string;
  items: SubscriptionItem[];
  upcomingDeliveries?: UpcomingDelivery[];
  totalPrice: number;
  discount?: number;
  createdAt: string;
  onSkipDelivery?: (deliveryId: string) => void;
  onUnskipDelivery?: (deliveryId: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onEditItems?: () => void;
  onChangeFrequency?: (frequency: string) => void;
  onAddItem?: () => void;
  className?: string;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  name,
  status,
  frequency,
  nextDeliveryDate,
  items,
  upcomingDeliveries = [],
  totalPrice,
  discount,
  createdAt,
  onSkipDelivery,
  onUnskipDelivery,
  onPause,
  onResume,
  onCancel,
  onEditItems,
  onChangeFrequency,
  onAddItem,
  className = '',
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'deliveries'>('overview');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusBadge = () => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getDeliveryStatusBadge = (deliveryStatus: string) => {
    const styles: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-yellow-100 text-yellow-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      SKIPPED: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[deliveryStatus]}`}>
        {deliveryStatus}
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <p className="text-gray-500 mt-1">
              Delivering {frequency.label} · Since {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Next Delivery */}
        {status === 'ACTIVE' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Next Delivery</p>
                <p className="text-lg font-semibold text-blue-900">
                  {formatDate(nextDeliveryDate)}
                </p>
              </div>
              {onSkipDelivery && (
                <button
                  onClick={() => onSkipDelivery('next')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Skip This Delivery
                </button>
              )}
            </div>
          </div>
        )}

        {/* Paused State */}
        {status === 'PAUSED' && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 font-medium">Subscription Paused</p>
                <p className="text-sm text-yellow-700">
                  No deliveries scheduled until you resume
                </p>
              </div>
              {onResume && (
                <button
                  onClick={onResume}
                  className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Resume Subscription
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {(['overview', 'items', 'deliveries'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Per Delivery</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Frequency</p>
                <p className="text-2xl font-bold text-gray-900">{frequency.label}</p>
              </div>
              {discount && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Subscription Savings</p>
                  <p className="text-2xl font-bold text-green-700">{discount}%</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {onEditItems && (
                <button
                  onClick={onEditItems}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit Items
                </button>
              )}
              {onChangeFrequency && (
                <button
                  onClick={() => onChangeFrequency(frequency.interval)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Change Frequency
                </button>
              )}
              {status === 'ACTIVE' && onPause && (
                <button
                  onClick={onPause}
                  className="px-4 py-2 text-sm font-medium text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  Pause Subscription
                </button>
              )}
              {onCancel && status !== 'CANCELLED' && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
              >
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}

            {onAddItem && (
              <button
                onClick={onAddItem}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add Item to Subscription
              </button>
            )}
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            {upcomingDeliveries.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No upcoming deliveries scheduled
              </p>
            ) : (
              upcomingDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className={`p-4 border rounded-lg ${
                    delivery.status === 'SKIPPED'
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(delivery.scheduledDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {delivery.items.length} items · {formatPrice(delivery.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDeliveryStatusBadge(delivery.status)}
                      {delivery.status === 'SCHEDULED' && onSkipDelivery && (
                        <button
                          onClick={() => onSkipDelivery(delivery.id)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Skip
                        </button>
                      )}
                      {delivery.status === 'SKIPPED' && onUnskipDelivery && (
                        <button
                          onClick={() => onUnskipDelivery(delivery.id)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Unskip
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cancel Subscription?
            </h3>
            <p className="text-gray-600 mb-6">
              You'll lose your subscription discount and any scheduled deliveries will be cancelled.
              Are you sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => {
                  onCancel?.();
                  setShowCancelConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
