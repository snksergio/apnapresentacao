---
description: Publica o trabalho já commitado — aqui é um push na main, e o Netlify republica sozinho
---

# Publicar

⚠ **Este arquivo foi reescrito em 2026-08-10.** A versão anterior descrevia dois remotos
(`empresa` e `origin`), um push que entrava por SSH no servidor de produção e um script
`espelhar-visual.js`. **Nada disso existe neste repositório** — aquele era o
`igreenlab/ui-apn-institucional`, que é outro projeto. Se você leu aquela versão em algum
lugar, ignore: os comandos de lá falham aqui, e o `empresa` nem é um remoto deste clone.

## Como publicar aqui

```bash
git push origin main
```

É isso. Um único remoto, um único passo. O **Netlify** está ligado a este repositório e
republica a cada push na `main`. Não há build, não há script, não há SSH, não há segundo passo.

| remoto | papel |
|---|---|
| `origin` | `MFiGreenSYS/GranShow-AP`, privado. Único remoto. Push na `main` republica o site. |

Está na conta pessoal e não na `igreenlab` porque a organização tem restrição de app de
terceiro que já impediu conectar a Vercel ao repositório dela — o Netlify pede a mesma
autorização e travaria na mesma porta.

## ⚠ Push na `main` PUBLICA. Confirme antes.

**O dono pediu para publicar explicitamente?** Se não, pare: relate o que fez e pergunte.
Ele valida no navegador antes, e já estranhou site sem mudança por causa de push que não
aconteceu. Como o push republica na hora, essa confirmação vale ainda mais.

Se o trabalho não está validado nas três configurações de tela (1920×946, 1536×750 @125%,
390×844 @3x) e no modo apresentação, ele não deve ir para a `main`.

## O caminho melhor: branch com pré-visualização

Aqui existe uma opção que o outro repositório não tinha, e ela é quase sempre a certa:

```bash
git push -u origin nome-da-branch
gh pr create
```

O Netlify gera um **deploy de pré-visualização** com **URL própria** para a branch, sem
tocar no site publicado. É um endereço de verdade: abre no celular, dá para mandar para
outra pessoa, e o modo apresentação funciona nele (diferente de `file://`, onde o popup do
vídeo, as fontes e o `navigator.share` falham por origem inválida).

Ou seja: **valide na pré-visualização, depois faça o merge.** O merge é o que publica.
O template em `.github/pull_request_template.md` carrega o checklist do projeto.

## Depois de publicar

Diga ao dono **em que endereço testar** e o que esperar ver de diferente. Se a mudança foi
só de pipeline ou documentação, avise que o site não muda visualmente — senão ele abre, não
vê diferença e fica na dúvida se o push funcionou.

O deploy leva alguns segundos. Se o site não mudou, antes de suspeitar do código confira no
painel do Netlify se o deploy **terminou** e se ele apontou para o commit certo.

## O que NÃO está no repositório, de propósito

`.github/workflows/deploy-prod.yml` foi **removido** ao criar este repositório. Ele dispara
em `push: branches: [main]`, entra por SSH em `162.141.111.97` como root e roda o `deploy.sh`
do `igreen-vault` — o deploy do **site institucional**. Aqui ele faria uma de duas coisas:
falhar em todo push por falta do secret, ou publicar a apresentação por cima do site
institucional em produção. **Não devolva esse arquivo.**
