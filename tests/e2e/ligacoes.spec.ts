import { expect, test } from '@playwright/test';

test.describe('ligações entre conceitos', () => {
  test('Afastamento: «Ver também» pela ordem da fonte', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    const grupo = page.locator('[data-grupo-ligacoes="ver-tambem"]');
    await expect(grupo.getByRole('heading')).toHaveText('Ver também');
    await expect(grupo.getByRole('link')).toHaveText(['Alçado', 'Empena', 'Fachada', 'Recuo']);
    await grupo.getByRole('link', { name: 'Recuo' }).click();
    await expect(page).toHaveURL(/conceitos\/recuo\/$/);
  });

  test('Recuo: Afastamento em «Referido por»', async ({ page }) => {
    await page.goto('conceitos/recuo/');
    await expect(page.locator('[data-grupo-ligacoes="referido-por"]').getByRole('link', { name: 'Afastamento' })).toBeVisible();
  });

  test('Edifício: Afastamento em «Mencionado em», separado das ligações oficiais', async ({ page }) => {
    await page.goto('conceitos/edificio/');
    const derivadas = page.locator('[data-ligacoes-derivadas]');
    await expect(derivadas.locator('[data-grupo-ligacoes="mencionado-em"]').getByRole('link', { name: 'Afastamento' })).toBeVisible();
    await expect(derivadas).toContainText('Derivadas do texto oficial');
  });

  test('a definição liga só a primeira ocorrência de «edifício»', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    const definicao = page.locator('[data-definicao]');
    await expect(definicao.locator('a[data-conceito="edificio"]')).toHaveCount(1);
    await expect(definicao).toHaveText(
      'O afastamento é a distância entre a fachada de um edifício e a estrema correspondente do prédio onde o edifício se encontra implantado.',
    );
  });

  test('conceito sem ligações não mostra secções vazias', async ({ page }) => {
    await page.goto('conceitos/rgb/');
    await expect(page.locator('[data-grupo-ligacoes]')).toHaveCount(0);
  });
});
