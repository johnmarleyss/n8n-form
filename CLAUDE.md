# CLAUDE.md

Guia para o Claude Code ao trabalhar neste repositório.

> ⚠️ **Antes de mexer em código:** este projeto usa **Next.js 16**, que teve mudanças relevantes em relação a versões anteriores. Leia `AGENTS.md` (gerado automaticamente pelo Next.js) e, se necessário, a documentação em `node_modules/next/dist/docs/` antes de implementar algo que dependa de convenções do framework.

## Visão geral do projeto

Formulário web que coleta dados do usuário e os envia para um workflow do **n8n** via webhook HTTP (POST). O n8n fica responsável por processar/rotear os dados (ex.: salvar em planilha/banco, notificar, integrar com outros serviços).

- **Status:** projeto inicializado, formulário de contato funcional (build e lint passando).

## Stack e decisões técnicas

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript.
- **Estilo:** Tailwind CSS v4.
- **Validação:** `zod`, com schema único compartilhado (`src/lib/schema.ts`).
- **Envio de dados:** **Server Action** (`src/app/actions.ts`) em vez de route handler — é o padrão recomendado pelo Next.js 16 para mutações de formulário. A Server Action roda só no servidor, então a URL do webhook do n8n nunca é exposta ao client.
  - Estado de envio (pending/sucesso/erro) tratado com `useActionState` + `useFormStatus` (React 19).
- **Gerenciador de pacotes:** npm.
- Optamos por **não** usar `react-hook-form`: com Server Actions + `FormData` nativo + `useActionState`, a biblioteca extra não é necessária para o caso de uso atual (formulário único, validação simples). Reavaliar se o formulário crescer bastante (múltiplos passos, validação client-side complexa).

## Estrutura do projeto

```
formulario/
├── src/
│   ├── app/
│   │   ├── actions.ts       # Server Action: valida (zod) e faz POST ao webhook do n8n
│   │   ├── layout.tsx
│   │   ├── page.tsx         # página inicial, renderiza <ContactForm />
│   │   └── globals.css
│   ├── components/
│   │   └── ContactForm.tsx  # 'use client' — formulário + useActionState/useFormStatus
│   └── lib/
│       └── schema.ts        # zod schema compartilhado (fonte única de verdade dos campos)
├── public/
├── bruno/                     # coleção do Bruno para testar o webhook (ver seção abaixo)
├── docker/
│   └── postgres/init/         # scripts SQL rodados na 1ª inicialização do container postgres
├── n8n/
│   └── workflows/
│       └── formulario-leads.json  # export do workflow do n8n (ver seção "Infra local")
├── docker-compose.yml         # stack local: n8n + postgres (ver seção "Infra local")
├── .env.example                # template único de variáveis (Next.js + docker-compose)
├── AGENTS.md                  # regras específicas desta versão do Next.js (gerado pelo framework)
└── CLAUDE.md
```

## Comandos

```bash
npm run dev      # ambiente de desenvolvimento (http://localhost:3000)
npm run build    # build de produção
npm run start    # servir build de produção
npm run lint     # eslint
```

## Integração com n8n

- Configurar `N8N_WEBHOOK_URL` em `.env` (ver `.env.example`) apontando para o webhook do workflow no n8n. **Nunca commitar** `.env`.
- O envio é feito inteiramente no servidor, dentro da Server Action `submitForm` (`src/app/actions.ts`):
  - Valida os campos com zod.
  - Faz `fetch` POST em JSON para `N8N_WEBHOOK_URL`, com timeout de 10s (`AbortController`).
  - Retorna estado de sucesso/erro para a UI (sem expor detalhes internos ao usuário).
- Payload enviado ao n8n (JSON, exatamente estes campos — sem metadados extras):
  ```json
  {
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "13999999999",
    "empresa": "Empresa X",
    "interesse": "Desenvolvimento de sistema",
    "orcamento": 15000,
    "mensagem": "Preciso de um sistema para minha empresa"
  }
  ```
  `empresa` e `orcamento` são opcionais (se vazios, ficam de fora do JSON).
- Campos do formulário são definidos em um único lugar: `src/lib/schema.ts`. Para adicionar/remover campos, atualizar o schema, o payload em `actions.ts` e os inputs em `ContactForm.tsx`.

## Infra local: n8n + Postgres via Docker

`docker-compose.yml` sobe dois containers:

- **postgres** (`postgres:16-alpine`) — porta `5432`. Contém dois bancos:
  - `n8n` — banco interno do n8n (workflows, credenciais, execuções).
  - `formulario` — banco da aplicação. Scripts de criação em `docker/postgres/init/` (rodam automaticamente só na primeira inicialização do volume; se o volume já existir, aplicar manualmente via `docker exec -i formulario-postgres psql -U n8n -d formulario -f - < docker/postgres/init/<arquivo>.sql`). Tabelas:
    - **`leads`** (scripts `03`/`04`) — tabela atual, com as colunas do payload do formulário (`nome`, `email`, `telefone` — obrigatórios; `empresa`, `orcamento` — opcionais; `interesse`, `mensagem` — obrigatórios; `criado_em` com default `now()`) mais `score` (integer, opcional — **não vem do formulário**, é calculado/preenchido pelo workflow do n8n). É essa que o node Postgres do workflow deve usar.
    - `submissions` (script `02`) — tabela de uma versão anterior do payload (nome, email, telefone, mensagem, origem...), mantida só por histórico; não usar mais.
- **n8n** (`docker.n8n.io/n8nio/n8n:latest`) — porta `5678`, configurado via env para usar o Postgres acima como banco interno (`DB_TYPE=postgresdb`).

