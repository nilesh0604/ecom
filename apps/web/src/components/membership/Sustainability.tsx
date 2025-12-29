/**
 * Sustainability.tsx
 *
 * DTC Feature 5.7: Sustainability & Impact
 * Patagonia-style sustainability dashboard, carbon offset, impact tracking, and eco badges
 *
 * Components:
 * 1. SustainabilityHero - Brand mission and commitment
 * 2. CarbonOffsetWidget - Carbon offset option at checkout
 * 3. ImpactTracker - Personal environmental impact dashboard
 * 4. EcoBadge - Product sustainability badges
 * 5. SustainableMaterials - Material sourcing information
 * 6. ImpactMilestones - Gamified sustainability achievements
 * 7. RepairProgram - Product repair/care program
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type SustainabilityLevel = 'bronze' | 'silver' | 'gold' | 'platinum';
export type EcoAttribute =
  | 'recycled'
  | 'organic'
  | 'fair-trade'
  | 'carbon-neutral'
  | 'water-saving'
  | 'biodegradable'
  | 'vegan'
  | 'locally-made';

export interface CarbonOffset {
  orderId?: string;
  carbonKg: number;
  offsetCost: number;
  projectName: string;
  projectType: 'reforestation' | 'renewable' | 'ocean' | 'conservation';
  certificateUrl?: string;
}

export interface ImpactMetrics {
  totalCarbonOffset: number;
  treesPlanted: number;
  plasticSaved: number;
  waterSaved: number;
  ordersWithOffset: number;
  sustainableProductsBought: number;
}

export interface SustainabilityMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  metric: keyof ImpactMetrics;
  reward?: string;
  isUnlocked: boolean;
  progress: number;
}

export interface ProductSustainability {
  productId: string;
  level: SustainabilityLevel;
  attributes: EcoAttribute[];
  carbonFootprint: number;
  materials: {
    name: string;
    percentage: number;
    source: string;
    isSustainable: boolean;
  }[];
  certifications: string[];
  repairAvailable: boolean;
}

export interface RepairRequest {
  id: string;
  productName: string;
  productImage: string;
  issueType: string;
  status: 'pending' | 'approved' | 'in-repair' | 'completed' | 'shipped';
  createdAt: Date;
  estimatedCompletion?: Date;
}

// ============================================================================
// Constants
// ============================================================================

const ECO_ATTRIBUTES: Record<
  EcoAttribute,
  { label: string; icon: string; description: string }
> = {
  recycled: {
    label: 'Recycled Materials',
    icon: '♻️',
    description: 'Made with recycled or upcycled materials',
  },
  organic: {
    label: 'Organic',
    icon: '🌱',
    description: 'Made with certified organic materials',
  },
  'fair-trade': {
    label: 'Fair Trade',
    icon: '🤝',
    description: 'Ethically sourced and fair wages guaranteed',
  },
  'carbon-neutral': {
    label: 'Carbon Neutral',
    icon: '🌍',
    description: 'Net-zero carbon footprint product',
  },
  'water-saving': {
    label: 'Water Saving',
    icon: '💧',
    description: 'Produced using water-efficient processes',
  },
  biodegradable: {
    label: 'Biodegradable',
    icon: '🍃',
    description: 'Naturally decomposes without harm',
  },
  vegan: {
    label: 'Vegan',
    icon: '🌿',
    description: 'No animal products or by-products',
  },
  'locally-made': {
    label: 'Locally Made',
    icon: '📍',
    description: 'Manufactured within 100 miles',
  },
};

const SUSTAINABILITY_LEVELS: Record<
  SustainabilityLevel,
  { label: string; color: string; minScore: number }
> = {
  bronze: { label: 'Bronze', color: 'amber', minScore: 1 },
  silver: { label: 'Silver', color: 'slate', minScore: 3 },
  gold: { label: 'Gold', color: 'yellow', minScore: 5 },
  platinum: { label: 'Platinum', color: 'emerald', minScore: 7 },
};

const PROJECT_TYPES = {
  reforestation: { icon: '🌲', label: 'Reforestation' },
  renewable: { icon: '⚡', label: 'Renewable Energy' },
  ocean: { icon: '🌊', label: 'Ocean Conservation' },
  conservation: { icon: '🦁', label: 'Wildlife Conservation' },
};

// ============================================================================
// Components
// ============================================================================

/**
 * SustainabilityHero - Brand mission and commitment banner
 */
