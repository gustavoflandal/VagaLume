import recurrenceService from '@/services/recurrence.service';
import logger from '@/utils/logger';

/**
 * Cron Job: Gerar transações recorrentes
 * Frequência: Diário às 00:00
 * Descrição: Verifica todas as recorrências ativas e gera as transações pendentes
 */
export async function generateRecurringTransactions() {
  const startTime = Date.now();
  logger.info('🔄 Iniciando job de geração de transações recorrentes...');

  try {
    const result = await recurrenceService.generateTransactions();
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Job concluído: ${result.generated} transação(ões) gerada(s) em ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Erro no job de geração de recorrências após ${duration}ms:`, error);
    throw error;
  }
}

export default {
  name: 'generate-recurring-transactions',
  schedule: '0 0 * * *', // Diário às 00:00
  handler: generateRecurringTransactions,
};
