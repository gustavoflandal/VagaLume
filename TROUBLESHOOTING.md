# 🔧 Troubleshooting - VagaLume

**Data:** 2025-10-16 20:14  
**Status:** 🔍 **GUIA DE RESOLUÇÃO DE PROBLEMAS**

---

## ❌ Erro: 400 Bad Request ao Salvar Transação

### Sintoma
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
Erro ao salvar transação: AxiosError
```

### Causa
O backend está rejeitando a requisição porque os dados enviados não passam nas validações. As validações são:

#### Para EXPENSE (Despesa)
- ✅ Requer `fromAccountId` (conta de origem)
- ✅ Requer `description` (descrição)
- ✅ Requer `amount` (valor > 0)
- ✅ Requer `date` (data)
- ✅ Requer `type: 'EXPENSE'`

#### Para INCOME (Receita)
- ✅ Requer `toAccountId` (conta de destino)
- ✅ Requer `description` (descrição)
- ✅ Requer `amount` (valor > 0)
- ✅ Requer `date` (data)
- ✅ Requer `type: 'INCOME'`

#### Para TRANSFER (Transferência)
- ✅ Requer `fromAccountId` (conta de origem)
- ✅ Requer `toAccountId` (conta de destino)
- ✅ `fromAccountId` ≠ `toAccountId` (contas diferentes)
- ✅ Requer `description` (descrição)
- ✅ Requer `amount` (valor > 0)
- ✅ Requer `date` (data)
- ✅ Requer `type: 'TRANSFER'`

### Solução

#### 1. Verificar Dados Enviados pelo Frontend

Abra o console do navegador (F12) e verifique o payload da requisição:

```javascript
// Exemplo correto para EXPENSE
{
  "type": "EXPENSE",
  "description": "Almoço",
  "amount": 50.00,
  "date": "2025-10-16T20:00:00.000Z",
  "fromAccountId": "clx123...",  // ID válido da conta
  "categoryId": "clx456...",      // Opcional
  "status": "COMPLETED"           // Opcional (padrão: COMPLETED)
}

// Exemplo correto para INCOME
{
  "type": "INCOME",
  "description": "Salário",
  "amount": 5000.00,
  "date": "2025-10-16T20:00:00.000Z",
  "toAccountId": "clx123...",     // ID válido da conta
  "categoryId": "clx456...",      // Opcional
  "status": "COMPLETED"
}

// Exemplo correto para TRANSFER
{
  "type": "TRANSFER",
  "description": "Transferência entre contas",
  "amount": 200.00,
  "date": "2025-10-16T20:00:00.000Z",
  "fromAccountId": "clx123...",   // ID válido da conta origem
  "toAccountId": "clx789...",     // ID válido da conta destino (diferente)
  "status": "COMPLETED"
}
```

#### 2. Verificar IDs das Contas

As contas devem existir e pertencer ao usuário logado:

```bash
# Testar endpoint de contas
curl http://localhost:3001/api/accounts \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### 3. Verificar Mensagem de Erro Específica

O backend retorna mensagens específicas:

| Mensagem | Causa | Solução |
|----------|-------|---------|
| "Despesas requerem conta de origem" | `fromAccountId` ausente em EXPENSE | Adicionar `fromAccountId` |
| "Receitas requerem conta de destino" | `toAccountId` ausente em INCOME | Adicionar `toAccountId` |
| "Transferências requerem conta de origem e destino" | Falta `fromAccountId` ou `toAccountId` em TRANSFER | Adicionar ambos |
| "Contas de origem e destino devem ser diferentes" | `fromAccountId === toAccountId` | Usar contas diferentes |
| "Conta de origem não encontrada" | ID inválido ou conta não pertence ao usuário | Verificar ID |
| "Conta de destino não encontrada" | ID inválido ou conta não pertence ao usuário | Verificar ID |
| "Categoria não encontrada" | ID inválido ou categoria não pertence ao usuário | Verificar ID ou remover |

---

## 🔍 Como Debugar

### 1. Ver Logs do Backend

No terminal onde o backend está rodando, você verá:

```
20:14:30 [error]: Erro ao criar transação: Error: Despesas requerem conta de origem
```

### 2. Inspecionar Requisição no DevTools

