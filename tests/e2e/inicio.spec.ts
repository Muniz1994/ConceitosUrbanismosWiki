import { expect, test, type Page } from '@playwright/test';
import { t } from '../../src/i18n/pt-PT';

const introducao = t.inicio.introducao;

/** Cópias visíveis da introdução (o HTML tem duas: a dobrável, para ecrãs estreitos, e a larga). */
const visiveis = (page: Page) => page.getByText(introducao).filter({ visible: true });

/** Quantas vezes o texto da introdução aparece na árvore de acessibilidade do conteúdo principal. */
async function vezesLida(page: Page) {
  const arvore = await page.locator('main').ariaSnapshot();
  return arvore.split(introducao.slice(0, 40)).length - 1;
}

test.describe('introdução da página inicial a 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('começa dobrada, com o ícone no título e a pesquisa logo a seguir', async ({ page }) => {
    await page.goto('./');
    const dobravel = page.locator('[data-introducao-dobravel]');
    const icone = dobravel.locator('summary');
    await expect(dobravel).not.toHaveAttribute('open', /.*/);
    await expect(icone).toBeVisible();
    await expect(visiveis(page)).toHaveCount(0);

    const caixa = await icone.boundingBox();
    expect(caixa!.width).toBeGreaterThanOrEqual(40);
    expect(caixa!.height).toBeGreaterThanOrEqual(40);

    // O ícone está na linha do título e a pesquisa vem logo abaixo do título (só a margem normal).
    const titulo = (await page.locator('h1').boundingBox())!;
    const pesquisa = (await page.getByRole('search').boundingBox())!;
    expect(caixa!.y).toBeLessThan(titulo.y + titulo.height);
    expect(pesquisa.y - (titulo.y + titulo.height)).toBeLessThanOrEqual(40);
  });

  test('abre e fecha ao tocar no ícone', async ({ page }) => {
    await page.goto('./');
    const icone = page.locator('[data-introducao-dobravel] summary');
    await icone.click();
    await expect(visiveis(page)).toHaveCount(1);
    await icone.click();
    await expect(visiveis(page)).toHaveCount(0);
  });

  test('abre com o teclado e anuncia o estado', async ({ page }) => {
    await page.goto('./');
    const icone = page.locator('[data-introducao-dobravel] summary');
    for (let i = 0; i < 30 && !(await icone.evaluate((e) => e === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(icone).toBeFocused();
    await expect(icone).toHaveAccessibleName(t.inicio.mostrarIntroducao);
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-introducao-dobravel]')).toHaveAttribute('open', '');
    await expect(visiveis(page)).toHaveCount(1);
    expect(await page.locator('main').ariaSnapshot()).toMatch(/\[expanded\]/);
  });

  test('volta a estar dobrada numa nova visita', async ({ page }) => {
    await page.goto('./');
    await page.locator('[data-introducao-dobravel] summary').click();
    await expect(visiveis(page)).toHaveCount(1);
    await page.reload();
    await expect(page.locator('[data-introducao-dobravel]')).not.toHaveAttribute('open', /.*/);
    await expect(visiveis(page)).toHaveCount(0);
  });

  test('o texto é lido uma só vez (aberta)', async ({ page }) => {
    await page.goto('./');
    await page.locator('[data-introducao-dobravel] summary').click();
    expect(await vezesLida(page)).toBe(1);
  });
});

test.describe('introdução da página inicial a 1280 px', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('mostra-se sempre e não há ícone', async ({ page }) => {
    await page.goto('./');
    await expect(visiveis(page)).toHaveCount(1);
    await expect(page.locator('[data-introducao-dobravel] summary')).toBeHidden();
    expect(await vezesLida(page)).toBe(1);
  });
});
