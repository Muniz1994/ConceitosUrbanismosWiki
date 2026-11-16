// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// O endereço final é https://<utilizador>.github.io/ConceitosUrbanismosWiki/.
// Em GitHub Actions, SITE_URL é preenchido a partir de actions/configure-pages.
const site = process.env.SITE_URL ?? 'https://example.github.io';

export default defineConfig({
  site,
  base: '/ConceitosUrbanismosWiki',
  trailingSlash: 'always',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
