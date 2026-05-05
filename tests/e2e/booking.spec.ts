import { expect, test } from "@playwright/test";

test.skip(
  !process.env.E2E_ARTISAN_PATH || !process.env.E2E_CLIENT_EMAIL || !process.env.E2E_CLIENT_PASSWORD,
  "Configurer E2E_ARTISAN_PATH, E2E_CLIENT_EMAIL et E2E_CLIENT_PASSWORD."
);

test("demande de reservation depuis une fiche artisan", async ({ page }) => {
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
  await page.getByRole("button", { name: /demander une reservation/i }).click();

  await page.getByLabel("Date souhaitée").fill("2026-05-05");
  await page.getByLabel("Heure (optionnel)").fill("10:30");
  await page.getByLabel("Adresse de l'intervention").fill("Cite 100 logements, Batiment 4");
  await page.getByLabel("Wilaya").selectOption({ index: 1 });
  await page.getByLabel("Commune").selectOption({ index: 1 });
  await page.getByLabel("Description du besoin").fill("Test E2E de creation de reservation.");

  await page.getByRole("button", { name: /confirmer|envoyer|reserver/i }).click();
  await expect(page).toHaveURL(/dashboard\/services/);
});
