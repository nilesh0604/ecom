import { Badge, Button } from '@/components/ui';
import { useState } from 'react';

/**
 * TaxesAndInvoices - Components for tax calculation display and invoice generation
 *
 * Features:
 * - Tax calculation breakdown by address
 * - Downloadable invoice/receipt
 * - VAT/GST fields for international orders
 * - Tax exemption certificate upload
 */

export interface TaxBreakdownItem {
  label: string;
  rate: number;
  amount: number;
  jurisdiction?: string;
}

export interface TaxCalculation {
  subtotal: number;
  taxItems: TaxBreakdownItem[];
  totalTax: number;
  grandTotal: number;
  currency?: string;
  estimatedAt?: Date;
}

export interface TaxBreakdownProps {
  calculation: TaxCalculation;
  showDetails?: boolean;
  className?: string;
}

/**
 * TaxBreakdown - Displays itemized tax calculation
 */
export const TaxBreakdown = ({
  calculation,
  showDetails = true,
  className = '',
}: TaxBreakdownProps) => {
  const { subtotal, taxItems, totalTax, grandTotal, currency = 'USD' } = calculation;
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
        <span className="text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
      </div>

      {/* Tax line - expandable for details */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <button
          type="button"
          onClick={() => showDetails && setExpanded(!expanded)}
          className="flex justify-between items-center w-full text-sm group"
          disabled={!showDetails}
        >
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            Estimated Tax
            {showDetails && taxItems.length > 0 && (
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
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
            )}
          </span>
          <span className="text-gray-900 dark:text-white">{formatCurrency(totalTax)}</span>
        </button>

        {/* Expanded tax details */}
        {expanded && taxItems.length > 0 && (
          <div className="mt-2 ml-4 space-y-1">
            {taxItems.map((item, index) => (
              <div key={index} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {item.label}
                  {item.jurisdiction && ` (${item.jurisdiction})`} - {item.rate.toFixed(2)}%
                </span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grand total */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold">
        <span className="text-gray-900 dark:text-white">Total</span>
        <span className="text-gray-900 dark:text-white">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );
};

/**
 * VAT/GST Input Fields
 */
export interface VatGstFieldsProps {
  country: string;
  vatNumber?: string;
  gstNumber?: string;
  onVatChange?: (value: string) => void;
  onGstChange?: (value: string) => void;
  isValidating?: boolean;
  isValid?: boolean;
  error?: string;
  className?: string;
}

export const VatGstFields = ({
  country,
  vatNumber = '',
  gstNumber = '',
  onVatChange,
  onGstChange,
  isValidating = false,
  isValid,
  error,
  className = '',
}: VatGstFieldsProps) => {
  // Determine which field to show based on country
  const showVat = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PL'].includes(country);
  const showGst = ['AU', 'IN', 'SG', 'NZ', 'MY', 'CA'].includes(country);

  if (!showVat && !showGst) return null;

  const fieldLabel = showVat ? 'VAT Number' : 'GST Number';
  const fieldValue = showVat ? vatNumber : gstNumber;
  const onChange = showVat ? onVatChange : onGstChange;
  const placeholder = showVat ? 'e.g., GB123456789' : showGst && country === 'IN' ? 'e.g., 22AAAAA0000A1Z5' : 'e.g., 12345678901';

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {fieldLabel} (Optional)
      </label>
      <div className="relative">
        <input
          type="text"
          value={fieldValue}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2
            ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : isValid
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white'
            }
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          `}
        />
        {/* Validation indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValidating && (
            <svg
              className="w-5 h-5 text-gray-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {!isValidating && isValid && (
            <svg
              className="w-5 h-5 text-green-500"
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
          )}
          {!isValidating && error && (
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {isValid && !error && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ Valid {fieldLabel} - Tax will be reverse charged
        </p>
      )}
    </div>
  );
};

/**
 * Invoice/Receipt types
 */
export interface InvoiceData {
  id: string;
  orderId: string;
  orderDate: Date | string;
  invoiceDate: Date | string;
  invoiceNumber: string;
  status: 'draft' | 'issued' | 'paid' | 'void';
  customerName: string;
  customerEmail: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
    sku?: string;
  }[];
  subtotal: number;
  shipping: number;
  taxBreakdown: TaxBreakdownItem[];
  totalTax: number;
  discount?: number;
  grandTotal: number;
  currency: string;
  paymentMethod?: string;
  vatNumber?: string;
  gstNumber?: string;
}

export interface InvoiceDownloadProps {
  invoice: InvoiceData;
  variant?: 'invoice' | 'receipt';
  onDownload?: () => void;
  className?: string;
}

/**
 * InvoiceDownload - Button to download invoice or receipt
 */
export const InvoiceDownload = ({
  invoice,
  variant = 'invoice',
  onDownload,
  className = '',
}: InvoiceDownloadProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would call an API to generate the PDF
    // For demo, we'll create a simple text file
    const content = generateInvoiceText(invoice, variant);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${variant}-${invoice.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsGenerating(false);
    onDownload?.();
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleDownload}
      isLoading={isGenerating}
      className={className}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download {variant === 'invoice' ? 'Invoice' : 'Receipt'}
    </Button>
  );
};

/**
 * Generate invoice text content (simplified for demo)
 */
const generateInvoiceText = (invoice: InvoiceData, variant: 'invoice' | 'receipt'): string => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  const title = variant === 'invoice' ? 'INVOICE' : 'RECEIPT';
  const lines = [
    `========================================`,
    `                ${title}`,
    `========================================`,
    ``,
    `${variant === 'invoice' ? 'Invoice' : 'Receipt'} #: ${invoice.invoiceNumber}`,
    `Order #: ${invoice.orderId}`,
    `Date: ${formatDate(invoice.invoiceDate)}`,
    ``,
    `Bill To:`,
    `${invoice.customerName}`,
    `${invoice.billingAddress.line1}`,
    invoice.billingAddress.line2 || '',
    `${invoice.billingAddress.city}, ${invoice.billingAddress.state} ${invoice.billingAddress.postalCode}`,
    `${invoice.billingAddress.country}`,
    invoice.vatNumber ? `VAT: ${invoice.vatNumber}` : '',
    invoice.gstNumber ? `GST: ${invoice.gstNumber}` : '',
    ``,
    `----------------------------------------`,
    `ITEMS`,
    `----------------------------------------`,
  ];

  invoice.items.forEach((item) => {
    lines.push(`${item.name}`);
    lines.push(`  ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`);
  });

  lines.push(`----------------------------------------`);
  lines.push(`Subtotal:  ${formatCurrency(invoice.subtotal)}`);
  lines.push(`Shipping:  ${formatCurrency(invoice.shipping)}`);

  invoice.taxBreakdown.forEach((tax) => {
    lines.push(`${tax.label} (${tax.rate}%):  ${formatCurrency(tax.amount)}`);
  });

  if (invoice.discount) {
    lines.push(`Discount:  -${formatCurrency(invoice.discount)}`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`TOTAL:     ${formatCurrency(invoice.grandTotal)}`);
  lines.push(`----------------------------------------`);
  lines.push(``);
  lines.push(`Payment Method: ${invoice.paymentMethod || 'Credit Card'}`);
  lines.push(`Status: ${invoice.status.toUpperCase()}`);
  lines.push(``);
  lines.push(`Thank you for your purchase!`);

  return lines.filter((line) => line !== '').join('\n');
};

/**
 * InvoiceList - List of invoices/receipts for order history
 */
export interface InvoiceListProps {
  invoices: InvoiceData[];
  onDownload?: (invoice: InvoiceData) => void;
  className?: string;
}

export const InvoiceList = ({ invoices, onDownload, className = '' }: InvoiceListProps) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status: InvoiceData['status']) => {
    const variants: Record<InvoiceData['status'], 'warning' | 'info' | 'success' | 'default'> = {
      draft: 'warning',
      issued: 'info',
      paid: 'success',
      void: 'default',
    };
    return variants[status];
  };

  if (invoices.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-gray-500 dark:text-gray-400">No invoices found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-900 dark:text-white">
                #{invoice.invoiceNumber}
              </span>
              <Badge variant={getStatusBadge(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formatDate(invoice.invoiceDate)} • Order #{invoice.orderId}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(invoice.grandTotal, invoice.currency)}
            </span>

            <div className="flex gap-2">
              <InvoiceDownload
                invoice={invoice}
                variant="invoice"
                onDownload={() => onDownload?.(invoice)}
              />
              <InvoiceDownload
                invoice={invoice}
                variant="receipt"
                onDownload={() => onDownload?.(invoice)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * TaxExemptionUpload - Upload tax exemption certificate
 */
export interface TaxExemptionUploadProps {
  onUpload?: (file: File) => void;
  currentFile?: string;
  isVerified?: boolean;
  className?: string;
}

export const TaxExemptionUpload = ({
  onUpload,
  currentFile,
  isVerified = false,
  className = '',
}: TaxExemptionUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      onUpload?.(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload?.(file);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Tax Exemption Certificate
      </label>

      {currentFile ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{currentFile}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isVerified ? (
                  <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">⏳ Pending verification</span>
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            Replace
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${
              isDragging
                ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <svg
            className="w-10 h-10 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-black dark:text-white">Upload a file</span> or drag
            and drop
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">PDF or image up to 10MB</p>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Upload a valid tax exemption certificate to remove applicable taxes from your order.
        Verification typically takes 1-2 business days.
      </p>
    </div>
  );
};
