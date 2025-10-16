# Documentação do VagaLume

Bem-vindo à documentação técnica do VagaLume! 📚

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Guia de Início Rápido](#guia-de-início-rápido)
- [Documentação da API](#documentação-da-api)
- [Componentes Frontend](#componentes-frontend)
- [Banco de Dados](#banco-de-dados)
- [Deploy e Infraestrutura](#deploy-e-infraestrutura)
- [Guias de Desenvolvimento](#guias-de-desenvolvimento)

## 🎯 Visão Geral

O VagaLume é um sistema moderno de gestão financeira pessoal desenvolvido com as seguintes tecnologias principais:

- **Backend:** Node.js + TypeScript + Express + Prisma
- **Frontend:** Vue 3 + TypeScript + Vite + TailwindCSS
- **Banco de Dados:** MySQL 8.0
- **Cache:** Redis (opcional)
- **Containerização:** Docker + Docker Compose

## 🚀 Guia de Início Rápido

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vagalume.git
cd vagalume

# Instale dependências
npm run install:all

# Configure o ambiente
cp .env.example .env

# Configure o banco de dados
npm run db:setup

# Inicie o desenvolvimento
npm run dev
```

### Docker (Recomendado)
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vagalume.git
cd vagalume

# Configure o ambiente
cp .env.example .env

# Inicie com Docker
docker-compose up -d

# Acesse: http://localhost:3000
```

## 📖 Documentação Detalhada

### 🔗 Links Rápidos

| Documento | Descrição |
|-----------|-----------|
| [API Reference](api.md) | Documentação completa da API REST |
| [Database Schema](database.md) | Esquema do banco de dados e migrations |
| [Components Guide](components.md) | Guia dos componentes Vue.js |
| [Authentication](auth.md) | Sistema de autenticação e autorização |
| [Deployment Guide](deployment.md) | Guia de deploy para produção |
| [Development Guide](development.md) | Guia para desenvolvedores |
| [Testing Guide](testing.md) | Estratégias e guias de teste |
| [Architecture](architecture.md) | Arquitetura e design patterns |

### 🔧 Configuração

#### Variáveis de Ambiente
```bash
# Aplicação
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Banco de Dados
DATABASE_URL="mysql://user:password@localhost:3306/vagalume"

# JWT
JWT_SECRET=sua_chave_secreta
JWT_REFRESH_SECRET=sua_chave_refresh
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

#### Configuração do MySQL
```sql
CREATE DATABASE vagalume CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vagalume'@'localhost' IDENTIFIED BY 'senha_forte';
GRANT ALL PRIVILEGES ON vagalume.* TO 'vagalume'@'localhost';
FLUSH PRIVILEGES;
```

### 🛠 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                # Inicia backend + frontend
npm run dev:backend        # Apenas backend
npm run dev:frontend       # Apenas frontend

# Build
npm run build              # Build completo
npm run build:backend      # Build do backend
npm run build:frontend     # Build do frontend

# Testes
npm test                   # Todos os testes
npm run test:backend       # Testes do backend
npm run test:frontend      # Testes do frontend
npm run test:e2e          # Testes end-to-end

# Banco de Dados
npm run db:migrate         # Executa migrations
npm run db:seed           # Popula dados iniciais
npm run db:reset          # Reset completo do banco

# Docker
npm run docker:dev        # Ambiente Docker desenvolvimento
npm run docker:down       # Para containers
npm run docker:logs       # Visualiza logs
```

## 🏗 Arquitetura do Sistema

### Estrutura de Pastas
```
vagalume/
├── 📁 backend/                 # API Node.js + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Controladores da API
│   │   ├── 📁 services/        # Lógica de negócio
│   │   ├── 📁 models/          # Modelos Prisma
│   │   ├── 📁 middleware/      # Middlewares Express
│   │   ├── 📁 routes/          # Rotas da API
│   │   ├── 📁 utils/           # Utilitários
│   │   └── 📄 app.ts           # Aplicação Express
│   ├── 📁 prisma/              # Schema e migrations
│   └── 📁 tests/               # Testes
│
├── 📁 frontend/                # SPA Vue 3 + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/      # Componentes Vue
│   │   ├── 📁 views/           # Páginas/Views
│   │   ├── 📁 stores/          # Estado Pinia
│   │   ├── 📁 composables/     # Composables Vue
│   │   └── 📁 utils/           # Utilitários
│   └── 📁 tests/               # Testes
│
├── 📁 docs/                    # Documentação
├── 📁 docker/                  # Arquivos Docker
└── 📁 scripts/                 # Scripts de automação
```

### Fluxo de Dados
```mermaid
graph TD
    A[Frontend Vue.js] --> B[API Express.js]
    B --> C[Services Layer]
    C --> D[Prisma ORM]
    D --> E[MySQL Database]
    
    B --> F[Redis Cache]
    B --> G[File Storage]
    
    H[Authentication] --> B
    I[Validation] --> B
    J[Error Handling] --> B
```

### Padrões Utilizados
- **MVC Pattern** - Separação de responsabilidades
- **Repository Pattern** - Abstração do acesso a dados
- **Service Layer Pattern** - Lógica de negócio centralizada
- **DTO Pattern** - Transfer Objects para APIs
- **Factory Pattern** - Criação de objetos complexos

## 🔐 Segurança

### Autenticação
- JWT tokens com refresh tokens
- Bcrypt para hash de senhas
- Rate limiting por IP
- CORS configurado

### Validação
- Validação de entrada com Zod
- Sanitização de dados
- Proteção contra SQL Injection (Prisma)
- XSS protection

### Boas Práticas
- Princípio do menor privilégio
- Logs de segurança
- Versionamento de API
- HTTPS obrigatório em produção

## 📊 Monitoramento

### Métricas Coletadas
- Performance da API
- Uso de recursos
- Erros e exceções
- Métricas de negócio

### Ferramentas
- **Logs:** Winston + Morgan
- **Métricas:** Prometheus (opcional)
- **Monitoramento:** Grafana (opcional)
- **Errors:** Sentry (opcional)

## 🧪 Testes

### Estratégia de Testes
- **Unitários:** Jest + Supertest
- **Integração:** Testcontainers
- **E2E:** Cypress
- **Componentes:** Vue Test Utils

### Cobertura Mínima
- Código: 80%
- Branches: 75%
- Funções: 85%
- Linhas: 80%

## 🚀 Deploy

### Ambientes
- **Development:** Docker Compose local
- **Staging:** Docker Swarm ou Kubernetes
- **Production:** Kubernetes + Helm

### CI/CD Pipeline
```yaml
stages:
  - lint
  - test
  - build
  - security_scan
  - deploy_staging
  - e2e_tests
  - deploy_production
```

## 📞 Suporte

### Canais de Comunicação
- 🐛 **Bugs:** [GitHub Issues](https://github.com/usuario/vagalume/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/usuario/vagalume/discussions)
- 📧 **Email:** suporte@vagalume.com.br
- 💬 **Discord:** [Servidor VagaLume](https://discord.gg/vagalume)

### Recursos Adicionais
- [FAQ](faq.md)
- [Troubleshooting](troubleshooting.md)
- [Changelog](../CHANGELOG.md)
- [Roadmap](../README.md#roadmap)

---

**Documentação mantida pela comunidade VagaLume** 📝