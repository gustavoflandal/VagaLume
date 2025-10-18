# 🎯 Implementação: Orçamento Geral vs Por Categoria

## ✅ Alterações Realizadas

### **1. Ícone de Relatórios Alterado** ✅
- **Antes:** ChartBarIcon (igual ao de Orçamentos)
- **Depois:** DocumentChartBarIcon (ícone diferenciado)
- **Arquivo:** `frontend-vue/src/layouts/DashboardLayout.vue`

---

### **2. Schema Prisma Atualizado** ✅

#### **Novo Enum: BudgetType**
```prisma
enum BudgetType {
  GENERAL   // Orçamento geral (todas as categorias)
  CATEGORY  // Orçamento por categoria específica
}
```

#### **Model Budget - Campo Adicionado:**
```prisma
model Budget {
  // ... campos existentes
  type BudgetType @default(GENERAL) // NOVO
  // ...
}
```

#### **Model BudgetLimit - Campo Adicionado:**
```prisma
model BudgetLimit {
  // ... campos existentes
  categoryId String? @map("category_id") // NOVO - Categoria específica
  // ...
  
  // Relacionamento NOVO
  category Category? @relation(fields: [categoryId], references: [id])
}
```

#### **Model Category - Relacionamento Adicionado:**
```prisma
model Category {
  // ... campos existentes
  budgetLimits BudgetLimit[] // NOVO
  // ...
}
```

**Migration Aplicada:** ✅ `npx prisma db push`

---

### **3. Tipos TypeScript Atualizados** ✅

**Arquivo:** `frontend-vue/src/services/budget.service.ts`

```typescript
export interface Budget {
  id: string
  name: string
  type: 'GENERAL' | 'CATEGORY' // NOVO
  active: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface BudgetLimit {
  id: string
  budgetId: string
  categoryId?: string // NOVO - Categoria específica
  amount: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  category?: any // NOVO - Relacionamento
}

export interface CreateBudgetData {
  name: string
  type?: 'GENERAL' | 'CATEGORY' // NOVO
  active?: boolean
  order?: number
}

export interface CreateBudgetLimitData {
  budgetId: string
  categoryId?: string // NOVO
  amount: number
  startDate: string | Date
  endDate: string | Date
  currency?: string
}
```

---

## 🔄 Alterações Pendentes (A Fazer)

### **4. Formulário de Orçamento (BudgetFormView.vue)**

#### **Adicionar Seleção de Tipo:**

```vue
<template>
  <!-- Após o campo Nome -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Tipo de Orçamento
    </label>
    <select v-model="form.type" class="input">
      <option value="GENERAL">Geral (Todas as Categorias)</option>
      <option value="CATEGORY">Por Categoria</option>
    </select>
    <p class="text-xs text-gray-500 mt-1">
      Geral: controla gastos totais. Por Categoria: define limites específicos por categoria.
    </p>
  </div>
</template>

<script setup lang="ts">
// Adicionar ao form
const form = ref({
  name: '',
  type: 'GENERAL', // NOVO
  active: true,
  order: 0
})
</script>
```

#### **Adicionar Seleção de Categoria nos Limites:**

```vue
<template>
  <!-- No formulário de limite -->
  <div v-if="form.type === 'CATEGORY'">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Categoria *
    </label>
    <select v-model="limitForm.categoryId" class="input" required>
      <option value="">Selecione uma categoria</option>
      <option 
        v-for="category in categories" 
        :key="category.id" 
        :value="category.id"
      >
        {{ category.icon }} {{ category.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useCategoryStore } from '@/stores/category'

const categoryStore = useCategoryStore()
const categories = computed(() => categoryStore.categories)

// Adicionar ao limitForm
const limitForm = ref({
  categoryId: '', // NOVO
  amount: 0,
  startDate: '',
  endDate: '',
  currency: 'BRL'
})

// Carregar categorias
onMounted(async () => {
  await categoryStore.fetchAll()
  // ... resto do código
})
</script>
```

---

### **5. Backend - Atualizar Service e Controller**

#### **budget.service.ts - Adicionar validação:**

```typescript
async create(data: CreateBudgetData, userId: string) {
  // Validar tipo
  if (data.type && !['GENERAL', 'CATEGORY'].includes(data.type)) {
    throw new Error('Tipo de orçamento inválido')
  }

  const budget = await prisma.budget.create({
    data: {
      name: data.name,
      type: data.type || 'GENERAL', // NOVO
      active: data.active ?? true,
      order: data.order ?? 0,
      userId,
    },
  })

  return budget
}

async createLimit(data: CreateBudgetLimitData, userId: string) {
  // Validar se o budget existe e pertence ao usuário
  const budget = await prisma.budget.findFirst({
    where: { id: data.budgetId, userId },
  })

  if (!budget) {
    throw new Error('Orçamento não encontrado')
  }

  // Se for orçamento por categoria, categoryId é obrigatório
  if (budget.type === 'CATEGORY' && !data.categoryId) {
    throw new Error('Categoria é obrigatória para orçamento por categoria')
  }

  // Se for orçamento geral, categoryId deve ser null
  if (budget.type === 'GENERAL' && data.categoryId) {
    throw new Error('Orçamento geral não pode ter categoria específica')
  }

  const limit = await prisma.budgetLimit.create({
    data: {
      budgetId: data.budgetId,
      categoryId: data.categoryId || null, // NOVO
      amount: data.amount,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      currency: data.currency || 'BRL',
    },
    include: {
      category: true, // NOVO - incluir categoria
    },
  })

  return limit
}
```

