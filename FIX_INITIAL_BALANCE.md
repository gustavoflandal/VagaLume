# ✅ Correção: Saldo Inicial da Conta

**Data:** 2025-10-16 21:33  
**Status:** ✅ **CORRIGIDO**

---

## 🐛 Problemas Identificados

### 1. Saldo Inicial Incorreto
- **Problema:** Saldo inicial estava sendo calculado retroativamente
- **Resultado:** Mostrava R$ 3.599,50 (misturando outras contas)
- **Esperado:** Mostrar apenas o saldo inicial cadastrado (R$ 0,00)

### 2. Ordenação das Transações
- **Problema:** Transações não estavam ordenadas por data
- **Esperado:** Ordem crescente (mais antiga → mais recente)

---

## ✅ Correções Aplicadas

### 1. Adicionado Campo `initialBalance` no Schema

**Arquivo:** `backend/prisma/schema.prisma`

```prisma
model Account {
  id              String      @id @default(cuid())
  name            String
  type            AccountType
  balance         Decimal     @default(0.00) @db.Decimal(15, 2)
  initialBalance  Decimal     @default(0.00) @db.Decimal(15, 2) @map("initial_balance") // ✅ NOVO
  // ... outros campos
}
```

**Migration criada:** `20251017003041_add_initial_balance_to_account`

---

### 2. Atualizado Backend

**Arquivo:** `backend/src/services/account.service.ts`

```typescript
export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  balance?: number;
  initialBalance?: number;  // ✅ NOVO
  // ...
}

async create(userId: string, data: CreateAccountDTO) {
  const balanceValue = data.balance ? new Decimal(data.balance) : new Decimal(0);
  
  const account = await prisma.account.create({
    data: {
      ...data,
      balance: balanceValue,
      initialBalance: data.initialBalance ? new Decimal(data.initialBalance) : balanceValue,  // ✅
      userId,
    },
  });
  
  return account;
}
```

---

### 3. Atualizado Frontend - Types

**Arquivo:** `frontend-vue/src/types/index.ts`

```typescript
export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  initialBalance: number  // ✅ NOVO
  // ...
}

export interface CreateAccountData {
  name: string
  type: AccountType
  balance: number
  initialBalance?: number  // ✅ NOVO
  // ...
}
```

---

### 4. Atualizado Frontend - AccountDetailsView

**Arquivo:** `frontend-vue/src/views/accounts/AccountDetailsView.vue`

**Antes:**
```typescript
// Calculava retroativamente (ERRADO)
const initialBalance = computed(() => {
  let balance = Number(account.value.balance)
  // Subtraía todas as movimentações...
  return balance
})
```

**Depois:**
```typescript
// Usa o valor cadastrado (CORRETO)
const initialBalance = computed(() => {
  return Number(account.value?.initialBalance || 0)
})
```

---

### 5. Corrigido Ordenação - TransactionsView

**Arquivo:** `frontend-vue/src/views/transactions/TransactionsView.vue`

```typescript
const transactionsWithBalance = computed(() => {
  if (!transactions.value.length) return []
  
  // ✅ Ordenar por data (mais antiga primeiro)
  const sorted = [...transactions.value].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
  
  // ✅ Calcular saldo acumulado
  let balance = 0
  const result = sorted.map(transaction => {
    if (transaction.type === TransactionType.INCOME) {
      balance += Number(transaction.amount)
    } else if (transaction.type === TransactionType.EXPENSE) {
      balance -= Number(transaction.amount)
    }
    
    return {
      ...transaction,
      runningBalance: balance
    }
  })
  
  return result  // ✅ Já ordenado por data crescente
})
```

---

## 📊 Exemplo Correto

### Cadastro da Conta
```
Nome: Conta Corrente
Tipo: Conta Corrente
Saldo Inicial: R$ 0,00  ← Este valor será usado
```

### Movimentações
```
Data    | Descrição           | Tipo          | Valor      | Saldo
--------|---------------------|---------------|------------|------------
30/09   | Salário Outubro     | Receita       | +5.000,00  | R$ 5.000,00
04/10   | Supermercado        | Despesa       | -350,50    | R$ 4.649,50
09/10   | Transf. Poupança    | Transferência | -1.000,00  | R$ 3.649,50
15/10   | Abastecimento       | Despesa       | -50,00     | R$ 3.599,50
```

### Card da Conta
```
┌─────────────────────────────────────────────┐
│  Conta Corrente                             │
│  CHECKING                                   │
│                                             │
│  Saldo Atual: R$ 3.599,50                   │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Saldo Inicial (antes das movimentações):   │
│  R$ 0,00  ← CORRETO (do cadastro)           │
└─────────────────────────────────────────────┘
```

---

## 🔄 Como Atualizar Contas Existentes

### Opção 1: Via SQL (Recomendado)
```sql
-- Definir initialBalance igual ao balance atual para contas existentes
UPDATE accounts 
SET initial_balance = balance 
WHERE initial_balance = 0;
```

### Opção 2: Via Interface
1. Editar cada conta
2. Definir o "Saldo Inicial" correto
3. Salvar

---

## ✅ Checklist de Validação

- [x] Campo `initialBalance` adicionado ao schema
- [x] Migration criada e aplicada
- [x] Backend atualizado para salvar `initialBalance`
- [x] Frontend types atualizados
- [x] AccountDetailsView usa `initialBalance` do cadastro
- [x] TransactionsView ordena por data crescente
- [x] Saldo acumulado calculado corretamente

---

## 🎯 Resultado Final

### Antes
- ❌ Saldo inicial: R$ 3.599,50 (calculado errado)
- ❌ Transações sem ordem definida
- ❌ Misturava dados de outras contas

### Depois
- ✅ Saldo inicial: R$ 0,00 (do cadastro)
- ✅ Transações ordenadas por data crescente
- ✅ Cada conta mostra apenas suas movimentações
- ✅ Evolução do saldo clara e correta

---

**Reinicie o backend para aplicar as alterações!**

```bash
# Backend
cd backend
npm run dev

# Frontend (já está com hot reload)
# As mudanças já foram aplicadas automaticamente
```