Variáveis em `.env` (na raiz do projeto, gerado localmente, **não commitado** — template em `.env.example`): mesmo arquivo usado pelo Next.js (`N8N_WEBHOOK_URL`) e pelo `docker-compose.yml` (`env_file: .env` nos dois serviços) — credenciais do Postgres (`POSTGRES_*` / `DB_POSTGRESDB_*`, duplicadas de propósito pois o Postgres e o n8n esperam nomes de variável diferentes) e `N8N_ENCRYPTION_KEY` (chave fixa para criptografar credenciais salvas no n8n — não trocar depois de gerada, ou credenciais salvas ficam ilegíveis).

```bash
docker compose up -d       # sobe postgres + n8n
docker compose ps          # status/health dos containers
docker compose logs -f n8n # logs do n8n
docker compose down        # para os containers (mantém os volumes/dados)
docker compose down -v     # para e APAGA os dados (postgres + config do n8n)
```

> ⚠️ **Atenção:** antes desta stack, havia uma instância do n8n rodando localmente (fora do Docker) na porta 5678, com o workflow do webhook já criado. Essa instância usa armazenamento próprio (SQLite, separado do Postgres) — ao migrar para o Docker, é preciso **exportar o workflow antes** (menu do workflow → *Download*/*Export*) e **parar o processo local** (a porta 5678 não pode estar em uso por dois processos ao mesmo tempo), depois importar o workflow na instância nova. A URL de produção do webhook muda depois da reimportação — atualizar em `.env` (Next.js) e no environment `Local` do Bruno (`bruno/environments/Local.bru`).

### Workflow do n8n versionado no repositório

`n8n/workflows/formulario-leads.json` é o export do workflow completo (recebe o webhook, valida os dados, faz upsert por e-mail na tabela `leads`, calcula `score` e responde). Não contém segredos — credenciais aparecem só como referência (`id`/`name`), sem senha.

**Exportar** (depois de alterar o workflow no editor, pra manter o arquivo atualizado):
```bash
MSYS_NO_PATHCONV=1 docker exec formulario-n8n n8n export:workflow --all --output=/tmp/export.json --pretty
MSYS_NO_PATHCONV=1 docker cp formulario-n8n:/tmp/export.json n8n/workflows/formulario-leads.json
```
(`MSYS_NO_PATHCONV=1` evita que o Git Bash no Windows reescreva o caminho `/tmp/...` como um caminho do host.)

**Importar** (workflow novo, ou restaurando de um n8n zerado):
```bash
docker cp n8n/workflows/formulario-leads.json formulario-n8n:/tmp/import.json
MSYS_NO_PATHCONV=1 docker exec formulario-n8n n8n import:workflow --input=/tmp/import.json
```
Depois de importar, é preciso reconectar a credencial Postgres do node (o export não traz a senha) e reativar o workflow (toggle **Active**).

### Conectar o Postgres como banco de dados dentro do n8n

Isso é para usar um node **Postgres** dentro do workflow (inserir os dados do formulário na tabela `leads`) — diferente do banco interno do n8n, que já está conectado via env vars.

1. No n8n, ir em **Credentials** → **New** → buscar **Postgres**.
2. Preencher:
   - **Host:** `postgres` (nome do serviço no docker-compose — n8n e postgres estão na mesma rede Docker, não usar `localhost`).
   - **Port:** `5432`
   - **Database:** `formulario`
   - **User** / **Password:** os mesmos valores de `DB_POSTGRESDB_USER` / `DB_POSTGRESDB_PASSWORD` em `.env`.
   - **SSL:** desabilitado (conexão interna na rede Docker).
3. Salvar e testar a conexão ("Test").
4. No workflow, adicionar um node **Postgres** após o Webhook, operação **Insert** (não Update/Upsert — esses exigem uma coluna de match), tabela `leads`, mapeando os campos recebidos (`nome`, `email`, `telefone`, `empresa`, `interesse`, `orcamento`, `mensagem`).
   - Atenção ao **caminho** dos campos na expressão: o corpo do webhook normalmente chega aninhado em `body` (ex.: `{{ $json.body.nome }}`, não `{{ $json.nome }}`) — confira no painel de output do node Webhook antes de mapear.

## Testes com Bruno

Coleção do [Bruno](https://www.usebruno.com/) em `bruno/` para testar o webhook do n8n isoladamente (sem depender do formulário no navegador):

- `01 - App Home` — verifica se `npm run dev` está no ar.
- `02 - Webhook n8n - Envio valido` — replica o payload exato que `submitForm` (`src/app/actions.ts`) envia ao n8n.
- `03 - Webhook n8n - Metodo errado (GET)` — diagnóstico para o erro "not registered for POST/GET requests" (node Webhook do n8n com HTTP Method incorreto).

Para usar: abrir o Bruno → *Open Collection* → selecionar a pasta `bruno/` → escolher o environment **Local** (variáveis `appBaseUrl` e `n8nWebhookUrl`, ajustar se a URL do webhook mudar ao republicar o workflow no n8n).

## Convenções

- Código em inglês (nomes de arquivos/variáveis técnicas), textos de interface e mensagens ao usuário em português (idioma do formulário).
- Commits e nomes de branch: a definir com o usuário.

## Próximos passos sugeridos

- Definir e criar o workflow no n8n que recebe o webhook (validar payload, salvar/rotear).
- Manter `.env` local (não commitado) atualizado com a URL real do webhook para testar o envio ponta a ponta.
- Avaliar proteção contra spam/bots (ex.: honeypot field, rate limiting, CAPTCHA) antes de publicar em produção.
- Deploy (Vercel é o caminho mais direto para Next.js).

## Notas

Este arquivo deve ser atualizado sempre que decisões relevantes (stack, estrutura, convenções) forem tomadas ou alteradas, para manter o contexto útil em sessões futuras.