---

### **6. Relatório de Orçamentos - Adicionar Seleção**

#### **BudgetAnalysisView.vue - Adicionar Filtro:**

```vue
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header com seleção de orçamento -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Análise de Orçamentos</h1>
      
      <!-- Seletor de Orçamento -->
      <div class="w-64">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Orçamento
        </label>
        <select v-model="selectedBudgetId" @change="loadBudgetData" class="input">
          <option value="">Todos os Orçamentos</option>
          <option 
            v-for="budget in budgets" 
            :key="budget.id" 
            :value="budget.id"
          >
            {{ budget.name }} ({{ budget.type === 'GENERAL' ? 'Geral' : 'Por Categoria' }})
          </option>
        </select>
      </div>
    </div>

    <!-- Resto do conteúdo -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBudgetStore } from '@/stores/budget'

const budgetStore = useBudgetStore()
const budgets = ref<any[]>([])
const selectedBudgetId = ref('')

onMounted(async () => {
  await budgetStore.fetchAll()
  budgets.value = budgetStore.budgets
  
  // Selecionar primeiro orçamento por padrão
  if (budgets.value.length > 0) {
    selectedBudgetId.value = budgets.value[0].id
    await loadBudgetData()
  }
})

async function loadBudgetData() {
  if (!selectedBudgetId.value) {
    // Carregar todos os orçamentos
    // ...
  } else {
    // Carregar orçamento específico
    const budget = await budgetStore.fetchById(selectedBudgetId.value)
    // Processar dados...
  }
}
</script>
```

---

## 📋 Fluxo de Uso

### **Criar Orçamento Geral:**
1. Novo Orçamento
2. Nome: "Orçamento Mensal"
3. Tipo: **Geral**
4. Adicionar Limite:
   - Valor: R$ 5.000,00
   - Período: 01/11/2025 - 30/11/2025
   - ❌ Sem seleção de categoria
5. Salvar

**Resultado:** Controla gastos totais de todas as categorias.

---

### **Criar Orçamento por Categoria:**
1. Novo Orçamento
2. Nome: "Controle de Gastos"
3. Tipo: **Por Categoria**
4. Adicionar Limite 1:
   - **Categoria:** 🍔 Alimentação
   - Valor: R$ 1.500,00
   - Período: 01/11/2025 - 30/11/2025
5. Adicionar Limite 2:
   - **Categoria:** 🚗 Transporte
   - Valor: R$ 800,00
   - Período: 01/11/2025 - 30/11/2025
6. Adicionar Limite 3:
   - **Categoria:** 🎬 Lazer
   - Valor: R$ 500,00
   - Período: 01/11/2025 - 30/11/2025
7. Salvar

**Resultado:** Controla gastos específicos por categoria.

---

## 🎯 Benefícios

### **Orçamento Geral:**
- ✅ Controle total de gastos
- ✅ Simples e direto
- ✅ Ideal para iniciantes

### **Orçamento por Categoria:**
- ✅ Controle detalhado
- ✅ Múltiplos limites
- ✅ Análise por categoria
- ✅ Maior precisão

---

## 📊 Visualização no Relatório

### **Orçamento Geral:**
```
Orçamento: Orçamento Mensal (Geral)
Período: 01/11/2025 - 30/11/2025
Limite: R$ 5.000,00
Gasto: R$ 3.200,00 (64%)
Disponível: R$ 1.800,00
```

### **Orçamento por Categoria:**
```
Orçamento: Controle de Gastos (Por Categoria)
Período: 01/11/2025 - 30/11/2025

🍔 Alimentação
Limite: R$ 1.500,00
Gasto: R$ 1.200,00 (80%)
Disponível: R$ 300,00

🚗 Transporte
Limite: R$ 800,00
Gasto: R$ 650,00 (81%)
Disponível: R$ 150,00

🎬 Lazer
Limite: R$ 500,00
Gasto: R$ 200,00 (40%)
Disponível: R$ 300,00

TOTAL
Limite: R$ 2.800,00
Gasto: R$ 2.050,00 (73%)
Disponível: R$ 750,00
```

---

## ✅ Status

- ✅ Ícone de Relatórios alterado
- ✅ Schema Prisma atualizado
- ✅ Migration aplicada
- ✅ Tipos TypeScript atualizados
- ⏳ Formulário de orçamento (pendente)
- ⏳ Backend service/controller (pendente)
- ⏳ Relatório com seleção (pendente)

---

## 🚀 Próximos Passos

1. Atualizar `BudgetFormView.vue` com seleção de tipo
2. Adicionar seleção de categoria nos limites
3. Atualizar backend para validar tipo e categoria
4. Atualizar relatório com seletor de orçamento
5. Testar fluxo completo

**Quer que eu continue implementando as partes pendentes?**
