-- Executa dentro do banco "formulario" (criado no script 01).
\c formulario

-- Tabela para os leads recebidos pelo webhook do formulário atual
-- (payload: nome, email, telefone, empresa, interesse, orcamento, mensagem).
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  empresa TEXT,
  interesse TEXT NOT NULL,
  orcamento NUMERIC(12, 2),
  mensagem TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
