import { devices, expect, test } from '@playwright/test';
import { esperarHidratacao } from './apoio';

test.describe('pré-visualização de conceitos', () => {
  test('ao passar o cursor sobre «Recuo» em Afastamento', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    await esperarHidratacao(page, '[data-vista-previa-raiz]');
    await page.locator('[data-grupo-ligacoes="ver-tambem"] a[data-conceito="recuo"]').hover();
    const previa = page.locator('[data-vista-previa]');
    await expect(previa).toBeVisible();
    await expect(previa).toContainText('Recuo');
    await expect(previa).toContainText('Anexo I · Ficha I-57');
    await expect(previa).toContainText('Re');
    await expect(previa).toContainText('O recuo é');
    await page.mouse.move(5, 5);
    await expect(previa).toBeHidden();
  });

  test('também aparece ao focar com o teclado', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    await esperarHidratacao(page, '[data-vista-previa-raiz]');
    const ligacao = page.locator('[data-grupo-ligacoes="ver-tambem"] a[data-conceito="fachada"]');
    await ligacao.focus();
    // .focus() programático não é «focus-visible»; usar Tab a partir da ligação anterior.
    await page.locator('[data-grupo-ligacoes="ver-tambem"] a[data-conceito="empena"]').focus();
    await page.keyboard.press('Tab');
    await expect(ligacao).toBeFocused();
    await expect(page.locator('[data-vista-previa]')).toContainText('Fachada');
  });
});

test.describe('em ecrã tátil', () => {
  const { defaultBrowserType: _, ...pixel } = devices['Pixel 7'];
  test.use(pixel);

  test('um toque segue a ligação sem pré-visualização', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    await esperarHidratacao(page, '[data-vista-previa-raiz]');
    await page.locator('[data-grupo-ligacoes="ver-tambem"] a[data-conceito="recuo"]').tap();
    await expect(page).toHaveURL(/conceitos\/recuo\/$/);
    await expect(page.locator('[data-vista-previa]')).toHaveCount(0);
  });
});
