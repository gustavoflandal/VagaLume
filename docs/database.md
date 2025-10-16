# 🗄️ Banco de Dados MySQL 8.0 - VagaLume

Documentação completa da configuração e uso do MySQL 8.0 no projeto VagaLume.

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Configuração](#-configuração)
- [Credenciais de Acesso](#-credenciais-de-acesso)
- [Containers Disponíveis](#-containers-disponíveis)
- [Comandos Essenciais](#-comandos-essenciais)
- [Conexão via Aplicação](#-conexão-via-aplicação)
- [phpMyAdmin](#-phpmyadmin)
- [Backup e Restore](#-backup-e-restore)
- [Monitoramento](#-monitoramento)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

### **Versão e Configuração**
- **Versão:** MySQL 8.0.35-debian
- **Engine:** InnoDB
- **Charset:** UTF8MB4 (suporte completo a emojis e acentos)
- **Collation:** utf8mb4_unicode_ci
- **Timezone:** America/Sao_Paulo (-03:00)
- **SQL Mode:** STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION

### **Recursos Financeiros Específicos**
- ✅ **Precisão Decimal:** Configurado para valores monetários
- ✅ **Timezone Brasil:** Configurado para fuso horário brasileiro
- ✅ **Formato de Data:** pt_BR para relatórios localizados
- ✅ **Transações ACID:** Garantia de integridade para dados financeiros
- ✅ **Charset Completo:** Suporte a caracteres especiais brasileiros

---

## ⚙️ Configuração

### **Docker Compose Files**

#### **1. Desenvolvimento Simplificado** (`docker-compose.simple.yml`)
```yaml
# Container básico apenas com MySQL
docker-compose -f docker-compose.simple.yml up -d
```

#### **2. Ambiente Completo** (`docker-compose.mysql.yml`)
```yaml
# MySQL + phpMyAdmin + Backup automático
docker-compose -f docker-compose.mysql.yml up -d
```

#### **3. Stack Completa** (`docker-compose.yml`)
```yaml
# MySQL + Redis + Backend + Frontend + Nginx
docker-compose up -d
```

### **Volumes Persistentes**
```yaml
mysql_data: /var/lib/mysql          # Dados do banco
mysql_logs: /var/log/mysql          # Logs do MySQL
mysql_backups: /backup              # Backups automáticos
```

---

## 🔐 Credenciais de Acesso

### **Usuários Configurados**

| Usuário | Senha | Privilégios | Uso |
|---------|-------|-------------|-----|
| `root` | `VagaLume@Root2025!` | Administrador completo | Configuração inicial |
| `vagalume` | `VagaLume@User2025!` | Banco vagalume completo | Desenvolvimento |
| `vagalume_app` | `VagaLume@App2025!` | CRUD no banco vagalume | Aplicação |
| `vagalume_backup` | `VagaLume@Backup2025!` | SELECT, LOCK TABLES | Backups |

### **Strings de Conexão**

#### **Para Desenvolvimento Local**
```bash
# MySQL CLI
mysql -h localhost -P 3306 -u vagalume -p vagalume

# URL de Conexão (Prisma/Node.js)
DATABASE_URL="mysql://vagalume:VagaLume@User2025!@localhost:3306/vagalume"

# URL com Configurações Extras
DATABASE_URL="mysql://vagalume:VagaLume@User2025!@localhost:3306/vagalume?charset=utf8mb4&timezone=America/Sao_Paulo"
```

#### **Para Docker Interno**
```bash
# Entre containers
DATABASE_URL="mysql://vagalume:VagaLume@User2025!@mysql:3306/vagalume"
```

---

## 🐳 Containers Disponíveis

### **MySQL Principal**
```yaml
Container: vagalume_mysql_simple (simples) | vagalume_mysql (completo)
Image: mysql:8.0.35-debian
Port: 3306:3306
Status: healthy
Healthcheck: mysqladmin ping a cada 30s
```

### **phpMyAdmin** (opcional)
```yaml
Container: vagalume_phpmyadmin
Image: phpmyadmin/phpmyadmin:5.2
Port: 8080:80
URL: http://localhost:8080
```

### **Backup Automático** (opcional)
```yaml
Container: vagalume_backup
Image: fradelg/mysql-cron-backup:latest
Schedule: Diário às 2h da manhã
Retention: 7 dias
```

---

## 🚀 Comandos Essenciais

### **Gerenciamento de Containers**

```bash
# Iniciar apenas MySQL
docker-compose -f docker-compose.simple.yml up -d

# Iniciar MySQL + phpMyAdmin
docker-compose -f docker-compose.mysql.yml up -d mysql phpmyadmin

# Iniciar stack completa
docker-compose -f docker-compose.mysql.yml up -d

# Parar todos os serviços
docker-compose -f docker-compose.mysql.yml down

# Parar e remover volumes (CUIDADO!)
docker-compose -f docker-compose.mysql.yml down -v

# Ver status dos containers
docker-compose -f docker-compose.mysql.yml ps

# Ver logs do MySQL
docker-compose -f docker-compose.mysql.yml logs -f mysql
```

### **Acesso ao MySQL**

```bash
# Conectar via container
docker exec -it vagalume_mysql_simple mysql -u vagalume -p

# Executar comando direto
docker exec vagalume_mysql_simple mysql -u vagalume -pVagaLume@User2025! -e "SHOW DATABASES;"

# Conectar como root
docker exec -it vagalume_mysql_simple mysql -u root -pVagaLume@Root2025!

# Conectar em banco específico
docker exec -it vagalume_mysql_simple mysql -u vagalume -pVagaLume@User2025! vagalume
```

### **Verificação de Status**

```bash
# Verificar se MySQL está rodando
docker-compose -f docker-compose.simple.yml ps

# Testar conexão
docker exec vagalume_mysql_simple mysqladmin -u vagalume -pVagaLume@User2025! ping

# Ver versão e configurações
docker exec vagalume_mysql_simple mysql -u vagalume -pVagaLume@User2025! -e "
SELECT 
  @@version as mysql_version,
  @@character_set_server as charset,
  @@collation_server as collation,
  @@time_zone as timezone,
  @@sql_mode as sql_mode;
"

# Ver bancos de dados
docker exec vagalume_mysql_simple mysql -u vagalume -pVagaLume@User2025! -e "SHOW DATABASES;"

# Ver usuários
docker exec vagalume_mysql_simple mysql -u root -pVagaLume@Root2025! -e "SELECT User, Host FROM mysql.user;"
```

---

## 💻 Conexão via Aplicação

### **Node.js + Prisma**

#### **1. Instalar Prisma**
```bash
npm install prisma @prisma/client mysql2
npx prisma init
```

#### **2. Configurar `.env`**
```bash
DATABASE_URL="mysql://vagalume:VagaLume@User2025!@localhost:3306/vagalume"
```

#### **3. Schema Prisma Básico**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

#### **4. Executar Migrations**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### **Teste de Conexão Node.js**
```javascript
// test-connection.js
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 'Conexão OK!' as status, NOW() as timestamp`
    console.log('✅ MySQL conectado:', result[0])
  } catch (error) {
    console.error('❌ Erro de conexão:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
```

---

## 🌐 phpMyAdmin

### **Acesso Web**
- **URL:** http://localhost:8080
- **Usuário:** `vagalume`
- **Senha:** `VagaLume@User2025!`

### **Funcionalidades Disponíveis**
- ✅ **Navegação** por tabelas e dados
- ✅ **Editor SQL** com syntax highlighting
- ✅ **Importação/Exportação** de dados
- ✅ **Designer** de relacionamentos
- ✅ **Monitoramento** de queries
- ✅ **Backup/Restore** via interface

### **Comandos Úteis no phpMyAdmin**
```sql
-- Ver estrutura do banco
SHOW TABLES;

-- Ver configurações
SHOW VARIABLES LIKE '%character%';
SHOW VARIABLES LIKE '%time_zone%';

-- Ver usuários conectados
SHOW PROCESSLIST;

-- Ver status do servidor
SHOW STATUS LIKE 'Uptime';
SHOW STATUS LIKE 'Connections';
```

---

## 💾 Backup e Restore

### **Backup Manual**
```bash
# Backup completo do banco vagalume
docker exec vagalume_mysql_simple mysqldump \
  -u vagalume -pVagaLume@User2025! \
  --single-transaction \
  --routines \
  --triggers \
  vagalume > backup_vagalume_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas estrutura
docker exec vagalume_mysql_simple mysqldump \
  -u vagalume -pVagaLume@User2025! \
  --no-data \
  vagalume > schema_vagalume.sql

# Backup apenas dados
docker exec vagalume_mysql_simple mysqldump \
  -u vagalume -pVagaLume@User2025! \
  --no-create-info \
  vagalume > data_vagalume.sql
```

### **Restore Manual**
```bash
# Restaurar backup completo
docker exec -i vagalume_mysql_simple mysql \
  -u vagalume -pVagaLume@User2025! \
  vagalume < backup_vagalume_20251015_230000.sql

# Restaurar apenas estrutura
docker exec -i vagalume_mysql_simple mysql \
  -u vagalume -pVagaLume@User2025! \
  vagalume < schema_vagalume.sql
```

### **Backup Automático**
O container `vagalume_backup` executa backups automaticamente:
- **Frequência:** Diário às 2h da manhã
- **Retenção:** 7 dias
- **Local:** Volume `mysql_backups`

```bash
# Ver backups automáticos
docker exec vagalume_backup ls -la /backup

# Acessar volume de backup
docker run --rm -v vagalume_mysql_backups:/backup alpine ls -la /backup
```

---

## 📊 Monitoramento

### **Logs do MySQL**
```bash
# Logs em tempo real
docker-compose -f docker-compose.simple.yml logs -f mysql

# Logs de erro
docker exec vagalume_mysql_simple tail -f /var/log/mysql/error.log

# Logs de queries lentas
docker exec vagalume_mysql_simple tail -f /var/log/mysql/slow.log
```

### **Métricas de Performance**
```sql
-- Conectar e executar no MySQL
SHOW STATUS LIKE 'Connections';
SHOW STATUS LIKE 'Uptime';
SHOW STATUS LIKE 'Queries';
SHOW STATUS LIKE 'Slow_queries';

-- Ver tabelas com mais uso
SELECT 
  SCHEMA_NAME as database_name,
  TABLE_NAME as table_name,
  TABLE_ROWS as row_count,
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as size_mb
FROM information_schema.TABLES 
WHERE SCHEMA_NAME = 'vagalume'
ORDER BY size_mb DESC;

-- Ver conexões ativas
SHOW PROCESSLIST;
```

### **Healthcheck**
```bash
# Status do healthcheck
docker inspect vagalume_mysql_simple | grep -A 5 Health

# Forçar healthcheck
docker exec vagalume_mysql_simple mysqladmin ping -u vagalume -pVagaLume@User2025!
```

---

## 🛠 Troubleshooting

### **Problemas Comuns**

#### **1. Container não inicia**
```bash
# Ver logs de erro
docker-compose -f docker-compose.simple.yml logs mysql

# Verificar configurações
docker exec vagalume_mysql_simple cat /etc/mysql/conf.d/custom.cnf

# Reiniciar container
docker-compose -f docker-compose.simple.yml restart mysql
```

#### **2. Conexão recusada**
```bash
# Verificar se porta está aberta
docker port vagalume_mysql_simple

# Testar conectividade
telnet localhost 3306

# Verificar se processo está rodando
docker exec vagalume_mysql_simple ps aux | grep mysql
```

#### **3. Senha incorreta**
```bash
# Conectar como root e resetar senha
docker exec -it vagalume_mysql_simple mysql -u root -pVagaLume@Root2025!

# No MySQL:
ALTER USER 'vagalume'@'%' IDENTIFIED BY 'NovaSenha123!';
FLUSH PRIVILEGES;
```

#### **4. Banco não existe**
```bash
# Criar banco manualmente
docker exec -it vagalume_mysql_simple mysql -u root -pVagaLume@Root2025! -e "
CREATE DATABASE IF NOT EXISTS vagalume 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
"
```

#### **5. Performance lenta**
```bash
# Verificar queries lentas
docker exec vagalume_mysql_simple mysql -u root -pVagaLume@Root2025! -e "
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
"

# Verificar status do InnoDB
docker exec vagalume_mysql_simple mysql -u root -pVagaLume@Root2025! -e "
SHOW ENGINE INNODB STATUS\G
"
```

### **Comandos de Diagnóstico**
```bash
# Informações completas do sistema
docker exec vagalume_mysql_simple mysql -u root -pVagaLume@Root2025! -e "
SELECT 
  @@version as MySQL_Version,
  @@version_comment as Version_Comment,
  @@character_set_server as Default_Charset,
  @@collation_server as Default_Collation,
  @@time_zone as Timezone,
  @@sql_mode as SQL_Mode,
  @@innodb_buffer_pool_size as InnoDB_Buffer_Pool,
  @@max_connections as Max_Connections;
"

# Status das conexões
docker exec vagalume_mysql_simple mysql -u root -pVagaLume@Root2025! -e "
SHOW STATUS WHERE Variable_name IN (
  'Connections', 'Max_used_connections', 'Threads_connected', 
  'Threads_running', 'Uptime', 'Questions'
);
"
```

---

## 🔧 Configurações Avançadas

### **Ajustes de Performance**
```bash
# Para desenvolvimento (arquivo my.cnf)
innodb_buffer_pool_size = 512M
max_connections = 200

# Para produção
innodb_buffer_pool_size = 2G
max_connections = 500
innodb_log_file_size = 256M
```

### **Variáveis de Ambiente Importantes**
```bash
MYSQL_ROOT_PASSWORD=VagaLume@Root2025!
MYSQL_DATABASE=vagalume
MYSQL_USER=vagalume
MYSQL_PASSWORD=VagaLume@User2025!
MYSQL_CHARSET=utf8mb4
MYSQL_COLLATION=utf8mb4_unicode_ci
TZ=America/Sao_Paulo
```

---

## 📝 Changelog

### **v1.0 - Setup Inicial** *(15/10/2025)*
- ✅ MySQL 8.0.35 configurado
- ✅ Charset UTF8MB4 para suporte brasileiro
- ✅ Timezone America/Sao_Paulo
- ✅ Usuários e privilégios configurados
- ✅ Scripts de inicialização funcionais
- ✅ Docker Compose otimizado
- ✅ phpMyAdmin integrado
- ✅ Backup automático configurado
- ✅ Healthcheck implementado

---

## 📞 Suporte

### **Logs Importantes**
- **Error Log:** `/var/log/mysql/error.log`
- **Slow Query Log:** `/var/log/mysql/slow.log`
- **Container Logs:** `docker logs vagalume_mysql_simple`

### **Comandos de Emergência**
```bash
# Parar tudo
docker-compose -f docker-compose.simple.yml down

# Reset completo (CUIDADO!)
docker-compose -f docker-compose.simple.yml down -v
docker system prune -f

# Backup de emergência
docker exec vagalume_mysql_simple mysqldump -u root -pVagaLume@Root2025! --all-databases > emergency_backup.sql
```

---

**Documentação mantida pela equipe VagaLume** 📝  
**Última atualização:** 15 de outubro de 2025