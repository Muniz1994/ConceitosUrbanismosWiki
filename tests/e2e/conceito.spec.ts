import { expect, test } from '@playwright/test';
import { esperarHidratacao } from './apoio';

test.describe('página de conceito', () => {
  test('Afastamento: cabeçalho, distintivos, definição e notas', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Afastamento');
    await expect(page.locator('[data-ficha]')).toHaveText('Anexo I · Ficha I-1');
    await expect(page.locator('[data-abreviatura]')).toContainText('Af');
    await expect(page.locator('[data-unidades]')).toContainText('m');
    await expect(page.locator('[data-definicao]')).toContainText('O afastamento é a distância entre a fachada');
    await expect(page.locator('[data-notas] li')).toHaveCount(3);
  });

  test('Alçado: sem distintivos de abreviatura ou unidades', async ({ page }) => {
    await page.goto('conceitos/alcado/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Alçado');
    await expect(page.locator('[data-abreviatura]')).toHaveCount(0);
    await expect(page.locator('[data-unidades]')).toHaveCount(0);
  });

  test('unidades em forma tipográfica', async ({ page }) => {
    await page.goto('conceitos/area-de-implantacao-do-edificio/');
    await expect(page.locator('[data-unidades]')).toContainText('m²');
  });

  test('anterior e seguinte dentro do anexo', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    await expect(page.locator('[data-anterior]')).toHaveCount(0);
    await expect(page.locator('[data-seguinte]')).toContainText('Alçado');

    // Última ficha do Anexo I: só tem «Anterior».
    await page.goto('conceitos/zona-de-protecao-e-de-salvaguarda-dos-recursos-e-valores-naturais/');
    await expect(page.locator('[data-ficha]')).toContainText('Ficha I-73');
    await expect(page.locator('[data-anterior]')).toBeVisible();
    await expect(page.locator('[data-seguinte]')).toHaveCount(0);
  });

  test('ligação para editar o ficheiro no GitHub', async ({ page }) => {
    await page.goto('conceitos/recuo/');
    await expect(page.locator('[data-editar]')).toHaveAttribute(
      'href',
      /^https:\/\/github\.com\/[^/]+\/[^/]+\/edit\/main\/src\/content\/conceitos\/Recuo\.md$/,
    );
  });
});

test.describe('figuras', () => {
  test('«Figura 1» nas notas salta para a Figura 1a', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    const ligacao = page.locator('[data-notas] [data-ligacao-figura]');
    await expect(ligacao).toHaveText('Figura 1');
    await ligacao.click();
    await expect(page).toHaveURL(/#figura-1a$/);
    await expect(page.locator('#figura-1a')).toBeInViewport();
  });

  test('Figura 3a amplia e fecha com Escape', async ({ page }) => {
    await page.goto('conceitos/altura-da-fachada/');
    const figura = page.locator('[data-figura="figura-3a"]');
    await expect(figura.getByRole('img')).toHaveAttribute('alt', /altura da fachada/);
    await expect(figura.locator('figcaption')).toContainText('Figura 3a');
    await esperarHidratacao(page, '[data-figura="figura-3a"]');
    await figura.getByRole('button', { name: /Ampliar Figura 3a/ }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    await expect(dialogo.getByRole('heading')).toContainText('Figura 3a');
    await page.keyboard.press('Escape');
    await expect(dialogo).toBeHidden();
  });

  test('o botão Fechar também fecha a vista ampliada', async ({ page }) => {
    await page.goto('conceitos/alcado/');
    await esperarHidratacao(page, '[data-figura="figura-2"]');
    await page.getByRole('button', { name: /Ampliar Figura 2/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Fechar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
