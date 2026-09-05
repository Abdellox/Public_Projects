# TestCard Lab

A modern developer tool that helps ecommerce engineers test payment and
checkout flows using **official payment-provider sandbox/test credentials**.

> **Important safety note**
>
> TestCard Lab only ever surfaces sandbox/test values that are **officially
> documented by each payment provider**. It never generates, guesses, validates,
> or synthesizes real credit/debit card numbers, and it never attempts to make
> a card pass real checkout or verification systems. Everything this tool
> produces is intended **exclusively** for use inside a provider's sandbox
> environment.

---

## Features

- **Provider selector** — Stripe, PayPal, Adyen, Braintree (extensible)
- **Scenario selector** — success, declined, insufficient funds, expired card,
  incorrect CVC, AVS/ZIP mismatch, 3-D Secure, processing errors
- **Synthetic customer data** — realistic but fictional name, email, phone, and
  address for use in automated tests
- **Result card** — provider, scenario, documented sandbox card values (only when
  officially documented), and expected payment result
- **Developer tools** — copy individual fields, copy the full fixture, export
  JSON / CSV, generate JS/TS fixtures, and generate Playwright / Cypress examples
- **HTTP API** — `GET /api/test-data` with rate limiting
- **Dark, developer-focused UI** — responsive, mobile-friendly, accessible

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run the unit tests

```bash
npm test
```

### Run the end-to-end (Playwright) tests

First, install the Chromium browser for Playwright (only needed once):

```bash
npm run e2e:install
```

Then run the suite (Playwright will start the dev server automatically):

```bash
npm run e2e
```

---

## HTTP API

The API returns sandbox-only test data as JSON, respecting the exact same
safety rules as the UI.

```
GET /api/test-data?provider=stripe&scenario=declined
```

| Query param | Description                                    | Example values                    |
| ----------- | ---------------------------------------------- | --------------------------------- |
| `provider`  | Payment provider id (optional, defaults to Stripe) | `stripe`, `paypal`, `adyen`, `braintree` |
| `scenario`  | Scenario id (optional, defaults to first)      | `success`, `declined`, `3ds-required`, ... |

Example response:

```json
{
  "id": "...",
  "provider": "stripe",
  "scenario": "declined",
  "customer": {
    "fullName": "Morgan Preview",
    "email": "morgan.preview@mock.local",
    "phone": "+1 (219) 904-2003",
    "address": { "line1": "8757 Test Lane", "city": "Devburg", "zip": "98101" }
  },
  "card": {
    "number": "4000 0000 0000 0002",
    "expiry": "12/28",
    "cvc": "933",
    "isDocumented": true
  },
  "expectedResult": "Charge is declined by the card issuer.",
  "safety": { "sandboxOnly": true }
}
```

The endpoint is **rate limited** (30 requests / minute / IP by default). When
the limit is exceeded it returns HTTP `429`.

---

## Configuring your ecommerce app for sandbox/test mode

Below is how to point each provider's SDK at its sandbox so that the card data
from TestCard Lab works without touching real payments.

### Stripe (test mode)

1. In the Stripe Dashboard, toggle **Test mode** (the top-right switch).
2. Use the **test secret key** (`sk_test_...`) and test publishable key
   (`pk_test_...`) from the dashboard.
3. Stripe automatically routes test-mode API calls to its test network.

```js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // sk_test_...
```

### PayPal (sandbox)

1. Create a Sandbox app at
   [developer.paypal.com](https://developer.paypal.com) and note the sandbox
   client/secret.
2. Use the sandbox `client_id` and `secret` in your API calls and the sandbox
   base URL `https://api-m.sandbox.paypal.com`.
3. Use the sandbox business/personal accounts provided in the PayPal sandbox
   dashboard for seller & buyer testing.

### Adyen (test environment)

1. From the Adyen Customer Area, copy your test **API key** and merchant
   account.
2. Point requests at the Adyen test endpoint:
   `https://checkout-test.adyen.com` / `https://pal-test.adyen.com`.

### Braintree (sandbox)

1. Use the sandbox credentials (Merchant ID, Public Key, Private Key) found in
   the Braintree sandbox control panel at
   `https://sandbox.braintreegateway.com/`.
2. Sandbox transactions settle and can be inspected via the control panel.

> **Always use a dedicated sandbox/development environment for testing.** Never
> send sandbox-only credentials to a production endpoint.

---

## Architecture

The project uses a small, provider-agnostic core so new payment providers can be
added without rewriting the application.

```
src/
├── core/
│   ├── types.ts        # Shared TypeScript types
│   ├── providers.ts    # Provider/scenario configuration (the "source of truth")
│   ├── generator.ts    # Synthetic customer + documented test data generation
│   └── exporters.ts    # JSON/CSV/JS/TS/Playwright/Cypress serializers
├── app/api/test-data/  # Rate-limited HTTP endpoint
└── components/         # React UI (dashboard, selectors, result card, tools)
```

### Adding a new provider

1. Add a new object to the `providers` array in `src/core/providers.ts`.
2. Include only **officially documented** sandbox card numbers per scenario.
3. The UI and API will pick it up automatically — no wiring required.

Each provider declares its scenarios and, per scenario, the sandbox card
numbers that are **officially documented**. The generator only emits a card
field when the selected provider documents one for the selected scenario; it
never invents numbers.

---

## Testing strategy

- **Unit tests** (`vitest`): verify provider configuration integrity and that
  the generator never emits anything outside the documented set.
- **End-to-end tests** (`Playwright`): cover the main user flow — selecting a
  provider/scenario, generating data, developer tools, and the API.

---

## License

MIT
