import { GiftCardBalance, PurchaseGiftCard } from '@/components/checkout';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * GiftCardsPage
 *
 * Page for purchasing and checking gift card balance.
 */
const GiftCardsPage = () => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'balance'>('purchase');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handlePurchaseSuccess = () => {
    setPurchaseSuccess(true);
  };

  if (purchaseSuccess) {
    return (
      <>
        <Helmet>
          <title>Gift Card Purchased - eCom</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-16 dark:bg-gray-900">
          <div className="mx-auto max-w-lg px-4 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-10 w-10 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gift Card Sent!
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Your gift card has been purchased and will be delivered to the recipient's email.
            </p>
            <button
              type="button"
              onClick={() => setPurchaseSuccess(false)}
              className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Purchase Another Gift Card
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gift Cards - eCom</title>
        <meta
          name="description"
          content="Purchase gift cards for your loved ones. Choose from preset amounts or custom values."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gift Cards</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The perfect gift for any occasion
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setActiveTab('purchase')}
                className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                  activeTab === 'purchase'
                    ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Purchase Gift Card
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('balance')}
                className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                  activeTab === 'balance'
                    ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Check Balance
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
            {activeTab === 'purchase' ? (
              <PurchaseGiftCard onPurchase={handlePurchaseSuccess} />
            ) : (
              <div className="mx-auto max-w-md">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                  Check Your Balance
                </h2>
                <GiftCardBalance />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Instant Delivery</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Gift cards are delivered instantly via email
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Schedule Delivery</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Send on a specific date for special occasions
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Never Expires</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Gift card balances never expire
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GiftCardsPage;
