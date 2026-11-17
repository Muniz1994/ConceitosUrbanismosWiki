import { expect, test, type Page } from '@playwright/test';

/** Abre outra página e lê o <html> logo que o corpo existe, antes de qualquer outro script. */
async function primeiraPintura(page: Page, caminho: string) {
  await page.goto(caminho, { waitUntil: 'commit' });
  await page.waitForSelector('body', { state: 'attached' });
  return page.evaluate(() => ({
    paleta: document.documentElement.dataset.paleta,
    escuro: document.documentElement.classList.contains('dark'),
  }));
}

test.describe('paleta aplicada antes da primeira pintura', () => {
  test.use({ colorScheme: 'light' });

  test('uma paleta guardada já está no <html> na página seguinte', async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() => localStorage.setItem('paleta', 'nature'));
    expect(await primeiraPintura(page, 'sobre/')).toEqual({ paleta: 'nature', escuro: false });
  });

  test('um valor guardado desconhecido dá Soft Pop', async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() => localStorage.setItem('paleta', 'cyberpunk'));
    expect((await primeiraPintura(page, 'sobre/')).paleta).toBe('soft-pop');
  });
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false, colorScheme: 'dark' });

  test('a página usa Soft Pop em modo claro', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('data-paleta', 'soft-pop');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
