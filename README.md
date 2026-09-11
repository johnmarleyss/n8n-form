# Formulário → n8n → Postgres

Formulário web (Next.js) de captação de leads que envia os dados para um workflow do **n8n**, que valida, calcula um score e grava tudo em um banco **Postgres**.

```
Usuário → Formulário (Next.js) → Server Action → Webhook n8n → valida/score → Postgres (tabela leads)
```

## Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4
- **Validação:**schema único compartilhado entre form e Server Action
- **Envio dos dados:** Server Action (sem API route própria — a URL do webhook nunca chega ao client)
- **Automação/backend:** n8n (self-hosted via Docker)
- **Banco de dados:** PostgreSQL 16
- **Testes de API:** [Bruno](https://www.usebruno.com/)

## Dados coletados

O formulário envia este JSON para o n8n:

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

`empresa` e `orcamento` são opcionais. O workflow do n8n valida os campos, faz *upsert* do lead na tabela `leads` (por e-mail) e calcula um `score` com base em orçamento/interesse/dados preenchidos.

## Como rodar localmente

### Pré-requisitos

- Node.js 20+ e npm
- Docker e Docker Compose

### 1. Subir n8n + Postgres

```bash
cp .env.example .env
# edite o .env: defina uma senha do Postgres e um N8N_ENCRYPTION_KEY únicos
docker compose up -d
```

Isso sobe:
- **Postgres** (`localhost:5432`) — banco `n8n` (interno do n8n) e banco `formulario` (tabela `leads`, criada automaticamente pelos scripts em `docker/postgres/init/`).
- **n8n** (`http://localhost:5678`) — já configurado para usar o Postgres acima como banco interno.

### 2. Importar o workflow

```bash
docker cp n8n/workflows/formulario-leads.json formulario-n8n:/tmp/import.json
docker exec formulario-n8n n8n import:workflow --input=/tmp/import.json
```

No editor do n8n (`http://localhost:5678`):
1. Abra o workflow importado e recrie a credencial **Postgres** no node (o export não inclui senha — host `postgres`, porta `5432`, database `formulario`, usuário/senha do `.env`).
2. Ative o workflow (toggle **Active**).
3. Copie a **Production URL** do node Webhook (o path já vem fixo como `formulario-contato`, então normalmente é `http://localhost:5678/webhook/formulario-contato`) e confirme que bate com `N8N_WEBHOOK_URL` no seu `.env`.

### 3. Rodar o formulário

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Testando sem o navegador

A pasta `bruno/` tem uma coleção do [Bruno](https://www.usebruno.com/) pra testar o webhook do n8n diretamente (sem passar pelo formulário): abra o Bruno → *Open Collection* → selecione `bruno/` → escolha o environment **Local**.

## Estrutura do projeto

```
├── src/
│   ├── app/
│   │   ├── actions.ts        # Server Action: valida e envia ao webhook do n8n
│   │   └── page.tsx          # página do formulário
│   ├── components/
│   │   └── ContactForm.tsx   # formulário (client component)
│   └── lib/
│       └── schema.ts         # schema — fonte única de verdade dos campos
├── docker-compose.yml         # n8n + postgres
├── docker/postgres/init/      # scripts SQL (criação das tabelas)
├── n8n/workflows/              # workflow do n8n versionado (JSON)
└── bruno/                      # coleção de testes de API
```

## Documentação para desenvolvimento

Decisões técnicas, detalhes de infraestrutura e notas mais aprofundadas ficam em [`CLAUDE.md`](./CLAUDE.md).
