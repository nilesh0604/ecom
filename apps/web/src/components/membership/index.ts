/**
 * Membership Module Exports
 * 
 * DTC Features:
 * - 5.1 Membership Program (Nike Model)
 * - 5.2 Subscription Model (Harry's Model)
 * - 5.7 Sustainability & Impact (Patagonia Model)
 * - 6.1 Loyalty Points / Rewards
 * - 6.2 Referral Program
 * - 6.4 Trade-In Program (Apple Model)
 */

// Membership Program Components
export {
    BirthdayReward,
    EarlyAccessBanner, MemberBadge, MemberBenefits,
    MemberPriceDisplay, MembershipBanner, MembershipSignupForm
} from './MembershipProgram';

export type {
    BirthdayRewardData,
    EarlyAccessData, MemberBenefit,
    MemberPricing, MembershipTier
} from './MembershipProgram';

// Subscription Model Components
export {
    FrequencySelector, SmartReorderReminder, StarterKitCard, SubscribeAndSave, SubscriptionBadge,
    SubscriptionManagement,
    UpcomingDelivery, useSubscriptionToggle
} from './SubscriptionModel';

export type {
    StarterKit, Subscription, SubscriptionFrequency,
    SubscriptionProduct, UpcomingDeliveryData
} from './SubscriptionModel';

// Loyalty Program Components (6.1)
export {
    EarnPointsCard,
    LoyaltyDashboard,
    PointsBalance,
    PointsExpirationWarning,
    PointsHistory,
    RedeemPoints, TIER_CONFIG, TierBenefits,
    TierProgress
} from './LoyaltyProgram';

export type {
    EarnOpportunity,
    LoyaltyAccount,
    LoyaltyTier,
    LoyaltyTierConfig,
    PointsTransaction
} from './LoyaltyProgram';

// Referral Program Components (6.2)
export {
    ReferralCodeCard,
    ReferralDashboard,
    ReferralHistory,
    ReferralInviteForm,
    ReferralLeaderboard,
    ReferralRewardsBanner,
    ReferralShareButtons,
    ReferralSignupBanner,
    ReferralStats
} from './ReferralProgram';

export type {
    LeaderboardEntry,
    Referral,
    ReferralAccount,
    ReferralReward,
    ReferralStatus
} from './ReferralProgram';

// Trade-In Program Components (6.4)
export {
    CONDITION_CONFIG,
    ConditionQuiz,
    ProductSelector,
    STATUS_CONFIG,
    TradeInEstimate,
    TradeInHero,
    TradeInHistory,
    TradeInStatus,
    TradeInSubmission,
    TradeInValueCalculator
} from './TradeInProgram';

export type {
    ConditionQuestion,
    ProductSustainability,
    TradeInCondition,
    TradeInEstimateData,
    TradeInProduct,
    TradeInRequest,
    TradeInStatus as TradeInStatusType
} from './TradeInProgram';

// Sustainability Components (5.7)
export {
    CarbonOffsetWidget,
    ECO_ATTRIBUTES,
    EcoBadge,
    ImpactMilestones,
    ImpactTracker,
    RepairProgram,
    SUSTAINABILITY_LEVELS,
    SustainabilityHero,
    SustainabilityPledge,
    SustainableMaterials
} from './Sustainability';

export type {
    CarbonOffset,
    EcoAttribute,
    ImpactMetrics,
    RepairRequest,
    SustainabilityLevel,
    SustainabilityMilestone
} from './Sustainability';

