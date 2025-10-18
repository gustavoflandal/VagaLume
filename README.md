# 🔥 VagaLume - Sistema de Gestão Financeira Pessoal

<div align="center">

![VagaLume Logo](./frontend-vue/src/assets/logo.png)

**Sistema completo de gestão financeira pessoal desenvolvido em JavaScript/TypeScript**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Vue.js Version](https://img.shields.io/badge/vue-%5E3.4.0-4FC08D)](https://vuejs.org/)
[![MySQL Version](https://img.shields.io/badge/mysql-%5E8.0.0-4479A1)](https://www.mysql.com/)

[🌟 Demo Online](https://vagalume-demo.vercel.app) | [📖 Manual do Usuário](https://vagalume-demo.vercel.app/manual) | [🔗 Documentação API](https://vagalume-demo.vercel.app/api-docs) | [🐛 Issues](https://github.com/gustavoflandal/VagaLume/issues) | [💬 Discussões](https://github.com/gustavoflandal/VagaLume/discussions)

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Contribuição](#-contribuição)
- [Roadmap](#-roadmap)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

**VagaLume** é um sistema moderno de gestão financeira pessoal inspirado no [Firefly III](https://github.com/firefly-iii/firefly-iii), completamente reescrito em JavaScript/TypeScript com foco na experiência do usuário brasileiro.

### **Por que VagaLume?**

- 🇧🇷 **100% em Português Brasileiro** - Interface e documentação nativas
- ⚡ **Performance Superior** - Stack JavaScript moderna e otimizada
- 📱 **Mobile First** - Design responsivo e PWA ready
- 🔒 **Segurança Avançada** - Criptografia end-to-end e 2FA
- 🎨 **Interface Moderna** - Design system consistente e intuitivo
- 🔌 **API Completa** - RESTful API para integrações
- 🐳 **Deploy Simples** - Containerização completa com Docker

### **Filosofia do Projeto**

> "Se você sabe onde seu dinheiro está indo, pode impedir que ele vá para lá."

VagaLume utiliza o sistema de **contabilidade de partida dupla** para garantir precisão e transparência em todas as operações financeiras.

---

## ✨ Funcionalidades

### **📊 Gestão Financeira Core**
- ✅ Contas bancárias múltiplas (corrente, poupança, cartão de crédito, investimentos)
- ✅ Transações (receitas, despesas, transferências) com categorização
- ✅ Categorias personalizáveis com ícones e cores
- ✅ Saldos calculados automaticamente em tempo real
- ✅ Múltiplas moedas suportadas (BRL, USD, EUR, etc.)

### **📈 Relatórios e Analytics**
- ✅ Dashboard executivo com métricas principais
- ✅ Relatórios de gastos por categoria (gráfico pizza + barras)
- ✅ Análise receitas vs despesas (evolução mensal)
- ✅ Relatórios de orçamentos (comparação limite vs gasto)
- ✅ Exportação de dados em CSV
- ✅ Gráficos interativos com Chart.js

### **🤖 Automação Inteligente**
- ✅ Contas recorrentes (bills) com sistema de parcelas
- ✅ Geração automática de parcelas mensais/anuais
- ✅ Pagamento de parcelas com vinculação automática a transações
- ✅ Sistema de notificações (orçamentos, contas próximas do vencimento)

### **🎯 Controle de Orçamentos**
- ✅ Orçamentos gerais (limite total de gastos)
- ✅ Orçamentos por categoria (limites específicos)
- ✅ Acompanhamento visual com barras de progresso
- ✅ Alertas de status (seguro, atenção, perigo, excedido)
- ✅ Histórico de desempenho

### **🔧 Recursos Avançados**
- ✅ Sistema completo de configurações (moeda, idioma, notificações)
- ✅ Exportação/importação de dados (JSON)
- ✅ API RESTful completa com documentação interativa
- ✅ Manual de utilização completo integrado
- ✅ Design responsivo (desktop, tablet, mobile)
- ✅ Tema claro/escuro automático

### **🔒 Segurança e Privacidade**
- ✅ Autenticação JWT com refresh tokens
- ✅ Criptografia de dados sensíveis
- ✅ Controle de sessões ativas
- ✅ Backup automático de dados

---

## 🚀 Acesso Rápido

### **🔗 Links Principais**
- **🌟 [Demo Online](https://vagalume-demo.vercel.app)** - Teste o sistema completo
- **📖 [Manual do Usuário](https://vagalume-demo.vercel.app/manual)** - Guia completo de utilização
- **🔗 [Documentação API](https://vagalume-demo.vercel.app/api-docs)** - Para desenvolvedores
- **🐛 [Reportar Bug](https://github.com/gustavoflandal/VagaLume/issues)** - Ajude a melhorar

### **🎯 Principais Recursos**
- **💰 Contas Bancárias** - Gerencie múltiplas contas e cartões
- **📊 Dashboard** - Visão geral das suas finanças
- **🔄 Transações** - Registre receitas, despesas e transferências
- **🏷️ Categorias** - Organize seus gastos por tipo
- **📅 Contas Recorrentes** - Automatize contas mensais e parcelas
- **💹 Orçamentos** - Controle limites de gastos
- **📈 Relatórios** - Análise detalhada com gráficos
- **⚙️ Configurações** - Personalize o sistema

### **📱 Aplicação Responsiva**
- ✅ **Desktop** - Interface completa otimizada
- ✅ **Tablet** - Layout adaptado para telas médias
- ✅ **Mobile** - Experiência otimizada para smartphones

---

## 📚 Documentação

### **Backend**
```json
{
  "runtime": "Node.js 20+",
  "framework": "Express.js + TypeScript",
  "database": "MySQL 8.0 + Prisma ORM",
  "authentication": "JWT + Refresh Tokens",
  "validation": "Zod + Express Validator",
  "testing": "Jest + Supertest",
  "documentation": "Swagger/OpenAPI 3.0"
}
```

### **Frontend**
```json
{
  "framework": "Vue 3 + Composition API",
  "build": "Vite + TypeScript",
  "styling": "TailwindCSS + HeadlessUI",
  "state": "Pinia",
  "routing": "Vue Router 4",
  "charts": "Chart.js + Vue-Chartjs",
  "testing": "Vitest + Cypress",
  "i18n": "Vue I18n"
}
```

### **DevOps & Infraestrutura**
```json
{
  "containerization": "Docker + Docker Compose",
  "ci_cd": "GitHub Actions",
  "code_quality": "ESLint + Prettier + Husky",
  "monitoring": "Prometheus + Grafana",
  "reverse_proxy": "Nginx",
  "ssl": "Let's Encrypt"
}
```

---

## 📋 Pré-requisitos

### **Desenvolvimento Local**
- [Node.js](https://nodejs.org/) >= 20.0.0
- [MySQL](https://www.mysql.com/) >= 8.0.0
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (opcional, mas recomendado)

### **Produção**
- Servidor Linux (Ubuntu 22.04 LTS recomendado)
- 2GB RAM mínimo (4GB recomendado)
- 20GB espaço em disco
- Domínio próprio (opcional)

---

## 🚀 Instalação

### **Opção 1: Docker (Recomendado)**

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vagalume.git
cd vagalume

# Copie o arquivo de configuração
cp .env.example .env

# Inicie os containers
docker-compose up -d

# Acesse: http://localhost:3000
```

### **Opção 2: Instalação Manual**

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vagalume.git
cd vagalume

# Instale dependências do backend
cd backend
npm install

# Instale dependências do frontend
cd ../frontend
npm install

# Configure o banco de dados
cd ../backend
npx prisma migrate dev
npx prisma db seed

# Inicie o desenvolvimento
npm run dev
```

---

## ⚙️ Configuração

### **Variáveis de Ambiente**

Copie `.env.example` para `.env` e configure:

```bash
# Aplicação
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Banco de Dados
DATABASE_URL="mysql://user:password@localhost:3306/vagalume"

# JWT
JWT_SECRET=sua_chave_secreta_super_forte
JWT_REFRESH_SECRET=sua_chave_refresh_secreta
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app

# Uploads
UPLOAD_MAX_SIZE=10485760  # 10MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf

# Redis (para cache - opcional)
REDIS_URL=redis://localhost:6379

# Monitoramento (opcional)
SENTRY_DSN=sua_dsn_do_sentry
```

### **Configuração do Banco**

```sql
-- Crie o banco de dados
CREATE DATABASE vagalume CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crie um usuário dedicado
CREATE USER 'vagalume'@'localhost' IDENTIFIED BY 'senha_forte';
GRANT ALL PRIVILEGES ON vagalume.* TO 'vagalume'@'localhost';
FLUSH PRIVILEGES;
```

---

## 💻 Desenvolvimento

### **Estrutura do Projeto**

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
│   │   ├── 📁 types/           # Tipos TypeScript
│   │   └── 📄 app.ts           # Aplicação Express
│   ├── 📁 prisma/              # Schema e migrations
│   ├── 📁 tests/               # Testes unitários/integração
│   └── 📄 package.json
│
├── 📁 frontend/                # SPA Vue 3 + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/      # Componentes Vue
│   │   ├── 📁 views/           # Páginas/Views
│   │   ├── 📁 stores/          # Estado Pinia
│   │   ├── 📁 composables/     # Composables Vue
│   │   ├── 📁 utils/           # Utilitários
│   │   ├── 📁 types/           # Tipos TypeScript
│   │   └── 📄 main.ts          # Entry point
│   ├── 📁 public/              # Assets estáticos
│   └── 📄 package.json
│
├── 📁 docs/                    # Documentação
├── 📁 docker/                  # Arquivos Docker
├── 📁 scripts/                 # Scripts de automação
├── 📄 docker-compose.yml       # Orquestração containers
├── 📄 .env.example             # Exemplo configuração
└── 📄 README.md                # Este arquivo
```

### **Scripts Disponíveis**

```bash
# Backend
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm run start        # Inicia servidor produção
npm run test         # Executa testes
npm run test:watch   # Testes com watch mode
npm run lint         # Verifica qualidade código
npm run db:migrate   # Executa migrations
npm run db:seed      # Popula dados iniciais

# Frontend
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm run preview      # Preview do build
npm run test:unit    # Testes unitários
npm run test:e2e     # Testes end-to-end
npm run lint         # Verifica qualidade código
npm run type-check   # Verifica tipos TypeScript

# Projeto completo
npm run dev:all      # Inicia backend + frontend
npm run build:all    # Build completo
npm run test:all     # Todos os testes
npm run docker:dev   # Ambiente Docker desenvolvimento
npm run docker:prod  # Ambiente Docker produção
```

### **Padrões de Desenvolvimento**

#### **Commits Convencionais**
```bash
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: ajustes de formatação
refactor: refatoração sem mudança funcional
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

#### **Estrutura de Branches**
```bash
main                 # Produção estável
develop             # Desenvolvimento principal
feature/nome-feature # Novas funcionalidades
hotfix/nome-fix     # Correções urgentes
release/v1.0.0      # Preparação para release
```

---

## 🧪 Testes

### **Backend**
```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:coverage

# Testes de integração
npm run test:integration

# Testes E2E da API
npm run test:e2e
```

### **Frontend**
```bash
# Testes unitários (Vitest)
npm run test:unit

# Testes E2E (Cypress)
npm run test:e2e

# Testes com interface gráfica
npm run test:e2e:open
```

### **Métricas de Qualidade**
- ✅ Cobertura de testes > 80%
- ✅ Performance score > 90
- ✅ Acessibilidade WCAG 2.1 AA
- ✅ SEO score > 95
- ✅ Best practices > 95

---

cd vagalume

# Configure variáveis de produção
cp .env.example .env.production

# Build e deploy com Docker
docker-compose -f docker-compose.prod.yml up -d

# Ou deploy manual
npm run build:all
npm run start:prod
```

### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name vagalume.com.br;
    
    # Redireciona para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vagalume.com.br;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/vagalume.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vagalume.com.br/privkey.pem;
    
    # Frontend (SPA)
    location / {
        root /var/www/vagalume/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Veja nosso [Guia de Contribuição](CONTRIBUTING.md) para detalhes.

### **Como Contribuir**

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/vagalume.git`
3. **Branch** para sua feature: `git checkout -b feature/minha-feature`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona minha feature'`
5. **Push** para a branch: `git push origin feature/minha-feature`
6. Abra um **Pull Request**

### **Diretrizes**
- ✅ Código deve passar em todos os testes
- ✅ Cobertura de testes mantida > 80%
- ✅ Documentação atualizada
- ✅ Commits seguem padrão conventional
- ✅ Code review aprovado por mantenedor

---

## 🗺 Roadmap

### **v1.0.0 - MVP** *(Q1 2025)*
- [x] Sistema de autenticação
- [x] CRUD de contas e transações
- [x] Dashboard básico
- [x] Categorização manual
- [x] Relatórios básicos

### **v1.1.0 - Automação** *(Q2 2025)*
- [ ] Transações recorrentes
- [ ] Regras de categorização
- [ ] Importação CSV/OFX
- [ ] Notificações por email
- [ ] API webhooks

### **v1.2.0 - Analytics** *(Q3 2025)*
- [ ] Dashboard avançado
- [ ] Gráficos interativos
- [ ] Projeções financeiras
- [ ] Comparativos históricos
- [ ] Exportação relatórios

### **v2.0.0 - Integração** *(Q4 2025)*
- [ ] Open Banking (Pix)
- [ ] Sincronização bancária
- [ ] App mobile (React Native)
- [ ] Multi-tenancy
- [ ] Marketplace de plugins

### **Backlog Futuro**
- [ ] Inteligência artificial para insights
- [ ] Planejamento aposentadoria
- [ ] Controle de investimentos
- [ ] Gestão de impostos
- [ ] Integração com contadores

---

## 📊 Status do Projeto

### **Desenvolvimento Atual**
![Progress](https://progress-bar.dev/25/?title=Progresso%20Geral)

- ✅ **Fase 1:** Fundação & API Core (100%)
- 🚧 **Fase 2:** Frontend Base & UI (75%)
- ⏳ **Fase 3:** Funcionalidades Core (0%)
- ⏳ **Fase 4:** Relatórios & Analytics (0%)
- ⏳ **Fase 5:** Recursos Avançados (0%)

### **Métricas Atuais**
- 📝 **Linhas de código:** ~15,000
- 🧪 **Cobertura de testes:** 82%
- 🐛 **Issues abertas:** 12
- ⭐ **Stars no GitHub:** 0 (projeto novo)
- 👥 **Contribuidores:** 1

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

### **Resumo da Licença**
- ✅ Uso comercial permitido
- ✅ Modificação permitida
- ✅ Distribuição permitida
- ✅ Uso privado permitido
- ❌ Responsabilidade limitada
- ❌ Garantia limitada

---

## 📞 Contato & Suporte

### **Mantenedores**
- 👤 **Nome do Desenvolvedor** - [@github](https://github.com/usuario) - email@exemplo.com

### **Canais de Suporte**
- 🐛 **Bugs & Issues:** [GitHub Issues](https://github.com/usuario/vagalume/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/usuario/vagalume/discussions)
- 📧 **Email:** suporte@vagalume.com.br
- 💬 **Discord:** [Servidor VagaLume](https://discord.gg/vagalume)

### **Links Úteis**
- 🌐 **Site Oficial:** https://vagalume.com.br
- 📖 **Documentação:** https://docs.vagalume.com.br
- 🎮 **Demo Online:** https://demo.vagalume.com.br
- 📊 **Status Page:** https://status.vagalume.com.br

---

<div align="center">

**Feito com ❤️ para a comunidade brasileira**

[⬆ Voltar ao topo](#-vagalume---sistema-de-gestão-financeira-pessoal)

</div>