1. Abra DevTools (F12)
2. Vá para a aba "Network"
3. Filtre por "transactions"
4. Clique na requisição falhada
5. Veja "Payload" para ver o que foi enviado
6. Veja "Response" para ver o erro retornado

### 3. Testar Diretamente com cURL

```bash
# Obter token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suasenha"}' \
  | jq -r '.data.tokens.accessToken')

# Criar transação de teste
curl -X POST http://localhost:3001/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EXPENSE",
    "description": "Teste",
    "amount": 10,
    "date": "2025-10-16T20:00:00.000Z",
    "fromAccountId": "ID_DA_SUA_CONTA"
  }'
```

---

## 🛠️ Correção no Frontend

Se o problema está no frontend, corrija o componente de transações:

### Arquivo: `frontend/src/views/TransactionsView.vue`

```vue
<script setup>
const handleSubmit = async () => {
  try {
    // Validar dados antes de enviar
    const transactionData = {
      type: form.type,
      description: form.description,
      amount: parseFloat(form.amount),
      date: new Date(form.date).toISOString(),
      status: form.status || 'COMPLETED'
    };

    // Adicionar campos específicos por tipo
    if (form.type === 'EXPENSE') {
      if (!form.fromAccountId) {
        throw new Error('Selecione a conta de origem');
      }
      transactionData.fromAccountId = form.fromAccountId;
    } else if (form.type === 'INCOME') {
      if (!form.toAccountId) {
        throw new Error('Selecione a conta de destino');
      }
      transactionData.toAccountId = form.toAccountId;
    } else if (form.type === 'TRANSFER') {
      if (!form.fromAccountId || !form.toAccountId) {
        throw new Error('Selecione ambas as contas');
      }
      if (form.fromAccountId === form.toAccountId) {
        throw new Error('As contas devem ser diferentes');
      }
      transactionData.fromAccountId = form.fromAccountId;
      transactionData.toAccountId = form.toAccountId;
    }

    // Adicionar categoria se fornecida
    if (form.categoryId) {
      transactionData.categoryId = form.categoryId;
    }

    // Enviar para API
    await api.post('/transactions', transactionData);
    
    // Sucesso
    showSuccess('Transação salva com sucesso!');
    fetchTransactions();
    closeDialog();
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    showError(error.response?.data?.message || error.message || 'Erro ao salvar transação');
  }
};
</script>
```

---

## ✅ Checklist de Validação

Antes de enviar uma transação, verifique:

### Para EXPENSE
- [ ] `type` = "EXPENSE"
- [ ] `description` preenchida
- [ ] `amount` > 0
- [ ] `date` válida
- [ ] `fromAccountId` preenchido e válido
- [ ] `categoryId` válido (se fornecido)

### Para INCOME
- [ ] `type` = "INCOME"
- [ ] `description` preenchida
- [ ] `amount` > 0
- [ ] `date` válida
- [ ] `toAccountId` preenchido e válido
- [ ] `categoryId` válido (se fornecido)

### Para TRANSFER
- [ ] `type` = "TRANSFER"
- [ ] `description` preenchida
- [ ] `amount` > 0
- [ ] `date` válida
- [ ] `fromAccountId` preenchido e válido
- [ ] `toAccountId` preenchido e válido
- [ ] `fromAccountId` ≠ `toAccountId`

---

## 🔄 Outros Problemas Comuns

### CORS Error
**Sintoma:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solução:**
1. Verificar se backend está configurado para `http://localhost:5173`
2. Reiniciar backend após mudar `.env`

### 401 Unauthorized
**Sintoma:** `Failed to load resource: the server responded with a status of 401`

**Solução:**
1. Fazer login novamente
2. Verificar se token está sendo enviado no header
3. Verificar se token não expirou

### 404 Not Found
**Sintoma:** `Failed to load resource: the server responded with a status of 404`

**Solução:**
1. Verificar se endpoint está correto
2. Verificar se backend está rodando
3. Verificar se rota existe no backend

---

## 📞 Suporte

Se o problema persistir:

1. **Verifique os logs** do backend
2. **Inspecione a requisição** no DevTools
3. **Teste com cURL** para isolar o problema
4. **Verifique a documentação** da API em http://localhost:3001/api/docs

---

**Última atualização:** 2025-10-16 20:14:00
