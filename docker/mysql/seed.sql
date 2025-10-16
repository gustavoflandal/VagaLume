-- Dados de exemplo para desenvolvimento do VagaLume
-- Este script popula o banco com dados básicos para teste

USE vagalume;

-- Inserir tipos de conta padrão (será criado via Prisma migrations)
-- Aguardando criação das tabelas pelo Prisma

-- Log de seed
SELECT 'VagaLume seed data loaded successfully!' as status,
       'Aguardando criação das tabelas via Prisma migrations' as note;