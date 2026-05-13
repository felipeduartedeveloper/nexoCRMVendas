-- ============================================================================
-- crmvendas — inicialização do Postgres
-- O TypeORM cria as tabelas (DB_SYNC=true em dev). Aqui ficam extensões e
-- ajustes globais que precisam existir antes do app subir.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER DATABASE crmvendas_db SET timezone = 'America/Sao_Paulo';
