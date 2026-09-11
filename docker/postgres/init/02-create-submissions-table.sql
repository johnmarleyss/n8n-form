-- Executa dentro do banco "formulario" (criado no script 01).
\c formulario

CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT NOT NULL,
  origem TEXT,
  enviado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
