import { expect, test } from '@playwright/test';
import { esperarHidratacao } from './apoio';

test.describe('barra lateral em ecrã largo', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('lista os conceitos por anexo e destaca o atual, visível', async ({ page }) => {
    await page.goto('conceitos/recuo/');
    const barra = page.locator('[data-barra-lateral]');
    await expect(barra).toBeVisible();
    await expect(barra.getByRole('heading', { name: 'Anexo I', exact: true })).toBeVisible();
    await expect(barra.locator('a')).toHaveCount(101);
    const atual = barra.locator('[aria-current="page"]');
    await expect(atual).toHaveCount(1);
    await expect(atual).toContainText('Recuo');
    // Pertence à secção do Anexo I e está visível na área da barra.
    await expect(barra.locator('section').first().locator('[aria-current="page"]')).toHaveCount(1);
    await expect(atual).toBeInViewport();
  });

  test('a ordem segue as fichas', async ({ page }) => {
    await page.goto('conceitos/recuo/');
    const ligacoes = page.locator('[data-barra-lateral] section').first().locator('a');
    await expect(ligacoes.nth(0)).toHaveAttribute('data-conceito', 'afastamento');
    await expect(ligacoes.nth(1)).toHaveAttribute('data-conceito', 'alcado');
    await expect(ligacoes.nth(2)).toHaveAttribute('data-conceito', 'alinhamento');
    await expect(ligacoes.nth(0)).toContainText('I-1');
  });
});

test.describe('barra lateral em ecrã estreito', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('está escondida e abre como painel a partir do botão de menu', async ({ page }) => {
    await page.goto('conceitos/recuo/');
    await expect(page.locator('[data-barra-lateral]')).toBeHidden();
    await esperarHidratacao(page, '[data-menu-movel]');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const painel = page.getByRole('dialog');
    await expect(painel).toBeVisible();
    await expect(painel.getByRole('navigation', { name: 'Conceitos' }).getByRole('link')).toHaveCount(101);
    await expect(painel.locator('[aria-current="page"]', { hasText: 'Recuo' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(painel).toBeHidden();
  });
});
