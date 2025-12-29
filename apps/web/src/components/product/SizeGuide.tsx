import { Button } from '@/components/ui';
import { useState } from 'react';

/**
 * SizeGuide Component
 *
 * Modal/drawer for size chart and fit recommendations.
 *
 * Features:
 * - Size chart with measurements
 * - Measurement guide with illustrations
 * - How to measure instructions
 * - Size comparison (US/UK/EU)
 */

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  category?: 'clothing' | 'shoes' | 'accessories';
}

const CLOTHING_SIZES = [
  { size: 'XS', us: '0-2', uk: '4-6', eu: '32-34', chest: '32-33', waist: '24-25', hips: '34-35' },
  { size: 'S', us: '4-6', uk: '8-10', eu: '36-38', chest: '34-35', waist: '26-27', hips: '36-37' },
  { size: 'M', us: '8-10', uk: '12-14', eu: '40-42', chest: '36-37', waist: '28-29', hips: '38-39' },
  { size: 'L', us: '12-14', uk: '16-18', eu: '44-46', chest: '38-40', waist: '30-32', hips: '40-42' },
  { size: 'XL', us: '16-18', uk: '20-22', eu: '48-50', chest: '41-43', waist: '33-35', hips: '43-45' },
  { size: 'XXL', us: '20-22', uk: '24-26', eu: '52-54', chest: '44-46', waist: '36-38', hips: '46-48' },
];

const SHOE_SIZES = [
  { us: '6', uk: '5.5', eu: '38.5', cm: '24' },
  { us: '6.5', uk: '6', eu: '39', cm: '24.5' },
  { us: '7', uk: '6.5', eu: '40', cm: '25' },
  { us: '7.5', uk: '7', eu: '40.5', cm: '25.5' },
  { us: '8', uk: '7.5', eu: '41', cm: '26' },
  { us: '8.5', uk: '8', eu: '42', cm: '26.5' },
  { us: '9', uk: '8.5', eu: '42.5', cm: '27' },
  { us: '9.5', uk: '9', eu: '43', cm: '27.5' },
  { us: '10', uk: '9.5', eu: '44', cm: '28' },
  { us: '10.5', uk: '10', eu: '44.5', cm: '28.5' },
  { us: '11', uk: '10.5', eu: '45', cm: '29' },
  { us: '12', uk: '11.5', eu: '46', cm: '30' },
];

const MEASUREMENT_TIPS = [
  { part: 'Chest', instruction: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
  { part: 'Waist', instruction: 'Measure around your natural waistline, keeping the tape comfortably loose.' },
  { part: 'Hips', instruction: 'Measure around the fullest part of your hips, about 8" below your waist.' },
  { part: 'Inseam', instruction: 'Measure from the crotch seam to the bottom of the leg.' },
];

const SizeGuide = ({ isOpen, onClose, category = 'clothing' }: SizeGuideProps) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'measure'>('chart');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800 sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Size Guide
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close size guide"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chart'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Size Chart
          </button>
          <button
            onClick={() => setActiveTab('measure')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'measure'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            How to Measure
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {activeTab === 'chart' && (
            <div>
              {category === 'clothing' && (
                <>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    All measurements are in inches unless otherwise noted.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Size</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">US</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">UK</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">EU</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Chest</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Waist</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Hips</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CLOTHING_SIZES.map((row, index) => (
                          <tr
                            key={row.size}
                            className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
                          >
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.size}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.us}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.uk}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.eu}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.chest}"</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.waist}"</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.hips}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {category === 'shoes' && (
                <>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Find your perfect fit with our shoe size conversion chart.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">US</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">UK</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">EU</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">CM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SHOE_SIZES.map((row, index) => (
                          <tr
                            key={row.us}
                            className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
                          >
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.us}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.uk}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.eu}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.cm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'measure' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For the best fit, take measurements over your underwear. Keep the tape measure snug but not tight.
              </p>

              {/* Measurement Illustration */}
              <div className="flex justify-center">
                <div className="relative h-64 w-48 rounded-xl bg-gray-100 dark:bg-gray-700">
                  <svg viewBox="0 0 100 200" className="h-full w-full">
                    {/* Simple body outline */}
                    <ellipse cx="50" cy="25" rx="15" ry="18" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" />
                    <path d="M35 43 L25 100 L30 100 L35 70 L50 75 L65 70 L70 100 L75 100 L65 43 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" />
                    <path d="M25 100 L20 180 M30 100 L35 180 M70 100 L65 180 M75 100 L80 180" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" />
                    
                    {/* Measurement lines */}
                    <line x1="20" y1="55" x2="80" y2="55" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2" />
                    <line x1="25" y1="80" x2="75" y2="80" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2" />
                    <line x1="20" y1="100" x2="80" y2="100" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2" />
                    
                    {/* Labels */}
                    <text x="85" y="57" fontSize="8" fill="#6366f1">Chest</text>
                    <text x="85" y="82" fontSize="8" fill="#6366f1">Waist</text>
                    <text x="85" y="102" fontSize="8" fill="#6366f1">Hips</text>
                  </svg>
                </div>
              </div>

              {/* Measurement Instructions */}
              <div className="space-y-4">
                {MEASUREMENT_TIPS.map((tip, index) => (
                  <div
                    key={tip.part}
                    className="flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{tip.part}</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{tip.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Still unsure?{' '}
              <a href="/contact" className="text-indigo-600 hover:underline dark:text-indigo-400">
                Contact us
              </a>
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SizeGuide;
