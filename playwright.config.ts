import { defineConfig, devices } from '@playwright/test';

// Os testes correm contra o build de produção servido por `astro preview`,
// com o mesmo caminho base usado no GitHub Pages. Correr `npm run build` antes.
const PORT = 4322;
export const BASE = `/${(process.env.BASE_PATH || '/ConceitosUrbanismosWiki').replace(/^\/+|\/+$/g, '')}/`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}${BASE}`,
    locale: 'pt-PT',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx astro preview --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
