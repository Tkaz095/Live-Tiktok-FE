// ====== SUBSCRIPTION TIERS ======
export type SubscriptionTier = "free" | "plus" | "pro";

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  label: string;
  badge: string;
  maxColumns: number; // -1 = unlimited
  color: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionInfo> = {
  free: {
    tier: "free",
    label: "Free",
    badge: "",
    maxColumns: 3,
    color: "#9ca3af",
    features: ["3 Live monitors", "Chat tracking", "Basic stats"],
  },
  plus: {
    tier: "plus",
    label: "Plus",
    badge: "⚡",
    maxColumns: 5,
    color: "#25f4ee",
    features: ["5 Live monitors", "Gift tracking", "All stats", "Priority updates"],
  },
  pro: {
    tier: "pro",
    label: "Pro",
    badge: "👑",
    maxColumns: 15,
    color: "#fce14b",
    features: ["15 Live monitors", "Gift & coin tracking", "Analytics", "Priority support"],
  },
};

// ====== USER MODEL ======
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role_id: number; // 1 = admin, 2 = customer
  subscription: SubscriptionTier;
}

// ====== API BASE ======
export const API_BASE = "http://localhost:4000/api/v1";
