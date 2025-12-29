/**
 * Product Customization Service
 * 
 * DTC Feature: Product Customization
 * Handles custom product options, engraving, monograms, colors, materials
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Types
// ============================================================================

export type CustomizationType = 
  | 'COLOR'
  | 'MATERIAL'
  | 'ENGRAVING'
  | 'MONOGRAM'
  | 'SIZE'
  | 'FINISH'
  | 'PATTERN';

export interface CustomizationOption {
  id: string;
  type: CustomizationType;
  name: string;
  value: string;
  priceModifier: number; // Additional cost
  image?: string;
  inStock: boolean;
}

export interface ProductCustomization {
  productId: number;
  options: CustomizationOption[];
  allowMultiple: boolean;
  required: boolean;
  previewEnabled: boolean;
}

export interface CustomizedCartItem {
  productId: number;
  quantity: number;
  customizations: {
    type: CustomizationType;
    optionId: string;
    value: string;
  }[];
  engravingText?: string;
  monogramText?: string;
}

// ============================================================================
// Constants
// ============================================================================

// Pricing for customizations
export const CUSTOMIZATION_PRICING = {
  ENGRAVING: 9.99,
  MONOGRAM: 14.99,
  PREMIUM_COLOR: 5.00,
  PREMIUM_MATERIAL: 25.00,
  GIFT_BOX: 4.99,
};

// Character limits
export const CUSTOMIZATION_LIMITS = {
  ENGRAVING_MAX_CHARS: 30,
  MONOGRAM_MAX_CHARS: 3,
  ENGRAVING_MAX_LINES: 2,
};

// Font options for engraving
export const ENGRAVING_FONTS = [
  { id: 'classic', name: 'Classic Serif', preview: 'ABC' },
  { id: 'modern', name: 'Modern Sans', preview: 'ABC' },
  { id: 'script', name: 'Script', preview: 'ABC' },
  { id: 'block', name: 'Block Letters', preview: 'ABC' },
];

// ============================================================================
// Customization Options Functions
// ============================================================================

/**
 * Get customization options for a product
 */
