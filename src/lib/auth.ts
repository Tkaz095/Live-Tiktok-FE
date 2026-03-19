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
    maxColumns: 1,
    color: "#9ca3af",
    features: ["1 Live monitor", "Chat tracking", "Basic stats"],
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
    maxColumns: 10,
    color: "#fce14b",
    features: ["10 Live monitors", "Gift & coin tracking", "Analytics", "Priority support"],
  },
};

// ====== USER MODEL ======
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscription: SubscriptionTier;
}

// ====== MOCK ACCOUNTS ======
const MOCK_ACCOUNTS: Array<User & { password: string }> = [
  {
    id: "user-free-1",
    name: "Nguyễn Văn A",
    email: "free@demo.com",
    password: "demo123",
    avatar: "https://api.dicebear.com/8.x/thumbs/svg?seed=free&backgroundColor=0d1117",
    subscription: "free",
  },
  {
    id: "user-plus-1",
    name: "Trần Thị B",
    email: "plus@demo.com",
    password: "demo123",
    avatar: "https://api.dicebear.com/8.x/thumbs/svg?seed=plus&backgroundColor=0d1117",
    subscription: "plus",
  },
  {
    id: "user-pro-1",
    name: "Lê Minh C",
    email: "pro@demo.com",
    password: "demo123",
    avatar: "https://api.dicebear.com/8.x/thumbs/svg?seed=pro&backgroundColor=0d1117",
    subscription: "pro",
  },
];

// Runtime registered accounts (in-memory only)
const registeredAccounts: Array<User & { password: string }> = [];

// ====== AUTH FUNCTIONS ======
export function login(email: string, password: string): User | null {
  const all = [...MOCK_ACCOUNTS, ...registeredAccounts];
  const account = all.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  if (!account) return null;
  const { password: _pw, ...user } = account;
  return user;
}

export function register(
  name: string,
  email: string,
  password: string,
  tier: SubscriptionTier = "free"
): { success: boolean; error?: string } {
  const all = [...MOCK_ACCOUNTS, ...registeredAccounts];
  if (all.find((a) => a.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "Email này đã được sử dụng." };
  }
  registeredAccounts.push({
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    avatar: `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(email)}&backgroundColor=0d1117`,
    subscription: tier,
  });
  return { success: true };
}

export const DEMO_ACCOUNTS = MOCK_ACCOUNTS.map(({ password: _pw, ...u }) => ({
  ...u,
  password: "demo123",
}));
