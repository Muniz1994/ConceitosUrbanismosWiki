import { expect, type Page } from '@playwright/test';

/**
 * Espera até a ilha React que contém `seletor` estar hidratada (o Astro remove o atributo `ssr`).
 * Com `deslocar`, desloca a ilha para a vista primeiro (necessário para `client:visible`).
 */
export async function esperarHidratacao(page: Page, seletor: string, { deslocar = true } = {}) {
  const ilha = page.locator(`astro-island:has(${seletor})`).first();
  if (deslocar && (await ilha.isVisible())) await ilha.scrollIntoViewIfNeeded();
  await expect(ilha).not.toHaveAttribute('ssr', /.*/);
}
