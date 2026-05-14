import { expect, type Locator, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function clickUntilVisible(trigger: Locator, target: Locator) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await trigger.click();
    if (await target.isVisible({ timeout: 1500 }).catch(() => false)) {
      return;
    }
  }

  await expect(target).toBeVisible();
}

test("navigation catégories desktop: mega-menu, raccourcis et menu Plus", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const categoriesButton = page.getByRole("button", { name: /toutes les catégories/i });
  await expect(categoriesButton).toBeVisible();

  const megaMenu = page.getByRole("dialog", { name: /toutes les catégories/i });
  await clickUntilVisible(categoriesButton, megaMenu);

  await page.keyboard.press("Escape");
  await page.mouse.move(5, 5);
  await expect(megaMenu).toBeHidden();

  const quickNav = page.getByRole("navigation", { name: /catégories rapides/i });
  await expect(quickNav.getByRole("link", { name: /plomberie/i })).toBeVisible();

  const moreButton = page.getByRole("button", { name: /plus de catégories/i });
  const moreMenu = page.getByRole("menu", { name: /plus de catégories/i });
  await clickUntilVisible(moreButton, moreMenu);
  await expect(moreMenu.getByRole("link").first()).toBeVisible();

  await page.keyboard.press("Escape");
  await page.mouse.move(5, 5);
  await expect(moreMenu).toBeHidden();

  await quickNav.getByRole("link", { name: /plomberie/i }).click();
  await expect(page).toHaveURL(/\/recherche\/plomberie(?:-gaz)?\/toute-l-algerie\/toutes-communes/);
});

test("navigation catégories mobile: panneau lisible et lien service", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const mobileCategoriesButton = page.getByRole("button", { name: /^catégories$/i });

  const categoryPanel = page.getByRole("dialog", { name: /explorer les catégories/i });
  await clickUntilVisible(mobileCategoriesButton, categoryPanel);

  await categoryPanel.getByLabel(/rechercher une catégorie/i).fill("fuite");

  const serviceLink = categoryPanel.getByRole("link", { name: /fuite/i }).first();
  if (await serviceLink.count()) {
    await expect(serviceLink).toBeVisible();
    await serviceLink.click();
    await expect(page).toHaveURL(/subcategory=fuite/);
    return;
  }

  await categoryPanel.getByLabel(/rechercher une catégorie/i).fill("plomberie");
  await categoryPanel.getByRole("link", { name: /plomberie/i }).first().click();
  await expect(page).toHaveURL(/\/recherche\/plomberie/);
});
