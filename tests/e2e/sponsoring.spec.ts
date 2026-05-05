import { expect, test } from "@playwright/test";

test("le carousel premium est rendu sur la page d'accueil", async ({ page }) => {
  await page.goto("/");

  const carousel = page.getByRole("region", { name: /artisans et sponsors premium/i }).or(
    page.locator('[aria-roledescription="carousel"]')
  );

  await expect(carousel.first()).toBeVisible();
});
