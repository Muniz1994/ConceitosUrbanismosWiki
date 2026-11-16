/** Prefixa caminhos internos com o caminho base do site (GitHub Pages de projeto). */
export function url(caminho: string, base: string = import.meta.env.BASE_URL): string {
  const b = base.endsWith('/') ? base : `${base}/`;
  return b + caminho.replace(/^\/+/, '');
}

/** Endereço da página de um conceito. */
export const urlConceito = (slug: string) => url(`conceitos/${slug}/`);

/** Endereço de edição de um ficheiro no GitHub (definido em REPOSITORIO_GITHUB, p. ex. «utilizador/repo»). */
export function urlEditar(ficheiro: string, repositorio = import.meta.env.PUBLIC_REPOSITORIO_GITHUB as string | undefined): string | undefined {
  if (!repositorio) return undefined;
  const caminho = ficheiro.replaceAll('\\', '/').split('/').map(encodeURIComponent).join('/');
  return `https://github.com/${repositorio}/edit/main/${caminho}`;
}
