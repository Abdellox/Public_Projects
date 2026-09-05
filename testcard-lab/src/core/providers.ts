import type { Provider, Scenario, ScenarioId } from "./types";

/**
 * Provider configuration system.
 *
 * Add a new payment provider by creating a new object in `providers`.
 * Each provider lists only its OFFICIALLY DOCUMENTED sandbox card
 * numbers and scenarios. We never invent or guess card data.
 */

function scenario(
  id: ScenarioId,
  label: string,
  description: string,
  outcome: Scenario["outcome"],
  cardNumbers?: string[],
): Scenario {
  return { id, label, description, outcome, cardNumbers };
}



export const providers: Provider[] = [
  {
    id: "stripe",
    name: "Stripe",
    brandColor: "#635BFF",
    docsUrl: "https://docs.stripe.com/testing",
    sandboxUrl: "https://dashboard.stripe.com/test/payments",
    modes: ["Test mode", "CLI tests", "API", "Stripe Checkout"],
    description:
      "Use Stripe test mode with test card numbers. All numbers are from Stripe's official testing documentation.",
    scenarios: [
      scenario(
        "success",
        "Successful payment",
        "Charge is authorized and completes successfully.",
        "success",
        ["4242 4242 4242 4242", "4000 0038 0000 0002", "4000 0027 6000 3184"],
      ),
      scenario(
        "declined",
        "Card declined",
        "Charge is declined by the card issuer.",
        "declined",
        ["4000 0000 0000 0002"],
      ),
      scenario(
        "insufficient-funds",
        "Insufficient funds",
        "Charge is declined for insufficient funds.",
        "declined",
        ["4000 0000 0000 9995"],
      ),
      scenario(
        "expired-card",
        "Expired card",
        "Charge is declined because the card is expired.",
        "declined",
        ["4000 0000 0000 0069"],
      ),
      scenario(
        "incorrect-cvc",
        "Incorrect CVC",
        "Charge is declined because the CVC is invalid.",
        "declined",
        ["4000 0000 0000 0127"],
      ),
      scenario(
        "avs-mismatch",
        "Address/ZIP mismatch",
        "AVS reports a zip code mismatch.",
        "warning",
        ["4000 0000 0000 0010"],
      ),
      scenario(
        "3ds-required",
        "3-D Secure required",
        "Requires authentication via 3-D Secure.",
        "info",
        ["4000 0027 6000 3184", "4000 0027 6000 0002"],
      ),
      scenario(
        "processing-error",
        "Processing error",
        "A processing error occurs, which may be retried.",
        "warning",
        ["4000 0000 0000 0119"],
      ),
    ],
    documentedCards: {
      success: ["4242 4242 4242 4242", "4000 0038 0000 0002", "4000 0027 6000 3184"],
      declined: ["4000 0000 0000 0002"],
      "insufficient-funds": ["4000 0000 0000 9995"],
      expired: ["4000 0000 0000 0069"],
      "incorrect-cvc": ["4000 0000 0000 0127"],
      "avs-mismatch": ["4000 0000 0000 0010"],
      "3ds-required": ["4000 0027 6000 3184", "4000 0027 6000 0002"],
      "processing-error": ["4000 0000 0000 0119"],
    },
  },
  {
    id: "paypal",
    name: "PayPal",
    brandColor: "#FFC439",
    docsUrl: "https://developer.paypal.com/api/rest/sandbox/card-testing/",
    sandboxUrl: "https://developer.paypal.com/dashboard/",
    modes: ["Sandbox", "API", "Checkout SDK"],
    description:
      "PayPal provides sandbox credit card numbers for testing with their Sandbox business account and API. No real card numbers or Luhn-valid do not sterilize.",
    scenarios: [
      scenario(
        "success",
        "Successful payment",
        "Sandbox charge is approved.",
        "success",
        ["4032034941744781"],
      ),
      scenario(
        "declined",
        "Card declined",
        "Sandbox charge is declined.",
        "declined",
        ["4637531505371442"],
      ),
      scenario(
        "insufficient-funds",
        "Insufficient funds",
        "Sandbox declines the charge for insufficient funds.",
        "declined",
      ),
      scenario(
        "expired-card",
        "Expired card",
        "Sandbox declines the charge because the card is expired.",
        "declined",
      ),
      scenario(
        "incorrect-cvc",
        "Incorrect CVC",
        "Sandbox reports an invalid CVC.",
        "declined",
        ["4012000033330027"],
      ),
      scenario(
        "avs-mismatch",
        "Address/ZIP mismatch",
        "Sandbox reports a CAP/AVS mismatch.",
        "warning",
      ),
      scenario(
        "3ds-required",
        "3-D Secure authentication required",
        "Sandbox requires authentication via 3-D Secure.",
        "info",
      ),
    ],
    documentedCards: {
      success: ["4032034941744781"],
      declined: ["4637531505371442"],
      "insufficient-funds": [],
      expired: [],
      "incorrect-cvc": ["4012000033330027"],
      "avs-mismatch": [],
      "3ds-required": [],
    },
  },
  {
    id: "adyen",
    name: "Adyen",
    brandColor: "#0ABF53",
    docsUrl: "https://docs.adyen.com/development-resources/testing/test-card-numbers/",
    sandboxUrl: "https://ca-test.adyen.com/",
    modes: ["Test", "API", "Checkout"],
    description:
      "Adyen provides official test card numbers for use in their sandbox environment.",
    scenarios: [
      scenario(
        "success",
        "Successful payment",
        "Authorizes successfully in test.",
        "success",
        ["4917610000000000", "5211100010001111"],
      ),
      scenario(
        "declined",
        "Card declined",
        "Authorizes fail in test.",
        "declined",
        ["4111 1111 1111 1111"],
      ),
      scenario(
        "insufficient-funds",
        "Insufficient funds",
        "Authorizes fail with insufficient funds.",
        "declined",
      ),
      scenario(
        "expired-card",
        "Expired card",
        "Authorizes fail because the card is expired.",
        "declined",
      ),
      scenario(
        "incorrect-cvc",
        "Incorrect CVC",
        "Authorizes fail because the CVC is invalid.",
        "declined",
      ),
      scenario(
        "avs-mismatch",
        "Address/ZIP mismatch",
        "AVS reports a mismatch.",
        "warning",
      ),
      scenario(
        "3ds-required",
        "3-D Secure authentication required",
        "Requires authentication via 3-D Secure.",
        "info",
        ["5343 8951 0000 1004"],
      ),
    ],
    documentedCards: {
      success: ["4917610000000000", "5211100010001111"],
      declined: ["4111 1111 1111 1111"],
      "insufficient-funds": [],
      expired: [],
      "incorrect-cvc": [],
      "avs-mismatch": [],
      "3ds-required": ["5343 8951 0000 1004"],
    },
  },
  {
    id: "braintree",
    name: "Braintree",
    brandColor: "#3B7CFF",
    docsUrl: "https://developer.paypal.com/braintree/docs/reference/general/testing/python",
    sandboxUrl: "https://sandbox.braintreegateway.com/",
    modes: ["Sandbox", "API", "Drop-in UI", "Hosted Fields"],
    description:
      "Braintree provides sandbox test card numbers for use in their sandbox environment.",
    scenarios: [
      scenario(
        "success",
        "Successful payment",
        "Settlement / authorization succeeds.",
        "success",
        ["4111 1111 1111 1111", "4005 5190 0000 0004"],
      ),
      scenario(
        "declined",
        "Card declined",
        "Transaction is declined.",
        "declined",
        ["4000 2222 2222 2222"],
      ),
      scenario(
        "insufficient-funds",
        "Insufficient funds",
        "Authorization is declined for insufficient funds.",
        "declined",
      ),
      scenario(
        "expired-card",
        "Expired card",
        "Authorization is declined because the card is expired.",
        "declined",
        ["4000 1111 1111 1111"],
      ),
      scenario(
        "incorrect-cvc",
        "Incorrect CVC",
        "Transaction fails CVC validation.",
        "declined",
        ["4000 4111 1111 1111"],
      ),
      scenario(
        "avs-mismatch",
        "Address/ZIP mismatch",
        "AVS reports a mismatch.",
        "warning",
      ),
      scenario(
        "3ds-required",
        "3-D Secure authentication required",
        "Requires authentication via 3-D Secure.",
        "info",
        ["4000 0000 0000 1091"],
      ),
    ],
    documentedCards: {
      success: ["4111 1111 1111 1111", "4005 5190 0000 0004"],
      declined: ["4000 2222 2222 2222"],
      "insufficient-funds": [],
      expired: ["4000 1111 1111 1111"],
      "incorrect-cvc": ["4000 4111 1111 1111"],
      "avs-mismatch": [],
      "3ds-required": ["4000 0000 0000 1091"],
    },
  },
];

export const providerRegistry: Record<string, Provider> = providers.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, Provider>,
);

export function getProvider(id: string): Provider | undefined {
  return providerRegistry[id];
}

export function getScenariosForProvider(providerId: string): Scenario[] {
  return getProvider(providerId)?.scenarios ?? [];
}

export function getDefaultProvider(): Provider {
  return providers[0];
}

export function getAllProviders(): Provider[] {
  return providers;
}
