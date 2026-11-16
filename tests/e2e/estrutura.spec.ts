import { expect, test } from '@playwright/test';
import { esperarHidratacao } from './apoio';

test.describe('estrutura do site', () => {
  test('declara pt-PT e o primeiro Tab foca «Saltar para o conteúdo»', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT');
    await page.keyboard.press('Tab');
    const salto = page.getByRole('link', { name: 'Saltar para o conteúdo' });
    await expect(salto).toBeFocused();
    await expect(salto).toBeVisible();
  });

  test('o tema escolhido mantém-se entre páginas, desde a primeira pintura', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('./');
    const botao = page.locator('[data-tema-atual]');
    await esperarHidratacao(page, '[data-tema-atual]');
    await expect(botao).toHaveAttribute('data-tema-atual', 'sistema');
    await botao.click(); // claro
    await botao.click(); // escuro
    await expect(botao).toHaveAttribute('data-tema-atual', 'escuro');
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Na página seguinte, o tema é aplicado pelo script inline antes do corpo ser pintado.
    await page.goto('sobre/', { waitUntil: 'commit' });
    await page.waitForSelector('body', { state: 'attached' });
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
    const primeiroScript = await page.evaluate(() => document.head.querySelector('script')?.textContent ?? '');
    expect(primeiroScript).toContain("localStorage.getItem('tema')");
  });

  test('a página inicial mostra as contagens por anexo', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('[data-contagem-anexo="I"]')).toContainText('73');
    await expect(page.locator('[data-contagem-anexo="II"]')).toContainText('28');
  });

  test('«Sobre» indica que o texto oficial prevalece', async ({ page }) => {
    await page.goto('sobre/');
    await expect(page.locator('[data-aviso-prevalencia]')).toContainText('O texto oficial prevalece');
    await expect(page.getByRole('link', { name: /publicação oficial/ })).toHaveAttribute('href', /data\.dre\.pt\/eli/);
  });

  test('endereço desconhecido mostra a página 404 em português', async ({ page }) => {
    const resposta = await page.goto('conceitos/nao-existe/');
    expect(resposta?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'Índice' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('button', { name: 'Pesquisar' })).toBeVisible();
  });

  test.describe('a 360 px de largura', () => {
    test.use({ viewport: { width: 360, height: 740 } });
    for (const caminho of ['./', 'sobre/', 'conceitos/nao-existe/', 'conceitos/afastamento/', 'grafo/', 'indice/']) {
      test(`${caminho} não tem deslocamento horizontal e mostra a pesquisa`, async ({ page }) => {
        await page.goto(caminho);
        const excesso = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(excesso).toBeLessThanOrEqual(0);
        await expect(page.locator('header [data-abrir-pesquisa]')).toBeVisible();
        await expect(page.locator('[data-menu-movel]')).toBeVisible();
      });
    }
  });
});