export async function getProductCustomizations(productId: number) {
  const customizations = await prisma.productCustomization.findMany({
    where: { productId, isActive: true },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return customizations;
}

/**
 * Get a specific customization option
 */
export async function getCustomizationOption(optionId: string) {
  return prisma.customizationOption.findUnique({
    where: { id: optionId },
    include: {
      customization: true,
    },
  });
}

/**
 * Check if customization combination is valid
 */
export async function validateCustomization(
  productId: number,
  customizations: { type: string; optionId: string }[]
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Get product customization config
  const productConfig = await prisma.productCustomization.findMany({
    where: { productId, isActive: true },
    include: {
      options: true,
    },
  });

  // Check required customizations
  for (const config of productConfig) {
    if (config.required) {
      const hasSelection = customizations.some(
        (c) => c.type === config.type
      );
      if (!hasSelection) {
        errors.push(`${config.type} selection is required`);
      }
    }
  }

  // Validate each customization
  for (const customization of customizations) {
    const config = productConfig.find((c) => c.type === customization.type);
    if (!config) {
      errors.push(`Invalid customization type: ${customization.type}`);
      continue;
    }

    const option = config.options.find((o) => o.id === customization.optionId);
    if (!option) {
      errors.push(`Invalid option for ${customization.type}`);
      continue;
    }

    if (!option.inStock) {
      errors.push(`${option.name} is currently out of stock`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Engraving & Monogram Functions
// ============================================================================

/**
 * Validate engraving text
 */
export function validateEngravingText(
  text: string,
  options?: { maxChars?: number; maxLines?: number }
): { valid: boolean; error?: string } {
  const maxChars = options?.maxChars || CUSTOMIZATION_LIMITS.ENGRAVING_MAX_CHARS;
  const maxLines = options?.maxLines || CUSTOMIZATION_LIMITS.ENGRAVING_MAX_LINES;

  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Engraving text is required' };
  }

  if (text.length > maxChars) {
    return { valid: false, error: `Maximum ${maxChars} characters allowed` };
  }

  const lines = text.split('\n');
  if (lines.length > maxLines) {
    return { valid: false, error: `Maximum ${maxLines} lines allowed` };
  }

  // Check for invalid characters
  const validPattern = /^[a-zA-Z0-9\s.,!?'"-]+$/;
  if (!validPattern.test(text)) {
    return { valid: false, error: 'Only letters, numbers, and basic punctuation allowed' };
  }

  return { valid: true };
}

/**
 * Validate monogram text
 */
export function validateMonogramText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Monogram text is required' };
  }

  if (text.length > CUSTOMIZATION_LIMITS.MONOGRAM_MAX_CHARS) {
    return {
      valid: false,
      error: `Maximum ${CUSTOMIZATION_LIMITS.MONOGRAM_MAX_CHARS} characters allowed`,
    };
  }

  // Only letters
  if (!/^[a-zA-Z]+$/.test(text)) {
    return { valid: false, error: 'Only letters allowed for monogram' };
  }

  return { valid: true };
}

/**
 * Get engraving fonts
 */
export function getEngravingFonts() {
  return ENGRAVING_FONTS;
}

// ============================================================================
// Price Calculation Functions
// ============================================================================

/**
 * Calculate total customization price
 */
export async function calculateCustomizationPrice(
  productId: number,
  customizations: { type: string; optionId: string }[],
  extras?: { engraving?: boolean; monogram?: boolean }
): Promise<number> {
  let total = 0;

  // Get option prices
  for (const customization of customizations) {
    const option = await getCustomizationOption(customization.optionId);
    if (option) {
      total += Number(option.priceModifier) || 0;
    }
  }

  // Add engraving/monogram prices
  if (extras?.engraving) {
    total += CUSTOMIZATION_PRICING.ENGRAVING;
  }
  if (extras?.monogram) {
    total += CUSTOMIZATION_PRICING.MONOGRAM;
  }

  return Number(total.toFixed(2));
}

/**
 * Generate preview data for customized product
 */
export async function generateCustomizationPreview(
  productId: number,
  customizations: { type: string; optionId: string; value?: string }[]
): Promise<{
  previewUrl: string;
  layers: { type: string; image: string }[];
}> {
  // In a real implementation, this would generate/compose images
  // For now, return placeholder data
  const layers: { type: string; image: string }[] = [];

  for (const customization of customizations) {
    const option = await getCustomizationOption(customization.optionId);
    if (option?.image) {
      layers.push({
        type: customization.type,
        image: option.image,
      });
    }
  }

  return {
    previewUrl: `/api/customization/preview/${productId}/${Date.now()}`,
    layers,
  };
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Create product customization type
 */
export async function createProductCustomization(data: {
  productId: number;
  type: string;
  name: string;
  description?: string;
  required: boolean;
  allowMultiple: boolean;
  sortOrder?: number;
}) {
  return prisma.productCustomization.create({
    data: {
      ...data,
      isActive: true,
    },
  });
}

/**
 * Add customization option
 */
export async function addCustomizationOption(data: {
  customizationId: string;
  name: string;
  value: string;
  priceModifier: number;
  image?: string;
  sortOrder?: number;
}) {
  return prisma.customizationOption.create({
    data: {
      ...data,
      inStock: true,
      isActive: true,
    },
  });
}

/**
 * Update customization option
 */
export async function updateCustomizationOption(
  optionId: string,
  data: Partial<{
    name: string;
    value: string;
    priceModifier: number;
    image: string;
    inStock: boolean;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  return prisma.customizationOption.update({
    where: { id: optionId },
    data,
  });
}

/**
 * Get customization analytics
 */
export async function getCustomizationStats() {
  const [
    totalCustomizations,
    popularOptions,
    engravingCount,
    monogramCount,
    revenueFromCustomizations,
  ] = await Promise.all([
    prisma.orderCustomization.count(),
    prisma.orderCustomization.groupBy({
      by: ['optionId'],
      _count: true,
      orderBy: {
        _count: {
          optionId: 'desc',
        },
      },
      take: 10,
    }),
    prisma.orderCustomization.count({
      where: { type: 'ENGRAVING' },
    }),
    prisma.orderCustomization.count({
      where: { type: 'MONOGRAM' },
    }),
    prisma.orderCustomization.aggregate({
      _sum: { priceAdded: true },
    }),
  ]);

  return {
    totalCustomizations,
    popularOptions,
    engravingCount,
    monogramCount,
    revenueFromCustomizations: revenueFromCustomizations._sum.priceAdded || 0,
  };
}
