import { expect, test, type Locator, type Page } from '@playwright/test';

/** Carrega em Tab até o elemento ter o foco (navegação só por teclado). */
async function tabAte(page: Page, alvo: Locator, maximo = 40) {
  for (let i = 0; i < maximo; i++) {
    await page.keyboard.press('Tab');
    if (await alvo.evaluate((e) => e === document.activeElement)) return;
  }
  throw new Error('o elemento não recebeu o foco com Tab');
}

/** Contorno calculado do elemento e a cor que --primary dá no mesmo ponto da página. */
function contorno(alvo: Locator) {
  return alvo.evaluate((e) => {
    const s = getComputedStyle(e);
    const sonda = document.createElement('div');
    sonda.style.outlineColor = 'var(--primary)';
    e.parentElement!.appendChild(sonda);
    const primaria = getComputedStyle(sonda).outlineColor;
    sonda.remove();
    return { estilo: s.outlineStyle, largura: s.outlineWidth, cor: s.outlineColor, primaria, focoVisivel: e.matches(':focus-visible') };
  });
}

test.describe('indicador de foco', () => {
  test.use({ colorScheme: 'light' });

  test('em Soft Pop claro, ligações e botões shadcn mostram o mesmo contorno, na cor principal', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('data-paleta', 'soft-pop');
    // O botão «Aparência» é um Button do shadcn (dentro do PopoverTrigger, o data-slot passa a «popover-trigger»).
    // Já é focável no HTML gerado, antes da hidratação.
    const botao = page.locator('header [data-aparencia]');

    const ligacao = page.locator('header nav a').first();
    await tabAte(page, ligacao);
    // Os elementos com transition-colors também animam outline-color: esperar que a cor assente.
    await expect.poll(async () => { const c = await contorno(ligacao); return c.cor === c.primaria; }).toBe(true);
    const l = await contorno(ligacao);
    expect(l.focoVisivel).toBe(true);
    expect(l.estilo).toBe('solid');
    expect(l.largura).toBe('2px');

    await tabAte(page, botao);
    await expect.poll(async () => { const c = await contorno(botao); return c.cor === c.primaria; }).toBe(true);
    const b = await contorno(botao);
    expect(b.focoVisivel).toBe(true);
    expect(b.estilo).toBe('solid');
    // Sem o anel ténue antigo do shadcn: só o contorno.
    expect(await botao.evaluate((e) => getComputedStyle(e).boxShadow)).toBe('none');
  });
});
