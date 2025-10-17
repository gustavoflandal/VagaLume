import webhookService from '@/services/webhook.service';
import logger from '@/utils/logger';

/**
 * Cron Job: Processar Fila de Webhooks
 * Frequência: A cada 5 minutos
 * Descrição: Processa mensagens pendentes na fila de webhooks e tenta reenviar falhas
 */
export async function processWebhookQueue() {
  const startTime = Date.now();
  logger.info('🔔 Iniciando job de processamento de webhooks...');

  try {
    const result = await webhookService.processPending();
    
    const duration = Date.now() - startTime;
    logger.info(`✅ Job concluído: ${result.success} webhook(s) enviado(s), ${result.failed} falha(s) em ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Erro no job de processamento de webhooks após ${duration}ms:`, error);
    throw error;
  }
}

export default {
  name: 'process-webhook-queue',
  schedule: '*/5 * * * *', // A cada 5 minutos
  handler: processWebhookQueue,
};