export function SustainabilityHero({
  brandName = 'Our Brand',
  mission,
  stats,
  onLearnMore,
  className = '',
}: {
  brandName?: string;
  mission: string;
  stats: { label: string; value: string; icon: string }[];
  onLearnMore?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl overflow-hidden ${className}`}
    >
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🌍</span>
          <h1 className="text-3xl md:text-4xl font-bold">
            {brandName}'s Sustainability Commitment
          </h1>
        </div>

        <p className="text-lg text-white/90 mb-8 max-w-2xl">{mission}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>

        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-100"
          >
            Learn About Our Impact →
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * CarbonOffsetWidget - Carbon offset option at checkout
 */
export function CarbonOffsetWidget({
  carbonKg,
  offsetCost,
  projectName,
  projectType,
  isSelected = false,
  onToggle,
  isLoading = false,
  className = '',
}: {
  carbonKg: number;
  offsetCost: number;
  projectName: string;
  projectType: CarbonOffset['projectType'];
  isSelected?: boolean;
  onToggle?: (selected: boolean) => void;
  isLoading?: boolean;
  className?: string;
}) {
  const project = PROJECT_TYPES[projectType];

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onToggle?.(e.target.checked)}
                disabled={isLoading}
                className="sr-only peer"
              />
              <div className="w-6 h-6 border-2 border-gray-300 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center">
                {isSelected && <span className="text-white text-sm">✓</span>}
              </div>
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{project.icon}</span>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Offset Your Carbon Footprint
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              This order produces approximately{' '}
              <strong>{carbonKg.toFixed(1)} kg CO₂</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {project.label}: {projectName}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            +${offsetCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            to offset
          </p>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            🌱 Thank you! You're helping make this order carbon neutral.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * ImpactTracker - Personal environmental impact dashboard
 */
export function ImpactTracker({
  metrics,
  className = '',
}: {
  metrics: ImpactMetrics;
  className?: string;
}) {
  const impactCards = [
    {
      icon: '🌲',
      value: metrics.treesPlanted,
      label: 'Trees Planted',
      unit: 'trees',
      color: 'emerald',
    },
    {
      icon: '☁️',
      value: metrics.totalCarbonOffset,
      label: 'Carbon Offset',
      unit: 'kg CO₂',
      color: 'blue',
    },
    {
      icon: '🚯',
      value: metrics.plasticSaved,
      label: 'Plastic Saved',
      unit: 'kg',
      color: 'cyan',
    },
    {
      icon: '💧',
      value: metrics.waterSaved,
      label: 'Water Saved',
      unit: 'liters',
      color: 'sky',
    },
  ];

  return (
    <div className={className}>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        🌍 Your Environmental Impact
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {impactCards.map((card, index) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center"
          >
            <span className="text-4xl mb-3 block">{card.icon}</span>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {card.value.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {card.unit}
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
        <p className="text-emerald-800 dark:text-emerald-200">
          🎉 You've made <strong>{metrics.ordersWithOffset}</strong> orders with carbon offset
          and purchased <strong>{metrics.sustainableProductsBought}</strong> sustainable products!
        </p>
      </div>
    </div>
  );
}

/**
 * EcoBadge - Product sustainability badge display
 */
export function EcoBadge({
  attributes,
  level,
  size = 'default',
  showTooltip = true,
  className = '',
}: {
  attributes: EcoAttribute[];
  level?: SustainabilityLevel;
  size?: 'compact' | 'default' | 'large';
  showTooltip?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    compact: {
      container: 'gap-1',
      badge: 'px-1.5 py-0.5 text-xs',
      icon: 'text-sm',
    },
    default: {
      container: 'gap-2',
      badge: 'px-2 py-1 text-sm',
      icon: 'text-lg',
    },
    large: {
      container: 'gap-3',
      badge: 'px-3 py-2 text-base',
      icon: 'text-2xl',
    },
  };

  const sizes = sizeClasses[size];

  if (attributes.length === 0) return null;

  return (
    <div className={`flex flex-wrap ${sizes.container} ${className}`}>
      {level && (
        <span
          className={`inline-flex items-center gap-1 ${sizes.badge} rounded-full font-medium bg-${SUSTAINABILITY_LEVELS[level].color}-100 text-${SUSTAINABILITY_LEVELS[level].color}-700 dark:bg-${SUSTAINABILITY_LEVELS[level].color}-900/30 dark:text-${SUSTAINABILITY_LEVELS[level].color}-400`}
        >
          🏅 {SUSTAINABILITY_LEVELS[level].label}
        </span>
      )}

      {attributes.map((attr) => {
        const config = ECO_ATTRIBUTES[attr];
        return (
          <span
            key={attr}
            title={showTooltip ? config.description : undefined}
            className={`inline-flex items-center gap-1 ${sizes.badge} rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default`}
          >
            <span className={sizes.icon}>{config.icon}</span>
            {size !== 'compact' && config.label}
          </span>
        );
      })}
    </div>
  );
}

/**
 * SustainableMaterials - Material sourcing information
 */
export function SustainableMaterials({
  materials,
  certifications,
  carbonFootprint,
  className = '',
}: {
  materials: ProductSustainability['materials'];
  certifications: string[];
  carbonFootprint: number;
  className?: string;
}) {
  const sustainablePercentage = materials.reduce(
    (total, m) => (m.isSustainable ? total + m.percentage : total),
    0
  );

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          🌿 Materials & Sourcing
        </h4>
      </div>

      <div className="p-4">
        {/* Materials Breakdown */}
        <div className="space-y-3 mb-4">
          {materials.map((material, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {material.isSustainable && <span className="text-emerald-500">✓</span>}
                  {material.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {material.percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    material.isSustainable
                      ? 'bg-emerald-500'
                      : 'bg-gray-400 dark:bg-gray-500'
                  }`}
                  style={{ width: `${material.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Source: {material.source}
              </p>
            </div>
          ))}
        </div>

        {/* Sustainable Percentage */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg mb-4">
          <p className="text-emerald-800 dark:text-emerald-200 text-sm">
            <strong>{sustainablePercentage}%</strong> sustainable materials
          </p>
        </div>

        {/* Carbon Footprint */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Carbon Footprint
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {carbonFootprint} kg CO₂
          </span>
        </div>

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Certifications
            </p>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ImpactMilestones - Gamified sustainability achievements
 */
export function ImpactMilestones({
  milestones,
  onClaim,
  className = '',
}: {
  milestones: SustainabilityMilestone[];
  onClaim?: (milestoneId: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        🏆 Sustainability Milestones
      </h3>

      <div className="space-y-3">
        {milestones.map((milestone) => {
          const progressPercent = Math.min(
            100,
            (milestone.progress / milestone.requirement) * 100
          );

          return (
            <div
              key={milestone.id}
              className={`p-4 rounded-xl border transition-all ${
                milestone.isUnlocked
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`text-3xl ${
                      milestone.isUnlocked ? '' : 'opacity-50 grayscale'
                    }`}
                  >
                    {milestone.icon}
                  </span>
                  <div>
                    <h4
                      className={`font-semibold ${
                        milestone.isUnlocked
                          ? 'text-emerald-800 dark:text-emerald-200'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {milestone.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {milestone.description}
                    </p>

                    {!milestone.isUnlocked && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>
                            {milestone.progress} / {milestone.requirement}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {milestone.isUnlocked && milestone.reward && (
                  <button
                    onClick={() => onClaim?.(milestone.id)}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
                  >
                    Claim Reward
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * RepairProgram - Product repair/care program
 */
export function RepairProgram({
  isEligible,
  onStartRepair,
  existingRequests = [],
  className = '',
}: {
  isEligible: boolean;
  onStartRepair?: () => void;
  existingRequests?: RepairRequest[];
  className?: string;
}) {
  const benefits = [
    { icon: '🔧', text: 'Expert repairs by skilled artisans' },
    { icon: '📦', text: 'Free shipping both ways' },
    { icon: '♻️', text: 'Extends product life, reduces waste' },
    { icon: '💰', text: 'Fraction of replacement cost' },
  ];

  const getStatusColor = (status: RepairRequest['status']) => {
    const colors = {
      pending: 'yellow',
      approved: 'blue',
      'in-repair': 'purple',
      completed: 'green',
      shipped: 'emerald',
    };
    return colors[status];
  };

  return (
    <div className={className}>
      {/* Program Overview */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl mb-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🔧</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Repair & Care Program
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Don't throw it away — repair it! We believe in products that last.
              Our expert craftspeople can restore your items to like-new condition.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span>{benefit.icon}</span>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            {isEligible ? (
              <button
                onClick={onStartRepair}
                className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700"
              >
                Request a Repair →
              </button>
            ) : (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Purchase a product to access our repair program.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Existing Repair Requests */}
      {existingRequests.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Your Repair Requests
            </h4>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {existingRequests.map((request) => (
              <div key={request.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={request.productImage}
                    alt={request.productName}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {request.productName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {request.issueType}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(request.status)}-100 text-${getStatusColor(request.status)}-700 dark:bg-${getStatusColor(request.status)}-900/30 dark:text-${getStatusColor(request.status)}-400`}
                  >
                    {request.status.replace('-', ' ')}
                  </span>
                  {request.estimatedCompletion && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Est. {request.estimatedCompletion.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SustainabilityPledge - Customer pledge/commitment widget
 */
export function SustainabilityPledge({
  hasPledged = false,
  onPledge,
  pledgeCount,
  className = '',
}: {
  hasPledged?: boolean;
  onPledge?: () => void;
  pledgeCount?: number;
  className?: string;
}) {
  const pledgeItems = [
    'Offset carbon on all my orders',
    'Choose sustainable products when available',
    'Repair before replacing',
    'Recycle packaging responsibly',
  ];

  if (hasPledged) {
    return (
      <div
        className={`p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center ${className}`}
      >
        <span className="text-5xl mb-4 block">🌱</span>
        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
          You've Taken the Pledge!
        </h3>
        <p className="text-emerald-700 dark:text-emerald-300">
          Thank you for committing to a more sustainable shopping experience.
        </p>
        {pledgeCount && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
            Join {pledgeCount.toLocaleString()} others who've pledged!
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}
    >
      <div className="text-center mb-6">
        <span className="text-5xl mb-4 block">🌍</span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Take the Sustainability Pledge
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Commit to making eco-conscious choices with every purchase.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {pledgeItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            <span className="text-emerald-500">✓</span>
            <span className="text-gray-700 dark:text-gray-300">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onPledge}
        className="w-full px-6 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700"
      >
        🌱 I Take the Pledge
      </button>

      {pledgeCount && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          Join {pledgeCount.toLocaleString()} others who've pledged!
        </p>
      )}
    </div>
  );
}

export default {
  SustainabilityHero,
  CarbonOffsetWidget,
  ImpactTracker,
  EcoBadge,
  SustainableMaterials,
  ImpactMilestones,
  RepairProgram,
  SustainabilityPledge,
  ECO_ATTRIBUTES,
  SUSTAINABILITY_LEVELS,
};
