import { expect, test } from "@playwright/test";

test.skip(
  !process.env.E2E_REGISTER_EMAIL || !process.env.E2E_REGISTER_PASSWORD,
  "Configurer E2E_REGISTER_EMAIL et E2E_REGISTER_PASSWORD pour autoriser ce test mutatif."
);

test("inscription client puis connexion", async ({ page }) => {
  const email = process.env.E2E_REGISTER_EMAIL;
  const password = process.env.E2E_REGISTER_PASSWORD;

  if (!email || !password) {
    test.skip(true, "Configurer E2E_REGISTER_EMAIL et E2E_REGISTER_PASSWORD pour autoriser ce test mutatif.");
    return;
  }

  await page.goto("/auth/register?type=client");

  await page.getByLabel("Nom").fill("E2E");
  await page.getByLabel("Prenom").fill("Client");
  await page.getByLabel("Age").fill("28");
  await page.getByLabel("Wilaya").selectOption({ index: 1 });
  await page.getByLabel("Commune").selectOption({ index: 1 });
  await page.getByLabel("Telephone").fill("0550000000");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").first().fill(password);
  await page.getByLabel("Confirmer le mot de passe").fill(password);

  await page.getByRole("button", { name: /creer mon compte/i }).click();
  await expect(page.getByText(/inscription reussie/i)).toBeVisible();

  await page.goto("/auth/login");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();

  await expect(page).toHaveURL(/dashboard|onboarding/);
});
