/**
 * Sustainability Service
 * 
 * DTC Feature 5.7: Sustainability Features
 * Handles carbon offsets, impact tracking, eco-badges, repair program
 */

import { CarbonOffsetStatus, PrismaClient, RepairStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Types
// ============================================================================

export interface CarbonProject {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  pricePerTon: number;
  image: string;
  certifications: string[];
}

export interface ImpactData {
  totalCarbonOffset: number;
  treesEquivalent: number;
  milesNotDriven: number;
  plasticBottlesSaved: number;
  waterSaved: number;
  sustainableProductsPurchased: number;
}

export interface RepairRequestInput {
  userId: number;
  productName: string;
  purchaseDate: Date;
  issueDescription: string;
  preferredContactMethod: 'EMAIL' | 'PHONE';
  contactInfo: string;
}

// ============================================================================
// Constants
// ============================================================================

// Carbon offset projects
export const CARBON_PROJECTS: CarbonProject[] = [
  {
    id: 'rainforest-protection',
    name: 'Amazon Rainforest Protection',
    description: 'Protect endangered rainforest and support indigenous communities',
    type: 'FOREST_CONSERVATION',
    location: 'Brazil',
    pricePerTon: 15,
    image: '/images/projects/amazon.jpg',
    certifications: ['VCS', 'CCB Gold'],
  },
  {
    id: 'wind-farm',
    name: 'Wind Energy Project',
    description: 'Clean wind energy replacing coal power plants',
    type: 'RENEWABLE_ENERGY',
    location: 'India',
    pricePerTon: 12,
    image: '/images/projects/wind.jpg',
    certifications: ['Gold Standard'],
  },
  {
    id: 'ocean-cleanup',
    name: 'Ocean Plastic Cleanup',
    description: 'Remove plastic from oceans and recycle into products',
    type: 'OCEAN_CLEANUP',
    location: 'Pacific Ocean',
    pricePerTon: 20,
    image: '/images/projects/ocean.jpg',
    certifications: ['Ocean Steward'],
  },
  {
    id: 'tree-planting',
    name: 'Reforestation Initiative',
    description: 'Plant native trees and restore degraded lands',
    type: 'REFORESTATION',
    location: 'Kenya',
    pricePerTon: 10,
    image: '/images/projects/trees.jpg',
    certifications: ['VCS', 'CCB'],
  },
  {
    id: 'biogas',
    name: 'Biogas Energy',
    description: 'Convert agricultural waste to clean energy',
    type: 'METHANE_CAPTURE',
    location: 'Thailand',
    pricePerTon: 8,
    image: '/images/projects/biogas.jpg',
    certifications: ['Gold Standard'],
  },
];

// Impact conversion factors
const IMPACT_FACTORS = {
  treesPerTon: 50, // Trees planted equivalent per ton CO2
  milesPerTon: 2500, // Car miles not driven per ton CO2
  bottlesPerDollar: 2, // Plastic bottles saved per $1 eco purchase
  gallonsWaterPerDollar: 5, // Water saved per $1 eco purchase
};

// Sustainability milestones
export const MILESTONES = [
  { id: 'first-offset', name: 'Climate Pioneer', description: 'Made your first carbon offset', threshold: 0.1, icon: '🌱' },
  { id: 'one-ton', name: 'Ton Tackler', description: 'Offset 1 ton of carbon', threshold: 1, icon: '🌿' },
  { id: 'five-tons', name: 'Carbon Crusher', description: 'Offset 5 tons of carbon', threshold: 5, icon: '🌲' },
  { id: 'ten-tons', name: 'Planet Protector', description: 'Offset 10 tons of carbon', threshold: 10, icon: '🌍' },
  { id: 'first-sustainable', name: 'Conscious Consumer', description: 'Purchased first sustainable product', threshold: 1, icon: '♻️', type: 'purchase' },
  { id: 'five-sustainable', name: 'Eco Champion', description: 'Purchased 5 sustainable products', threshold: 5, icon: '🏆', type: 'purchase' },
  { id: 'repair-advocate', name: 'Repair Advocate', description: 'Used repair program instead of replacing', threshold: 1, icon: '🔧', type: 'repair' },
  { id: 'pledge-taken', name: 'Pledge Maker', description: 'Took the sustainability pledge', threshold: 1, icon: '✊', type: 'pledge' },
];

// ============================================================================
// Carbon Offset Functions
// ============================================================================

/**
 * Get all available carbon offset projects
 */
export function getCarbonProjects(): CarbonProject[] {
  return CARBON_PROJECTS;
}

/**
 * Get a specific carbon project
 */
export function getCarbonProject(projectId: string): CarbonProject | undefined {
  return CARBON_PROJECTS.find((p) => p.id === projectId);
}

/**
 * Calculate carbon offset price
 */
export function calculateOffsetPrice(
  projectId: string,
  tonsCO2: number
): { price: number; project: CarbonProject } | null {
  const project = getCarbonProject(projectId);
  if (!project) return null;

  return {
    price: project.pricePerTon * tonsCO2,
    project,
  };
}

/**
 * Create a carbon offset purchase
 */
export async function purchaseCarbonOffset(
  userId: number,
  projectId: string,
  tonsCO2: number,
  orderId?: number
) {
  const project = getCarbonProject(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const amount = project.pricePerTon * tonsCO2;

  const offset = await prisma.carbonOffset.create({
    data: {
      userId,
      orderId,
      projectType: project.type as any,
      projectName: project.name,
      tonsCO2,
      amount,
      status: 'COMPLETED',
      certificateUrl: `/certificates/carbon-${Date.now()}.pdf`,
      offsetDate: new Date(),
    },
  });

  // Update user impact metrics
  await updateUserImpact(userId, {
    carbonOffsetAdded: tonsCO2,
  });

  // Check for milestone achievements
  await checkCarbonMilestones(userId);

  return offset;
}

/**
 * Get user's carbon offset history
 */
export async function getUserCarbonOffsets(userId: number) {
  return prisma.carbonOffset.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get user's total carbon offset
 */
export async function getUserTotalOffset(userId: number): Promise<number> {
  const result = await prisma.carbonOffset.aggregate({
    where: {
      userId,
      status: 'COMPLETED',
    },
    _sum: {
      tonsCO2: true,
    },
  });

  return result._sum.tonsCO2 || 0;
}

// ============================================================================
// Impact Tracking Functions
// ============================================================================

/**
 * Get or create user impact metrics
 */
export async function getOrCreateUserImpact(userId: number) {
  let impact = await prisma.userImpactMetrics.findUnique({
    where: { userId },
  });

  if (!impact) {
    impact = await prisma.userImpactMetrics.create({
      data: {
        userId,
        totalCarbonOffset: 0,
        treesEquivalent: 0,
        plasticSaved: 0,
        waterSaved: 0,
        sustainablePurchases: 0,
        repairsSaved: 0,
      },
    });
  }

  return impact;
}

/**
 * Update user impact metrics
 */
export async function updateUserImpact(
  userId: number,
  updates: {
    carbonOffsetAdded?: number;
    sustainablePurchaseAdded?: number;
    repairAdded?: boolean;
  }
) {
  const current = await getOrCreateUserImpact(userId);

  const newCarbonOffset =
    Number(current.totalCarbonOffset) + (updates.carbonOffsetAdded || 0);
  const newSustainablePurchases =
    current.sustainablePurchases + (updates.sustainablePurchaseAdded || 0);
  const newRepairs = current.repairsSaved + (updates.repairAdded ? 1 : 0);

  return prisma.userImpactMetrics.update({
    where: { userId },
    data: {
      totalCarbonOffset: newCarbonOffset,
      treesEquivalent: Math.round(newCarbonOffset * IMPACT_FACTORS.treesPerTon),
      plasticSaved: newSustainablePurchases * IMPACT_FACTORS.bottlesPerDollar,
      waterSaved: newSustainablePurchases * IMPACT_FACTORS.gallonsWaterPerDollar,
      sustainablePurchases: newSustainablePurchases,
      repairsSaved: newRepairs,
      lastUpdated: new Date(),
    },
  });
}

/**
 * Get user impact dashboard data
 */
export async function getUserImpactDashboard(userId: number): Promise<ImpactData> {
  const impact = await getOrCreateUserImpact(userId);

  return {
    totalCarbonOffset: Number(impact.totalCarbonOffset),
    treesEquivalent: impact.treesEquivalent,
    milesNotDriven: Math.round(
      Number(impact.totalCarbonOffset) * IMPACT_FACTORS.milesPerTon
    ),
    plasticBottlesSaved: impact.plasticSaved,
    waterSaved: impact.waterSaved,
    sustainableProductsPurchased: impact.sustainablePurchases,
  };
}

// ============================================================================
// Milestones Functions
// ============================================================================

/**
 * Get all available milestones
 */
export function getAllMilestones() {
  return MILESTONES;
}

/**
 * Get user's achieved milestones
 */
export async function getUserMilestones(userId: number) {
  return prisma.userMilestone.findMany({
    where: { userId },
    include: {
      milestone: true,
    },
    orderBy: { achievedAt: 'desc' },
  });
}

/**
 * Check and award carbon offset milestones
 */
async function checkCarbonMilestones(userId: number) {
  const totalOffset = await getUserTotalOffset(userId);
  const carbonMilestones = MILESTONES.filter((m) => !m.type);

  for (const milestone of carbonMilestones) {
    if (totalOffset >= milestone.threshold) {
      await awardMilestone(userId, milestone.id);
    }
  }
}

/**
 * Award a milestone to user
 */
export async function awardMilestone(userId: number, milestoneId: string) {
  // Check if milestone exists in database
  let milestone = await prisma.sustainabilityMilestone.findUnique({
    where: { id: milestoneId },
  });

  if (!milestone) {
    const milestoneData = MILESTONES.find((m) => m.id === milestoneId);
    if (!milestoneData) return null;

    milestone = await prisma.sustainabilityMilestone.create({
      data: {
        id: milestoneId,
        name: milestoneData.name,
        description: milestoneData.description,
        icon: milestoneData.icon,
        threshold: milestoneData.threshold,
      },
    });
  }

  // Check if user already has this milestone
  const existing = await prisma.userMilestone.findUnique({
    where: {
      userId_milestoneId: {
        userId,
        milestoneId,
      },
    },
  });

  if (existing) return existing;

  // Award milestone
  return prisma.userMilestone.create({
    data: {
      userId,
      milestoneId,
    },
    include: {
      milestone: true,
    },
  });
}

// ============================================================================
// Product Sustainability Functions
// ============================================================================

/**
 * Get product sustainability info
 */
export async function getProductSustainability(productId: number) {
  return prisma.productSustainability.findUnique({
    where: { productId },
    include: {
      materials: true,
    },
  });
}

/**
 * Create or update product sustainability info
 */
export async function setProductSustainability(
  productId: number,
  data: {
    sustainabilityLevel: string;
    carbonFootprint?: number;
    recyclablePercentage?: number;
    ecoAttributes?: string[];
    sustainabilityDescription?: string;
  }
) {
  return prisma.productSustainability.upsert({
    where: { productId },
    create: {
      productId,
      sustainabilityLevel: data.sustainabilityLevel as any,
      carbonFootprint: data.carbonFootprint,
      recyclablePercentage: data.recyclablePercentage,
      ecoAttributes: data.ecoAttributes || [],
      sustainabilityDescription: data.sustainabilityDescription,
    },
    update: {
      sustainabilityLevel: data.sustainabilityLevel as any,
      carbonFootprint: data.carbonFootprint,
      recyclablePercentage: data.recyclablePercentage,
      ecoAttributes: data.ecoAttributes,
      sustainabilityDescription: data.sustainabilityDescription,
    },
  });
}

/**
 * Get sustainable products
 */
export async function getSustainableProducts(
  minLevel: string = 'GOOD',
  limit: number = 20
) {
  const levelOrder = ['BASIC', 'GOOD', 'EXCELLENT', 'EXCEPTIONAL'];
  const minLevelIndex = levelOrder.indexOf(minLevel);
  const eligibleLevels = levelOrder.slice(minLevelIndex);

  return prisma.productSustainability.findMany({
    where: {
      sustainabilityLevel: {
        in: eligibleLevels as any[],
      },
    },
    include: {
      product: true,
      materials: true,
    },
    take: limit,
  });
}

// ============================================================================
// Repair Program Functions
// ============================================================================

/**
 * Create a repair request
 */
export async function createRepairRequest(input: RepairRequestInput) {
  const repair = await prisma.repairRequest.create({
    data: {
      userId: input.userId,
      productName: input.productName,
      purchaseDate: input.purchaseDate,
      issueDescription: input.issueDescription,
      status: 'SUBMITTED',
    },
  });

  // Award repair milestone
  await awardMilestone(input.userId, 'repair-advocate');

  // Update impact metrics
  await updateUserImpact(input.userId, { repairAdded: true });

  return repair;
}

/**
 * Get user's repair requests
 */
export async function getUserRepairRequests(userId: number) {
  return prisma.repairRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get repair request by ID
 */
export async function getRepairRequest(requestId: string) {
  return prisma.repairRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

/**
 * Update repair request status
 */
export async function updateRepairStatus(
  requestId: string,
  status: RepairStatus,
  data?: {
    estimatedCost?: number;
    diagnosis?: string;
    repairNotes?: string;
    completedAt?: Date;
  }
) {
  return prisma.repairRequest.update({
    where: { id: requestId },
    data: {
      status,
      ...data,
    },
  });
}

/**
 * Get all repair requests (admin)
 */
export async function getAllRepairRequests(options?: {
  status?: RepairStatus;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const where = options?.status ? { status: options.status } : {};

  const [requests, total] = await Promise.all([
    prisma.repairRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.repairRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// ============================================================================
// Sustainability Pledge Functions
// ============================================================================

/**
 * Take sustainability pledge
 */
export async function takePledge(userId: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      sustainabilityPledge: true,
    },
  });

  // Award pledge milestone
  await awardMilestone(userId, 'pledge-taken');

  return user;
}

/**
 * Check if user has taken pledge
 */
export async function hasTakenPledge(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sustainabilityPledge: true },
  });

  return user?.sustainabilityPledge || false;
}

// ============================================================================
// Stats Functions
// ============================================================================

/**
 * Get global sustainability stats
 */
export async function getGlobalStats() {
  const [
    totalCarbonOffset,
    totalOffsets,
    totalRepairs,
    totalPledges,
    projectBreakdown,
  ] = await Promise.all([
    prisma.carbonOffset.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { tonsCO2: true },
    }),
    prisma.carbonOffset.count({ where: { status: 'COMPLETED' } }),
    prisma.repairRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.user.count({ where: { sustainabilityPledge: true } }),
    prisma.carbonOffset.groupBy({
      by: ['projectType'],
      where: { status: 'COMPLETED' },
      _sum: { tonsCO2: true },
      _count: true,
    }),
  ]);

  return {
    totalCarbonOffset: totalCarbonOffset._sum.tonsCO2 || 0,
    treesEquivalent: Math.round(
      (Number(totalCarbonOffset._sum.tonsCO2) || 0) * IMPACT_FACTORS.treesPerTon
    ),
    totalOffsets,
    totalRepairs,
    totalPledges,
    projectBreakdown: projectBreakdown.map((p) => ({
      type: p.projectType,
      tonsCO2: p._sum.tonsCO2,
      count: p._count,
    })),
  };
}

/**
 * Calculate order carbon footprint estimate
 */
export function estimateOrderCarbonFootprint(
  shippingDistance: number,
  productWeight: number,
  packagingType: 'STANDARD' | 'ECO' = 'STANDARD'
): number {
  // Simplified calculation
  const transportEmissions = shippingDistance * 0.0002 * productWeight; // kg CO2 per km per kg
  const packagingEmissions = packagingType === 'ECO' ? 0.1 : 0.3; // kg CO2

  return Number((transportEmissions + packagingEmissions).toFixed(2));
}
