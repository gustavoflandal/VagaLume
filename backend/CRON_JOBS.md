# Cron Jobs - VagaLume

## 📅 Jobs Implementados

### 1. **Generate Recurring Transactions** 
- **Arquivo**: `generateRecurrences.job.ts`
- **Frequência**: Diário às 00:00 (`0 0 * * *`)
- **Descrição**: Gera automaticamente transações recorrentes pendentes
- **Função**: Percorre todas as recorrências ativas e cria as transações baseadas na frequência configurada

### 2. **Process Auto-Budgets**
- **Arquivo**: `processAutoBudgets.job.ts`
- **Frequência**: Diário às 01:00 (`0 1 * * *`)
- **Descrição**: Processa auto-budgets no início de cada período
- **Tipos suportados**:
  - **RESET**: Reseta para valor fixo todo período
  - **ROLLOVER**: Transfere saldo não usado para próximo período
  - **ADJUSTED**: Ajusta baseado em gasto real (+10%)

### 3. **Check Upcoming Bills**
- **Arquivo**: `checkBills.job.ts`
- **Frequência**: Diário às 08:00 (`0 8 * * *`)
- **Descrição**: Verifica bills próximas do vencimento (3 dias)
- **Ação**: Envia notificações aos usuários sobre bills pendentes

### 4. **Process Webhook Queue**
- **Arquivo**: `processWebhooks.job.ts`
- **Frequência**: A cada 5 minutos (`*/5 * * * *`)
- **Descrição**: Processa fila de webhooks pendentes
- **Recursos**:
  - Processa até 50 mensagens por vez
  - Retry automático em falhas
  - Log de todas as tentativas

### 5. **Recalculate Piggy Banks**
- **Arquivo**: `recalculatePiggyBanks.job.ts`
- **Frequência**: Semanal aos domingos às 23:00 (`0 23 * * 0`)
- **Descrição**: Recalcula progresso e detecta inconsistências
- **Recursos**:
  - Valida saldo contra eventos
  - Corrige discrepâncias automaticamente
  - Notifica metas atingidas

## 🚀 Como Usar

### Instalação da Dependência

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

### Ativando os Jobs

No arquivo `src/server.ts` ou `src/app.ts`, adicione:

```typescript
import { initializeJobs } from '@/jobs';

// Depois de iniciar o servidor
initializeJobs();
```

### Implementação Completa com node-cron

Edite o arquivo `src/jobs/index.ts`:

```typescript
import cron from 'node-cron';
import logger from '@/utils/logger';

export function initializeJobs() {
  logger.info('📅 Inicializando cron jobs...');
  
  jobs.forEach(job => {
    cron.schedule(job.schedule, async () => {
      logger.info(`⏰ Executando job: ${job.name}`);
      try {
        await job.handler();
      } catch (error) {
        logger.error(`❌ Erro no job ${job.name}:`, error);
      }
    });
    logger.info(`✓ Job agendado: ${job.name} (${job.schedule})`);
  });
}
```

### Execução Manual (Testes)

```typescript
import { runJob } from '@/jobs';

// Executar job específico
await runJob('generate-recurring-transactions');
await runJob('process-auto-budgets');
await runJob('check-upcoming-bills');
await runJob('process-webhook-queue');
await runJob('recalculate-piggy-banks');
```

### Endpoint para Execução Manual

Adicione em `src/routes/jobs.ts`:

```typescript
import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import { runJob, jobs } from '@/jobs';

const router = Router();

// Apenas administradores podem executar jobs manualmente
router.use(authenticate);

// GET /api/jobs - Lista todos os jobs
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: jobs.map(j => ({
      name: j.name,
      schedule: j.schedule,
    })),
  });
});

// POST /api/jobs/:name/run - Executa job manualmente
router.post('/:name/run', async (req, res) => {
  try {
    const result = await runJob(req.params.name);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
```

## 📊 Monitoramento

### Logs

Todos os jobs geram logs detalhados:
- ✅ Início/fim de execução
- ⏱️ Tempo de execução
- 📈 Quantidade processada
- ❌ Erros e exceções

### Health Check

Para verificar se os jobs estão rodando, você pode:

1. Verificar logs do servidor
2. Verificar última execução no banco (adicione campo `lastRun` nas tabelas)
3. Implementar endpoint de status dos jobs

## 🔧 Troubleshooting

### Job não está executando

1. Verifique se `initializeJobs()` foi chamado
2. Verifique sintaxe da cron expression
3. Verifique logs de erro
4. Teste execução manual com `runJob()`

### Performance

- Jobs são executados sequencialmente por padrão
- Para processar em paralelo, ajuste a lógica interna
- Monitore tempo de execução nos logs
- Ajuste frequência se necessário

### Timezone

Por padrão, node-cron usa timezone do servidor. Para configurar:

```typescript
cron.schedule(job.schedule, handler, {
  timezone: "America/Sao_Paulo"
});
```

## 📝 Expressões Cron

```
┌────────────── segundo (opcional)
│ ┌──────────── minuto (0 - 59)
│ │ ┌────────── hora (0 - 23)
│ │ │ ┌──────── dia do mês (1 - 31)
│ │ │ │ ┌────── mês (1 - 12)
│ │ │ │ │ ┌──── dia da semana (0 - 7, 0 e 7 = domingo)
│ │ │ │ │ │
│ │ │ │ │ │
* * * * * *
```

### Exemplos

- `0 0 * * *` - Todo dia à meia-noite
- `*/5 * * * *` - A cada 5 minutos
- `0 8 * * 1` - Toda segunda-feira às 8h
- `0 23 * * 0` - Todo domingo às 23h
- `0 0 1 * *` - Dia 1 de cada mês à meia-noite

## 🎯 Próximos Passos

1. Instalar `node-cron`
2. Ativar jobs no servidor
3. Implementar serviço de notificações (email/push)
4. Adicionar endpoint de execução manual
5. Configurar monitoramento de execução
6. Adicionar testes unitários para cada job
