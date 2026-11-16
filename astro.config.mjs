// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// O endereço final é https://<utilizador>.github.io/ConceitosUrbanismosWiki/.
// Em GitHub Actions, SITE_URL é preenchido a partir de actions/configure-pages.
const site = process.env.SITE_URL ?? 'https://example.github.io';

// Repositório «utilizador/repo» para as ligações «Editar no GitHub» (GITHUB_REPOSITORY existe em GitHub Actions).
process.env.PUBLIC_REPOSITORIO_GITHUB ??= process.env.GITHUB_REPOSITORY;

export default defineConfig({
  site,
  // Em GitHub Actions, BASE_PATH vem de actions/configure-pages (o nome do repositório).
  base: process.env.BASE_PATH || '/ConceitosUrbanismosWiki',
  trailingSlash: 'always',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
