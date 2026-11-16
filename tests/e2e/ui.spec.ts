import { expect, test } from '@playwright/test';

test('componentes shadcn renderizam nos temas claro e escuro', async ({ page }) => {
  await page.goto('dev/ui/');
  const claro = page.locator('[data-tema="claro"]');
  const escuro = page.locator('[data-tema="escuro"]');
  await expect(claro.getByRole('button', { name: 'Pesquisar' })).toBeVisible();
  await expect(escuro.getByText('Af')).toBeVisible();
  const fundo = (l: typeof claro) => l.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await fundo(claro)).not.toBe(await fundo(escuro));
  await page.screenshot({ path: 'test-results/ui-temas.png' });
});
