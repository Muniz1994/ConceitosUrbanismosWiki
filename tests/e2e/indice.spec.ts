import { expect, test } from '@playwright/test';

test.describe('índice A–Z', () => {
  test('lista todos os conceitos, com «Área» sob a letra A', async ({ page }) => {
    await page.goto('indice/');
    await expect(page.locator('[data-entrada]')).toHaveCount(101);
    await expect(page.locator('[data-contagem]')).toHaveText('101 de 101 conceitos');
    const grupoA = page.locator('[data-grupo-letra="A"]');
    await expect(grupoA.getByRole('link', { name: 'Área de construção do edifício' })).toBeVisible();
    await expect(page.locator('[data-grupo-letra="Á"]')).toHaveCount(0);
  });

  test('os filtros de anexo e de abreviatura combinam-se', async ({ page }) => {
    await page.goto('indice/');
    await page.locator('[data-filtro-anexo="I"]').click();
    await page.getByLabel('Com abreviatura').check();
    const visiveis = page.locator('[data-entrada]:visible');
    const n = await visiveis.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(73);
    for (const e of await visiveis.all()) {
      await expect(e).toHaveAttribute('data-anexo', 'I');
      await expect(e).toHaveAttribute('data-tem-abreviatura', 'sim');
    }
    await expect(page.locator('[data-contagem]')).toHaveText(`${n} de 101 conceitos`);
    await expect(page).toHaveURL(/anexo=I/);
  });

  test('o endereço ?anexo=II aplica o filtro (ligação da página inicial)', async ({ page }) => {
    await page.goto('indice/?anexo=II');
    await expect(page.locator('[data-entrada]:visible')).toHaveCount(28);
    await expect(page.locator('[data-filtro-anexo="II"]')).toHaveAttribute('aria-pressed', 'true');
  });
});
