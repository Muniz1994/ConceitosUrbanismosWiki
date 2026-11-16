import { expect, test, type Page } from '@playwright/test';

const pronta = (page: Page) => expect(page.locator('html')).toHaveAttribute('data-pesquisa-pronta', 'sim');

test.describe('pesquisa', () => {
  test('Ctrl+K, «recuo», setas e Enter abrem a página de Recuo', async ({ page }) => {
    await page.goto('conceitos/afastamento/');
    await pronta(page);
    await page.keyboard.press('Control+k');
    const campo = page.getByRole('dialog').getByPlaceholder('Pesquisar conceitos…');
    await expect(campo).toBeFocused();
    await campo.fill('recuo');
    await expect(page.locator('[data-resultado]').first()).toHaveAttribute('data-resultado', 'recuo');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/conceitos\/recuo\/$/);
  });

  test('«/» abre a pesquisa fora de campos de texto, mas não quando se escreve num campo', async ({ page }) => {
    await page.goto('indice/');
    await pronta(page);
    await page.keyboard.press('/');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.goto('./');
    await pronta(page);
    const campoInicio = page.locator('[data-campo-inicio]');
    // Um campo de texto qualquer: o «/» é escrito e não abre o diálogo.
    await page.evaluate(() => {
      const i = document.createElement('input');
      i.id = 'campo-teste';
      document.body.prepend(i);
    });
    await page.locator('#campo-teste').focus();
    await page.keyboard.type('a/b');
    await expect(page.locator('#campo-teste')).toHaveValue('a/b');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(campoInicio).toBeVisible();
  });

  test('mostra o campo correspondente com trecho destacado', async ({ page }) => {
    await page.goto('./');
    await pronta(page);
    await page.locator('header [data-abrir-pesquisa]').click();
    await page.getByRole('dialog').getByPlaceholder('Pesquisar conceitos…').fill('proto-urbanístico');
    const r = page.locator('[data-resultado="alinhamento"]');
    await expect(r).toHaveAttribute('data-campo', 'notas');
    await expect(r).toContainText('Notas complementares');
    await expect(r.locator('mark').first()).toBeVisible();
  });

  test('sem resultados para «xyzzy»', async ({ page }) => {
    await page.goto('./');
    await pronta(page);
    await page.keyboard.press('Control+k');
    await page.getByRole('dialog').getByPlaceholder('Pesquisar conceitos…').fill('xyzzy');
    await expect(page.getByText('Sem resultados para «xyzzy»')).toBeVisible();
  });

  test('filtro por anexo', async ({ page }) => {
    await page.goto('./');
    await pronta(page);
    await page.keyboard.press('Control+k');
    await page.getByRole('dialog').getByPlaceholder('Pesquisar conceitos…').fill('planta');
    await page.locator('[data-filtro-pesquisa="II"]').click();
    const resultados = page.locator('[data-resultado]');
    await expect(resultados.first()).toBeVisible();
    for (const r of await resultados.all()) await expect(r).toContainText('Anexo II');
  });

  test('não faz pedidos à rede enquanto se escreve', async ({ page }) => {
    await page.goto('./');
    await pronta(page);
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog').getByText('Escreva um nome')).toBeVisible(); // dados carregados
    const pedidos: string[] = [];
    page.on('request', (r) => pedidos.push(r.url()));
    await page.getByRole('dialog').getByPlaceholder('Pesquisar conceitos…').pressSequentially('edificacao', { delay: 20 });
    await expect(page.locator('[data-resultado]').first()).toBeVisible();
    expect(pedidos).toEqual([]);
  });

  test('lista os conceitos visitados recentemente', async ({ page }) => {
    await page.goto('conceitos/fachada/');
    await pronta(page);
    await page.goto('./');
    await pronta(page);
    await page.keyboard.press('Control+k');
    await expect(page.getByText('Visitados recentemente')).toBeVisible();
    await expect(page.locator('[data-resultado="fachada"]')).toBeVisible();
  });

  test('o campo da página inicial mostra resultados ao escrever', async ({ page }) => {
    await page.goto('./');
    await pronta(page);
    const campo = page.locator('[data-campo-inicio]');
    await campo.pressSequentially('afast');
    await expect(campo).toHaveValue('afast');
    const resultados = page.locator('[data-pesquisa-inicio] [data-resultado]');
    await expect(resultados.first()).toHaveAttribute('data-resultado', 'afastamento');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/conceitos\/afastamento\/$/);
  });
});
