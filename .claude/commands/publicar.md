---
description: Publica o trabalho já commitado no repo oficial, que sai em produção na hora
---

# Publicar

Este projeto tem **um** destino: o remoto `empresa`, `igreenlab/ui-apn-institucional`.
O site em produção é **https://apn.igreenenergy.com.br/**.

## ⚠ Push na `main` PUBLICA EM PRODUÇÃO

Não é só guardar código. O repo tem `.github/workflows/deploy-prod.yml` (posto pelo Antonio Marcos em 2026-07-28), que a cada push na `main` entra por SSH no servidor `162.141.111.97` e roda o `deploy.sh` do `igreen-vault`. **O site sai no ar na hora.**

Consequência prática: aqui não existe "subir para guardar". Se o trabalho não está validado nas três configurações de tela e no modo apresentação, ele não deve ir para a `main`.

## Antes de qualquer coisa

**O dono pediu para publicar explicitamente?** Se não, pare: relate o que fez e pergunte. Ele valida no navegador antes, e já estranhou site sem mudança por causa de push que não aconteceu. Agora que push publica em produção, essa confirmação vale ainda mais.

**Alguém mais commita neste repo.** Um `git push` recusado com "fetch first" quer dizer que a empresa tem trabalho que você não tem — foi assim que quase perdemos o workflow do Antonio. Traga com `git pull --rebase empresa main`, confira que os arquivos dos dois lados sobreviveram, e só então publique. **Nunca** resolva com `--force`.

## O caminho normal é PR, não push direto

O workflow dispara **só** em `push` na `main` — linhas 3-4 do arquivo dele. Logo, um ramo separado **não publica nada**: dá para enviar, deixar alguém revisar, e o site só muda quando a PR for mergeada. É o caminho preferido, porque devolve a chance de alguém olhar antes do mundo ver.

```bash
git checkout -b <nome-do-ramo>
git push -u empresa <nome-do-ramo>
gh pr create --repo igreenlab/ui-apn-institucional --base main
```

O `.github/pull_request_template.md` já carrega o checklist do projeto. Preencha de verdade, inclusive a parte **"o que ficou sem validar"** — é a que mais evita retrabalho.

## Push direto na `main` (só quando for pedido assim)

```bash
git push empresa main
```

## Confirmar que o deploy rodou

```bash
gh run list --repo igreenlab/ui-apn-institucional --limit 3
```

Deve aparecer um "Deploy to production" com `success`, poucos segundos depois do push na `main`. Se não apareceu nada, o push não chegou onde você pensa.

## Depois de publicar

Diga ao dono **em que endereço testar** — https://apn.igreenenergy.com.br/ — e o que esperar ver de diferente. Se a mudança foi só de pipeline ou documentação, avise que o site não muda visualmente; senão ele abre, não vê diferença e fica na dúvida se o push funcionou.

**E avise sobre o cache.** O site está atrás da Cloudflare, que trata os arquivos de forma diferente (medido em 2026-07-30):

| tipo de arquivo | quando o mundo vê |
|---|---|
| HTML (home e páginas de produto) e `sitemap.xml` | **na hora** |
| **imagens e `robots.txt`** | **até 4 horas depois** (`max-age=14400`) |

Então, se ele trocou uma foto, avise que pode demorar — não é deploy quebrado. Para ver o que está realmente no servidor, fure a borda com um cache-buster:

```bash
curl -A "Mozilla/5.0" "https://apn.igreenenergy.com.br/robots.txt?v=1"
```

Duas armadilhas ao medir produção, as duas descobertas errando:

- **O servidor devolve 403 para `curl` sem user-agent de navegador.** Não é erro do site.
- **404 falso:** qualquer endereço inexistente responde **200 com a home inteira** (417.926 bytes). Status 200 **não prova** que o arquivo foi publicado — compare o tamanho ou o `<title>` com o de uma URL que você sabe que não existe.

## Se o push for recusado

Significa que o oficial tem commit que você não tem. Traga antes com `git pull --rebase empresa main`, confira que nada quebrou (`node .claude/scripts/revisar.js`) e só então publique. **Nunca** resolva isso com `--force`.
