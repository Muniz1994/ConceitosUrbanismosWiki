import { expect, test } from '@playwright/test';
import { IDS_PALETAS } from '../../src/lib/aparencia';
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

  test('o modo e a paleta escolhidos em «Aparência» mantêm-se entre páginas, desde a primeira pintura', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('./');
    const botao = page.locator('[data-aparencia]');
    await esperarHidratacao(page, '[data-aparencia]', { deslocar: false });
    await expect(botao).toHaveAttribute('data-modo', 'sistema');
    await expect(botao).toHaveAttribute('data-paleta-atual', 'soft-pop');

    await botao.click();
    await page.getByRole('radio', { name: 'Escuro' }).click();
    await page.getByRole('radio', { name: /^Vintage Paper/ }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveAttribute('data-paleta', 'vintage-paper');
    await expect(botao).toHaveAccessibleName('Aparência: modo Escuro, paleta Vintage Paper');

    // Na página seguinte, o modo e a paleta são aplicados pelo script inline antes do corpo ser pintado.
    await page.goto('sobre/', { waitUntil: 'commit' });
    await page.waitForSelector('body', { state: 'attached' });
    expect(
      await page.evaluate(() => ({
        escuro: document.documentElement.classList.contains('dark'),
        paleta: document.documentElement.dataset.paleta,
      })),
    ).toEqual({ escuro: true, paleta: 'vintage-paper' });
    const primeiroScript = await page.evaluate(() => document.head.querySelector('script')?.textContent ?? '');
    expect(primeiroScript).toContain("localStorage.getItem('tema')");
    expect(primeiroScript).toContain("localStorage.getItem('paleta')");

    // Depois de carregar, o botão anuncia as escolhas guardadas.
    await esperarHidratacao(page, '[data-aparencia]', { deslocar: false });
    await expect(page.locator('[data-aparencia]')).toHaveAccessibleName('Aparência: modo Escuro, paleta Vintage Paper');
  });

  test('«Aparência» funciona só com o teclado', async ({ page }) => {
    await page.goto('./');
    const botao = page.locator('[data-aparencia]');
    await esperarHidratacao(page, '[data-aparencia]', { deslocar: false });
    await botao.focus();
    await page.keyboard.press('Enter');
    const painel = page.locator('[data-painel-aparencia]');
    await expect(painel).toBeVisible();

    // Cada grupo é uma paragem de Tab; dentro do grupo, as setas mudam a escolha.
    const softPop = page.getByRole('radio', { name: /^Soft Pop/ });
    for (let i = 0; i < 4 && !(await softPop.evaluate((e) => e === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(softPop).toBeFocused();
    // O Radix move o foco num setTimeout e só seleciona se a seta ainda estiver premida:
    // uma tecla real fica premida dezenas de ms; o `press` instantâneo do Playwright não.
    await page.keyboard.press('ArrowDown', { delay: 50 });
    await page.keyboard.press('ArrowDown', { delay: 50 });
    const nature = page.getByRole('radio', { name: 'Nature' });
    await expect(nature).toBeFocused();
    await expect(nature).toBeChecked();
    await expect(page.locator('html')).toHaveAttribute('data-paleta', 'nature');

    await page.keyboard.press('Escape');
    await expect(painel).toBeHidden();
    await expect(botao).toBeFocused();
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
    // Os tipos de letra mudam de largura entre paletas: o cabeçalho tem de caber em todas.
    for (const paleta of IDS_PALETAS) {
      for (const caminho of ['./', 'sobre/', 'conceitos/nao-existe/', 'conceitos/afastamento/', 'grafo/', 'indice/']) {
        test(`${paleta}: ${caminho} não tem deslocamento horizontal e mostra a pesquisa e «Aparência»`, async ({ page }) => {
          await page.addInitScript((p) => localStorage.setItem('paleta', p), paleta);
          await page.goto(caminho);
          await expect(page.locator('html')).toHaveAttribute('data-paleta', paleta);
          await page.evaluate(() => document.fonts.ready);
          const excesso = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(excesso).toBeLessThanOrEqual(0);
          await expect(page.locator('header [data-abrir-pesquisa]')).toBeVisible();
          await expect(page.locator('header [data-aparencia]')).toBeVisible();
          await expect(page.locator('[data-menu-movel]')).toBeVisible();
        });
      }
    }
  });
});
