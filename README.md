# Conceitos DR 5/2019

Wiki dos conceitos técnicos fixados pelo **Decreto Regulamentar n.º 5/2019, de 27 de setembro** (Anexos I e II): 101 conceitos com definição, notas complementares, figuras do decreto e as ligações entre eles.

- **Pesquisa imediata** por nome, abreviatura (p. ex. `Af`), definição, notas ou comentário. Ignora acentos e tolera pequenos erros. Abre com `/` ou `Ctrl+K`.
- **Ligações**: as do decreto («Ver também»), as inversas («Referido por») e as derivadas do texto («Menciona» e «Mencionado em»).
- **Pré-visualização** de qualquer conceito ao passar o cursor, grafo de vizinhos em cada página e grafo completo.
- O texto oficial fica separado dos **comentários pessoais**.

Feito com [Astro](https://astro.build), [shadcn/ui](https://ui.shadcn.com) e [MiniSearch](https://lucaong.github.io/minisearch/), e publicado no GitHub Pages.

## Estrutura

```
src/content/conceitos/   um ficheiro Markdown por conceito (fonte de verdade)
src/content/figuras.yaml legendas e textos alternativos das figuras
src/assets/figuras/      imagens das figuras (extraídas do PDF)
src/pages/               páginas do site
src/lib/                 lógica: ligações, menções, pesquisa, disposição dos grafos
fontes/                  CSV e PDF de origem (não são publicados)
scripts/                 importação única, extração das figuras, verificações
tests/                   testes unitários (Vitest) e no navegador (Playwright)
openspec/                especificações e plano de alterações
```

## Editar um conceito

Cada conceito é um ficheiro em `src/content/conceitos/`, com o nome do conceito (p. ex. `Afastamento.md`):

```md
---
conceito: Afastamento
anexo: I
ficha: I-1
abreviatura: Af
unidades: "[m]"
aliases:            # nomes alternativos, usados nas ligações e na pesquisa
  - ...
ver_tambem:         # referências oficiais do decreto
  - "[[Fachada]]"
  - "[[Recuo]]"
figuras:
  - figura-1a
definicao: O afastamento é a distância entre a fachada de um edifício e ...
notas:
  - Pode distinguir-se entre afastamento lateral e afastamento de tardoz. ...
  - Ver Figura 1.
---

## Comentário

As minhas anotações. Ligações a outros conceitos: [[Recuo]] ou [[Piso (de um edifício)|pisos]].
```

- **Cabeçalho (entre `---`)**: o texto do decreto. Altere-o apenas para corrigir erros de transcrição.
- **Corpo**: o seu comentário, em Markdown. Aparece numa secção «Comentário», marcada como anotação pessoal. Se o corpo estiver vazio, a secção não aparece.
- **Ligações `[[...]]`**: aceitam o nome ou um alias, sem distinguir maiúsculas nem acentos. Uma referência que não corresponda a nenhum conceito faz falhar o build, com uma mensagem que indica o ficheiro.
- **Pelo GitHub**: cada página tem a ligação «Editar no GitHub», que abre o ficheiro no editor do GitHub. Ao gravar em `main`, o site é publicado de novo.
- **Obsidian**: a pasta `src/content/conceitos` pode ser aberta como cofre do Obsidian. As ligações `[[...]]` e os `aliases` funcionam lá também.

## Trabalhar localmente

Requer Node.js 22.12 ou mais recente.

```sh
npm install
npm run dev        # http://localhost:4321/ConceitosUrbanismosWiki/ (recarrega ao editar)
```

Para ver exatamente o que será publicado (o build de produção, com o mesmo caminho base do GitHub Pages):

```sh
npm run build
npm run preview    # http://localhost:4321/ConceitosUrbanismosWiki/
```

## Testes

| Comando | O que faz |
|---|---|
| `npm test` | Testes unitários: ligações, menções, pesquisa, importação, disposição dos grafos |
| `npm run test:validacao` | Confirma que conteúdo inválido faz falhar o build com mensagens claras |
| `npm run verificar-ligacoes` | Verifica todas as ligações internas do site gerado em `dist/` |
| `npm run test:e2e` | Testes no navegador sobre o build (correr `npm run build` antes; na primeira vez, `npx playwright install chromium`) |
| `npm run ci` | Todos os passos acima, pela mesma ordem que no GitHub Actions |

## Scripts de uso único

Já foram executados, e o resultado está no repositório. Ficam aqui para referência.

- **`npm run importar`**: cria os ficheiros de conceito a partir de `fontes/fichas_conceitos_tecnicos_DR5_2019.csv` e imprime um relatório das correções feitas (aliases, referências removidas, campos movidos ou corrigidos). **Recusa-se a substituir ficheiros existentes**, para não perder edições. `npm run importar -- --force` substitui tudo.
- **`python -I scripts/extrair_figuras.py`**: recorta as figuras das páginas 81–84 do PDF (pp. 87–90 do DR) para `src/assets/figuras/`. Requer PyMuPDF.

## Publicação no GitHub Pages

1. Crie o repositório no GitHub e associe-o: `git remote add origin https://github.com/<utilizador>/ConceitosUrbanismosWiki.git`.
2. No GitHub, abra **Settings → Pages → Build and deployment → Source** e escolha **GitHub Actions**.
3. Faça `git push -u origin main`.

O workflow `.github/workflows/publicar.yml` corre `npm run ci` e, só se tudo passar, publica o site em `https://<utilizador>.github.io/ConceitosUrbanismosWiki/`. Se algum passo falhar, o site publicado fica como estava.

O caminho base vem do nome do repositório, através de `actions/configure-pages`. Localmente, a predefinição é `/ConceitosUrbanismosWiki`, e pode ser alterada com a variável `BASE_PATH`.

## Nota sobre a fonte

O texto oficial publicado no Diário da República prevalece sobre o conteúdo deste sítio. Correções feitas na importação face à fonte digital:

- A abreviatura da inclinação da cobertura é «α», como na imagem do PDF; a camada de texto do PDF tinha «ơ».
- «Dhab» e «D» foram tratados como abreviaturas das densidades, e não como unidades.
- A referência «Zona», que não corresponde a nenhum conceito, foi removida de «Área de solo».
