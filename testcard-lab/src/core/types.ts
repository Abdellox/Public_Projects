export type ScenarioId =
  | "success"
  | "declined"
  | "insufficient-funds"
  | "expired-card"
  | "incorrect-cvc"
  | "avs-mismatch"
  | "3ds-required"
  | "card-not-supported"
  | "processing-error"
  | "refunded";

export interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  /** Expected outcome indicator color (maps to tailwind classes in the UI layer) */
  outcome: "success" | "declined" | "warning" | "info";
  /** Specific card numbers per provider, keyed by scenario */
  cardNumbers?: string[];
}

export interface Provider {
  id: string;
  name: string;
  brandColor: string;
  docsUrl: string;
  sandboxUrl: string;
  modes: string[];
  description: string;
  scenarios: Scenario[];
  /** All documented sandbox card numbers regardless of scenario */
  documentedCards: Record<string, string[]>;
  notes?: string;
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface GeneratedTestData {
  id: string;
  provider: Provider["id"];
  providerName: string;
  scenario: ScenarioId;
  scenarioLabel: string;
  customer: CustomerData;
  /** Only includes sandbox/test card info when officially documented by provider */
  card: {
    number: string | null;
    expiry: string;
    cvc: string;
    brand: string;
    isDocumented: boolean;
  } | null;
  expectedResult: string;
  docsUrl: string;
  sandboxUrl: string;
  generatedAt: string;
  safety: {
    sandboxOnly: true;
    disclaimer: string;
  };
}
