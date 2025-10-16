-- Configuração inicial do MySQL 8.0 para VagaLume
-- Este script é executado automaticamente na criação do container

-- Usar o banco de dados VagaLume
USE vagalume;

-- Configurar timezone para Brasil
SET time_zone = '-03:00';

-- Configurar charset padrão
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configurações para melhor performance com dados financeiros
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Configurar formato de data brasileiro
SET SESSION lc_time_names = 'pt_BR';

-- Criar usuário de aplicação se não existir
CREATE USER IF NOT EXISTS 'vagalume_app'@'%' IDENTIFIED BY 'VagaLume@App2025!';

-- Conceder privilégios necessários para a aplicação
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON vagalume.* TO 'vagalume_app'@'%';

-- Criar usuário de backup se não existir
CREATE USER IF NOT EXISTS 'vagalume_backup'@'%' IDENTIFIED BY 'VagaLume@Backup2025!';

-- Conceder privilégios de backup
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON vagalume.* TO 'vagalume_backup'@'%';

-- Atualizar privilégios
FLUSH PRIVILEGES;

-- Configurar formato brasileiro para números
SET SESSION lc_numeric = 'pt_BR';

-- Log de inicialização
SELECT 'VagaLume MySQL 8.0 Database initialized successfully!' as status,
       NOW() as timestamp,
       @@version as mysql_version,
       @@character_set_database as charset,
       @@collation_database as collation;