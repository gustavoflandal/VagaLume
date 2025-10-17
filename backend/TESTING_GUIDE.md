# 🧪 Guia de Testes - VagaLume Backend

## 📋 Índice

1. [Configuração](#configuração)
2. [Executando Testes](#executando-testes)
3. [Estrutura de Testes](#estrutura-de-testes)
4. [Testes Implementados](#testes-implementados)
5. [Criando Novos Testes](#criando-novos-testes)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Configuração

### 1. Banco de Dados de Teste

**IMPORTANTE:** Use um banco de dados separado para testes!

```bash
# Conectar ao MySQL
mysql -u root -p

# Criar banco de teste
CREATE DATABASE vagalume_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Sair
exit
```

### 2. Variáveis de Ambiente

O arquivo `.env.test` já está configurado. Verifique se as credenciais estão corretas:

```bash
# .env.test
DATABASE_URL="mysql://vagalume:VagaLume@User2025!@localhost:3306/vagalume_test"
```

### 3. Aplicar Schema ao Banco de Teste

```bash
# Aplicar schema Prisma ao banco de teste
npx dotenv -e .env.test -- npx prisma db push
```

---

## 🚀 Executando Testes

### Todos os Testes

```bash
npm test
```

### Testes em Modo Watch

```bash
npm run test:watch
```

### Testes com Cobertura

```bash
npm run test:coverage
```

### Testes Específicos

```bash
# Apenas testes de autenticação
npm test -- auth.test

# Apenas testes de categorias
npm test -- categories.test

# Teste específico por nome
npm test -- -t "deve criar uma categoria principal"
```

### Testes Verbosos

```bash
npm test -- --verbose
```

---

## 📁 Estrutura de Testes

```
backend/
├── tests/
│   ├── setup.ts                    # Configuração global dos testes
│   ├── helpers/
│   │   └── testHelpers.ts          # Funções auxiliares
│   ├── integration/                # Testes de integração (API)
│   │   ├── auth.test.ts
│   │   ├── categories.test.ts
│   │   ├── accounts.test.ts
│   │   ├── transactions.test.ts
│   │   └── ...
│   └── unit/                       # Testes unitários (serviços)
│       ├── auth.service.test.ts
│       ├── category.service.test.ts
│       └── ...
├── jest.config.js                  # Configuração do Jest
└── .env.test                       # Variáveis de ambiente de teste
```

---

## ✅ Testes Implementados

### 1. Autenticação (`auth.test.ts`)

**Cobertura:**
- ✅ Registro de usuário
- ✅ Login
- ✅ Refresh de token
- ✅ Logout
- ✅ Obter perfil do usuário

**Cenários testados:**
- Sucesso em operações válidas
- Erros de validação (dados inválidos)
- Erros de autenticação (credenciais inválidas)
- Erros de autorização (token inválido/ausente)

**Comandos:**
```bash
npm test -- auth.test
```

### 2. Categorias (`categories.test.ts`)

**Cobertura:**
- ✅ Criar categoria principal
- ✅ Criar subcategoria
- ✅ Listar categorias
- ✅ Buscar categoria por ID
- ✅ Atualizar categoria
- ✅ Excluir categoria

**Cenários testados:**
- Criação de categorias e subcategorias
- Validação de parentId
- Isolamento de dados entre usuários
- Prevenção de categoria ser pai dela mesma

**Comandos:**
```bash
npm test -- categories.test
```

---

## 🔨 Criando Novos Testes

### Template de Teste de Integração

```typescript
import request from 'supertest';
import App from '@/app';
import { createTestUser, generateTestToken } from '../helpers/testHelpers';

describe('Module API', () => {
  let app: App;
  let server: any;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    app = new App();
    server = app.app;
    
    const user = await createTestUser();
    userId = user.id;
    token = generateTestToken(userId);
  });

  describe('POST /api/module', () => {
    it('deve criar recurso com sucesso', async () => {
      const data = { name: 'Test' };

      const response = await request(server)
        .post('/api/module')
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.name).toBe(data.name);
    });

    it('deve retornar erro 400 se dados inválidos', async () => {
      const response = await request(server)
        .post('/api/module')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      const response = await request(server)
        .post('/api/module')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});
```

### Helpers Disponíveis

```typescript
// Criar usuário de teste
const user = await createTestUser({
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test123!',
});

// Gerar token JWT
const token = generateTestToken(userId);
const refreshToken = generateTestRefreshToken(userId);

// Criar categoria
const category = await createTestCategory(userId, {
  name: 'Test Category',
  color: '#6366f1',
  icon: '📁',
});

// Criar conta
const account = await createTestAccount(userId, {
  name: 'Test Account',
  type: 'CHECKING',
  initialBalance: 1000,
});

// Criar transação
const transaction = await createTestTransaction(userId, {
  type: 'EXPENSE',
  amount: 100,
  description: 'Test Transaction',
  fromAccountId: account.id,
});

// Criar budget
const budget = await createTestBudget(userId, {
  name: 'Test Budget',
  amount: 1000,
  period: 'MONTHLY',
});

// Criar bill
const bill = await createTestBill(userId, {
  name: 'Test Bill',
  amount: 100,
  dueDate: new Date(),
});

// Criar piggy bank
const piggyBank = await createTestPiggyBank(userId, {
  name: 'Test Piggy Bank',
  targetAmount: 1000,
});
```

---

## 🐛 Troubleshooting

### Erro: "NODE_ENV deve ser 'test'"

**Solução:** Certifique-se de que o arquivo `.env.test` existe e contém `NODE_ENV=test`.

### Erro: "Cannot connect to database"

**Soluções:**
1. Verificar se MySQL está rodando
2. Verificar credenciais no `.env.test`
3. Criar banco de teste: `CREATE DATABASE vagalume_test;`
4. Aplicar schema: `npx dotenv -e .env.test -- npx prisma db push`

### Erro: "Table doesn't exist"

**Solução:**
```bash
npx dotenv -e .env.test -- npx prisma db push --force-reset
```

### Testes Falhando por Timeout

**Solução:** Aumentar timeout no `jest.config.js`:
```javascript
testTimeout: 60000, // 60 segundos
```

### Banco de Dados Não Limpa Entre Testes

**Solução:** Verificar se `tests/setup.ts` está sendo carregado:
```javascript
// jest.config.js
setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
```

### Erro: "Foreign key constraint fails"

**Solução:** A ordem de limpeza das tabelas em `setup.ts` está incorreta. Ajustar para respeitar dependências.

---

## 📊 Cobertura de Testes

### Ver Relatório de Cobertura

```bash
npm run test:coverage
```

O relatório será gerado em `coverage/lcov-report/index.html`.

### Abrir Relatório no Navegador

```bash
# Windows
start coverage/lcov-report/index.html

# Linux/Mac
open coverage/lcov-report/index.html
```

### Meta de Cobertura

- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

---

## 🎯 Próximos Módulos a Testar

### Alta Prioridade
- [ ] **Accounts** - Contas bancárias
- [ ] **Transactions** - Transações financeiras
- [ ] **Budgets** - Orçamentos

### Média Prioridade
- [ ] **Bills** - Contas a pagar
- [ ] **Piggy Banks** - Cofrinhos
- [ ] **Rules** - Regras de automação

### Baixa Prioridade
- [ ] **Recurrences** - Transações recorrentes
- [ ] **Tags** - Tags de transações
- [ ] **Webhooks** - Webhooks
- [ ] **Object Groups** - Grupos de objetos

---

## 📝 Boas Práticas

### 1. Nomenclatura

```typescript
// ✅ BOM
describe('POST /api/categories', () => {
  it('deve criar uma categoria com sucesso', async () => {
    // ...
  });
});

// ❌ RUIM
describe('categories', () => {
  it('works', async () => {
    // ...
  });
});
```

### 2. Arrange-Act-Assert

```typescript
it('deve criar categoria', async () => {
  // Arrange (preparar)
  const data = { name: 'Test' };
  
  // Act (executar)
  const response = await request(server)
    .post('/api/categories')
    .send(data);
  
  // Assert (verificar)
  expect(response.status).toBe(201);
  expect(response.body.data.name).toBe(data.name);
});
```

### 3. Isolamento

- Cada teste deve ser independente
- Usar `beforeEach` para setup comum
- Limpar dados após cada teste (feito automaticamente)

### 4. Dados de Teste

- Usar helpers para criar dados
- Evitar hardcoded IDs
- Usar timestamps para nomes únicos

### 5. Asserções Específicas

```typescript
// ✅ BOM
expect(response.body.data.name).toBe('Test Category');

// ❌ RUIM
expect(response.body).toBeTruthy();
```

---

## 🔗 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

**Última atualização:** 2025-10-16
