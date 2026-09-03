export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "EventAtlas";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const ROLES = {
  USER: "USER",
  ORGANIZER: "ORGANIZER",
  ADMIN: "ADMIN",
} as const;

export const EVENT_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  FINISHED: "FINISHED",
} as const;

export const REGISTRATION_STATUS = {
  INTERESTED: "INTERESTED",
  GOING: "GOING",
  MAYBE: "MAYBE",
  CANCELLED: "CANCELLED",
} as const;

export const CATEGORIES = [
  { name: "Music", slug: "music", icon: "music", color: "#8b5cf6" },
  { name: "Sports", slug: "sports", icon: "trophy", color: "#22c55e" },
  { name: "Business", slug: "business", icon: "briefcase", color: "#3b82f6" },
  { name: "Technology", slug: "technology", icon: "cpu", color: "#6366f1" },
  { name: "Education", slug: "education", icon: "graduation-cap", color: "#f59e0b" },
  { name: "Food and Drink", slug: "food-and-drink", icon: "utensils", color: "#ef4444" },
  { name: "Arts and Culture", slug: "arts-and-culture", icon: "palette", color: "#ec4899" },
  { name: "Festivals", slug: "festivals", icon: "party-popper", color: "#f97316" },
  { name: "Networking", slug: "networking", icon: "users", color: "#14b8a6" },
  { name: "Health and Wellness", slug: "health-and-wellness", icon: "heart", color: "#06b6d4" },
  { name: "Family and Children", slug: "family-and-children", icon: "baby", color: "#a855f7" },
  { name: "Travel", slug: "travel", icon: "plane", color: "#0ea5e9" },
  { name: "Nightlife", slug: "nightlife", icon: "moon", color: "#7c3aed" },
  { name: "Free Events", slug: "free-events", icon: "gift", color: "#10b981" },
  { name: "Other", slug: "other", icon: "calendar", color: "#6b7280" },
] as const;

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
] as const;

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export const ITEMS_PER_PAGE = 12;
