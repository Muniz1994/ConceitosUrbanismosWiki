import { expect, type Page } from '@playwright/test';

/** Espera até a ilha React que contém `seletor` estar hidratada (o Astro remove o atributo `ssr`). */
export async function esperarHidratacao(page: Page, seletor: string) {
  const ilha = page.locator(`astro-island:has(${seletor})`).first();
  await ilha.scrollIntoViewIfNeeded();
  await expect(ilha).not.toHaveAttribute('ssr', /.*/);
}
