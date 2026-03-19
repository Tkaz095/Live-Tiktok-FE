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
    features: ["Theo dõi 3 Live đồng thời", "Theo dõi Chat", "Thống kê cơ bản"],
  },
  plus: {
    tier: "plus",
    label: "Plus",
    badge: "⚡",
    maxColumns: 5,
    color: "#25f4ee",
    features: ["Theo dõi 5 Live đồng thời", "Theo dõi Quà tặng", "Tất cả thống kê", "Cập nhật ưu tiên"],
  },
  pro: {
    tier: "pro",
    label: "Pro",
    badge: "👑",
    maxColumns: 15,
    color: "#fce14b",
    features: ["Theo dõi 15 Live đồng thời", "Theo dõi Quà tặng & Xu", "Phân tích nâng cao", "Hỗ trợ ưu tiên"],
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
export const API_BASE = "http://localhost:4001/api/v1";
