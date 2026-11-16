import { expect, test } from '@playwright/test';

test.describe('grafo local', () => {
  test('selecionar o nó Fachada no grafo de Afastamento abre Fachada', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    const grafo = page.locator('[data-grafo="local"]');
    await expect(grafo.locator('.no-foco')).toHaveAttribute('data-no', 'afastamento');
    await expect(grafo.locator('[data-tipo="explicita"]').first()).toBeAttached();
    await expect(grafo.locator('[data-tipo="mencao"]').first()).toBeAttached();
    await grafo.locator('[data-no="fachada"]').click();
    await expect(page).toHaveURL(/conceitos\/fachada\/$/);
  });

  test('RGB, sem ligações, mostra uma nota em vez do grafo', async ({ page }) => {
    await page.goto('conceitos/rgb/');
    await expect(page.locator('[data-grafo="local"]')).toHaveCount(0);
    await expect(page.locator('[data-sem-ligacoes]')).toHaveText('Este conceito não tem ligações a outros conceitos.');
  });
});

test.describe('página do grafo', () => {
  test('desligar «Menções» esconde as ligações tracejadas', async ({ page }) => {
    await page.goto('grafo/');
    const figura = page.locator('[data-grafo="completo"]');
    await expect(figura).toHaveAttribute('data-interativo', 'sim');
    const mencao = figura.locator('line[data-tipo="mencao"]').first();
    await expect(mencao).toBeVisible();
    await page.getByLabel('Menções').uncheck();
    await expect(mencao).toBeHidden();
    await expect(figura.locator('line[data-tipo="explicita"]').first()).toBeVisible();
  });

  test('passar o cursor sobre Edificação realça os vizinhos e atenua os outros', async ({ page }) => {
    await page.goto('grafo/');
    const figura = page.locator('[data-grafo="completo"]');
    await expect(figura).toHaveAttribute('data-interativo', 'sim');
    await figura.locator('[data-no="edificacao"] circle').hover({ force: true });
    await expect(figura).toHaveClass(/com-realce/);
    await expect(figura.locator('[data-no="edificacao"]')).toHaveClass(/realce/);
    // Um conceito do Anexo II não é vizinho e fica atenuado.
    const distante = figura.locator('[data-no="rgb"]');
    await expect(distante).not.toHaveClass(/realce/);
    expect(Number(await distante.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.5);
  });

  test('os botões de zoom alteram a vista', async ({ page }) => {
    await page.goto('grafo/');
    const camada = page.locator('[data-grafo="completo"] [data-camada]');
    await expect(page.locator('[data-grafo="completo"]')).toHaveAttribute('data-interativo', 'sim');
    await page.getByRole('button', { name: 'Aproximar' }).click();
    await expect(camada).toHaveAttribute('transform', /scale\(1\.5\)/);
    await page.getByRole('button', { name: 'Repor vista' }).click();
    await expect(camada).toHaveAttribute('transform', /scale\(1\)/);
  });
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('o grafo aparece disposto e cada nó liga ao conceito', async ({ page }) => {
    await page.goto('grafo/');
    const nos = page.locator('[data-grafo="completo"] [data-no]');
    await expect(nos).toHaveCount(101);
    const recuo = page.locator('[data-no="recuo"]');
    await expect(recuo).toBeVisible();
    expect(await recuo.getAttribute('href')).toMatch(/\/conceitos\/recuo\/$/);
    const cx = Number(await recuo.locator('circle').getAttribute('cx'));
    expect(Number.isFinite(cx)).toBe(true);
    await recuo.click();
    await expect(page).toHaveURL(/conceitos\/recuo\/$/);
  });
});
