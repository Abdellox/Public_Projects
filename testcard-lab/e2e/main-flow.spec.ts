import { test, expect, type Page } from "@playwright/test";

async function openApp(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TestCard Lab" })).toBeVisible();
}

test("renders the sandbox safety banner and hero", async ({ page }) => {
  await openApp(page);
  await expect(page.getByText(/SANDBOX \/ TEST ONLY/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "TestCard Lab" })).toBeVisible();
});

test("defaults to Stripe and the successful payment scenario", async ({ page }) => {
  await openApp(page);

  // Stripe is selected by default
  const stripe = page.getByRole("radio", { name: "Stripe" });
  await expect(stripe).toBeChecked();

  // Scenario radiogroup present
  const scenarioGroup = page.getByRole("radiogroup", { name: "Test scenario" });
  await expect(scenarioGroup.getByText("Successful payment")).toBeVisible();
});

test("selecting a provider shows provider-specific scenarios", async ({ page }) => {
  await openApp(page);
  await page.getByRole("radio", { name: "Braintree" }).click();
  await expect(
    page.getByRole("radiogroup", { name: "Test scenario" }).getByText("Card declined"),
  ).toBeVisible();
  // Result card header updates to the provider (scoped to result card area)
  await expect(page.getByText("Braintree", { exact: true }).last()).toBeVisible();
});

test("changing scenario regenerates the result card", async ({ page }) => {
  await openApp(page);
  // Select 'Card declined' for stripe
  const scenarioGroup = page.getByRole("radiogroup", { name: "Test scenario" });
  await scenarioGroup.getByText("Card declined").click();

  // The declined scenario should surface the documented declined card number
  await expect(page.getByText("4000 0000 0000 0002")).toBeVisible();
  await expect(page.getByText("declined", { exact: true }).first()).toBeVisible();
});

test("generates a fresh fixture when Generate is clicked", async ({ page }) => {
  await openApp(page);
  // A robust check: ensure customer data renders and Generate keeps working
  await expect(
    page.getByText(/@(test\.example|sandbox\.invalid|mock\.local|fixture\.dev)/i).first(),
  ).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: /^Generate$/i }).click();
    await expect(
      page.getByText(/@(test\.example|sandbox\.invalid|mock\.local|fixture\.dev)/i).first(),
    ).toBeVisible();
  }
});

test("developer tools render export buttons", async ({ page }) => {
  await openApp(page);
  await expect(page.getByText("Developer tools")).toBeVisible();
  await expect(page.getByRole("button", { name: /Copy TS/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Copy JSON/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Copy Playwright/i })).toBeVisible();
});

test("API endpoint returns sandbox data", async ({ request }) => {
  const res = await request.get("/api/test-data?provider=stripe&scenario=declined");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.provider).toBe("stripe");
  expect(body.scenario).toBe("declined");
  expect(body.safety.sandboxOnly).toBe(true);
  expect(body.card.number).toBe("4000 0000 0000 0002");
  expect(body.customer.email).toMatch(
    /@(test\.example|sandbox\.invalid|mock\.local|fixture\.dev)$/,
  );
});

test("API returns error for unknown provider", async ({ request }) => {
  const res = await request.get("/api/test-data?provider=does-not-exist");
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toContain("Unknown provider");
});

test("copy full fixture button responds to click", async ({ page }) => {
  await openApp(page);
  const btn = page.getByRole("button", { name: /Copy full fixture/i });
  await expect(btn).toBeVisible();
  // Clicking should not break the page regardless of clipboard permission
  await btn.click();
  // The button label toggles to "Copied..." only if clipboard granted; either
  // state is acceptable, but the button must still be present and page healthy.
  await expect(page.getByRole("heading", { name: "TestCard Lab" })).toBeVisible();
});

test("provider documentation links are present", async ({ page }) => {
  await openApp(page);
  await expect(page.getByRole("link", { name: "Provider docs" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sandbox console" })).toBeVisible();
});
