import { expect, test } from "@playwright/test";

test.skip(
  !process.env.E2E_ARTISAN_PATH || !process.env.E2E_CLIENT_EMAIL || !process.env.E2E_CLIENT_PASSWORD,
  "Configurer E2E_ARTISAN_PATH, E2E_CLIENT_EMAIL et E2E_CLIENT_PASSWORD."
);

test("ouverture d'une conversation puis envoi d'un message", async ({ page }) => {
  const artisanPath = process.env.E2E_ARTISAN_PATH;
  const email = process.env.E2E_CLIENT_EMAIL;
  const password = process.env.E2E_CLIENT_PASSWORD;

  if (!artisanPath || !email || !password) {
    test.skip(true, "Configurer E2E_ARTISAN_PATH, E2E_CLIENT_EMAIL et E2E_CLIENT_PASSWORD.");
    return;
  }

  await page.goto("/auth/login");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/dashboard|onboarding/);

  await page.goto(artisanPath);
  await page.getByRole("button", { name: /envoyer un message/i }).click();
  await expect(page).toHaveURL(/\/messages\//);

  const message = `Test message E2E ${Date.now()}`;
  await page.getByPlaceholder(/votre message|message/i).fill(message);
  await page.getByRole("button", { name: /envoyer/i }).click();

  await expect(page.getByText(message)).toBeVisible();
});
