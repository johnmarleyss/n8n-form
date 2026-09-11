-- Cria um banco separado do banco interno do n8n (definido em POSTGRES_DB),
-- para guardar os dados da aplicação (ex.: envios do formulário) sem misturar
-- com as tabelas internas do n8n (workflows, credenciais, execuções etc.).
CREATE DATABASE formulario;
