import { getProvider } from "./providers";
import type { CustomerData, GeneratedTestData } from "./types";
import { providers } from "./providers";

/**
 * Synthetic customer data generator.
 *
 * Generates realistic-looking, but entirely fictional customer information
 * for use in automated tests against sandbox environments. It never
 * produces real personal data or real card numbers.
 */

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Casey",
  "Morgan",
  "Taylor",
  "Riley",
  "Avery",
  "Sam",
  "Quinn",
  "Jamie",
  "Drew",
  "Parker",
  "Skyler",
  "Reese",
  "Cameron",
  "Logan",
  "Rowan",
  "Sage",
  "Finley",
  "Elliot",
];

const LAST_NAMES = [
  "Testington",
  "Sanderson",
  "Mockwell",
  "Fakerton",
  "Fixture",
  "Sandbox",
  "Devlin",
  "Tester",
  "Qa",
  "Staged",
  "Preview",
  "Simulacra",
  "Doppel",
  "Placeholder",
  "Sample",
  "Mockson",
  "Fixtureton",
  "Dummy",
  "Benchmark",
  "Probe",
];

const CITIES = [
  { city: "Testville", state: "CA", zip: "90210", country: "US" },
  { city: "Mockton", state: "NY", zip: "10001", country: "US" },
  { city: "Sandbox City", state: "TX", zip: "75001", country: "US" },
  { city: "Devburg", state: "WA", zip: "98101", country: "US" },
  { city: "Fixture Falls", state: "CO", zip: "80202", country: "US" },
  { city: "Preview Park", state: "IL", zip: "60601", country: "US" },
  { city: "Simulated Plains", state: "FL", zip: "33101", country: "US" },
  { city: "Dummy Dale", state: "MA", zip: "02108", country: "US" },
  { city: "Staging Springs", state: "OR", zip: "97201", country: "US" },
  { city: "Test Track", state: "AZ", zip: "85001", country: "US" },
];

const ROAD_NAMES = [
  "Test Lane",
  "Sandbox Street",
  "Mock Avenue",
  "Fixture Road",
  "Preview Boulevard",
  "Dev Drive",
  "Simulation Way",
  "Staging Court",
  "Dummy Close",
  "Unit Test Terrace",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateCustomer(): CustomerData {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const location = pick(CITIES);
  const road = pick(ROAD_NAMES);
  const houseNumber = randomInt(1, 9999);

  const emailProvider = pick([
    "test.example",
    "sandbox.invalid",
    "mock.local",
    "fixture.dev",
  ]);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailProvider}`;
  const areaCode = randomInt(200, 999);
  const prefix = randomInt(200, 999);
  const lineNumber = randomInt(1000, 9999);
  const phone = `+1 (${areaCode}) ${prefix}-${lineNumber}`;

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email,
    phone,
    address: {
      line1: `${houseNumber} ${road}`,
      line2: Math.random() > 0.5 ? `Unit ${randomInt(1, 50)}` : undefined,
      city: location.city,
      state: location.state,
      zip: location.zip,
      country: location.country,
    },
  };
}

const BRAND_BY_SCENARIO: Record<string, string> = {
  success: "Visa",
  declined: "Mastercard",
};

export interface GenerateOptions {
  provider?: string;
  scenario?: string;
}

export function generateTestData(options: GenerateOptions = {}): GeneratedTestData {
  const provider =
    getProvider(options.provider ?? "") ?? (providers[0] as (typeof providers)[number]);

  const scenario =
    provider.scenarios.find((s) => s.id === options.scenario) ??
    provider.scenarios[0];

  const customer = generateCustomer();

  // Expiry is in the future for most scenarios; the provider simulates
  // the outcome via the card number, not the expiry we set.
  const year = new Date().getFullYear() + 2;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const expiry = `${month}/${String(year).slice(-2)}`;
  const cvc = String(randomInt(100, 999));

  // Only include a card number if the provider documents one for this
  // exact scenario. Never invent numbers.
  const documentedNumbers = scenario.cardNumbers ?? [];
  const cardNumber =
    documentedNumbers.length > 0
      ? documentedNumbers[randomInt(0, documentedNumbers.length - 1)]
      : null;

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${provider.id}-${Date.now()}-${randomInt(0, 9999)}`,
    provider: provider.id,
    providerName: provider.name,
    scenario: scenario.id,
    scenarioLabel: scenario.label,
    customer,
    card: cardNumber
      ? {
          number: cardNumber,
          expiry,
          cvc,
          brand: BRAND_BY_SCENARIO[scenario.id] ?? (scenario.id === "3ds-required" ? "Mastercard" : "Visa"),
          isDocumented: true,
        }
      : null,
    expectedResult: scenario.description,
    docsUrl: provider.docsUrl,
    sandboxUrl: provider.sandboxUrl,
    generatedAt: new Date().toISOString(),
    safety: {
      sandboxOnly: true,
      disclaimer:
        "This data is for SANDBOX/TEST use only with the corresponding payment provider's sandbox. It will not work on real payment networks.",
    },
  };
}

export function getAvailableProviders(): string[] {
  return providers.map((p) => p.id);
}
