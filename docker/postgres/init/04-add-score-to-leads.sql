-- Executa dentro do banco "formulario".
\c formulario

-- Score do lead (calculado pelo workflow do n8n, não vem do formulário).
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER;
