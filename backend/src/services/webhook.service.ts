import { prisma } from '@/config/database';
import logger from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

type WebhookTriggerDTO = 'STORE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DESTROY_TRANSACTION' | 'STORE_BUDGET' | 'UPDATE_BUDGET' | 'DESTROY_BUDGET' | 'STORE_UPDATE_BUDGET_LIMIT';
type WebhookResponseDTO = 'TRANSACTIONS' | 'ACCOUNTS' | 'BUDGET' | 'NONE';
type WebhookDeliveryDTO = 'JSON';

export interface CreateWebhookDTO {
  title: string;
  url: string;
  trigger: WebhookTriggerDTO;
  response: WebhookResponseDTO;
  delivery?: WebhookDeliveryDTO;
}

export interface UpdateWebhookDTO {
  title?: string;
  url?: string;
  trigger?: WebhookTriggerDTO;
  response?: WebhookResponseDTO;
  delivery?: WebhookDeliveryDTO;
  active?: boolean;
}

class WebhookService {
  /**
   * Lista todos os webhooks do usuário
   */
  async findAll(userId: string, includeInactive = false) {
    const webhooks = await prisma.webhook.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { active: true }),
      },
      include: {
        messages: {
          where: { sent: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks;
  }

  /**
   * Busca webhook por ID
   */
  async findById(webhookId: string, userId: string) {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            attempts: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!webhook) {
      throw new Error('Webhook não encontrado');
    }

    return webhook;
  }

  /**
   * Cria novo webhook
   */
  async create(userId: string, data: CreateWebhookDTO) {
    const webhook = await prisma.webhook.create({
      data: {
        title: data.title,
        url: data.url,
        trigger: data.trigger,
        response: data.response,
        delivery: data.delivery ?? 'JSON',
        userId,
      },
    });

    logger.info(`Novo webhook criado: ${webhook.title} para usuário ${userId}`);
    return webhook;
  }

  /**
   * Atualiza webhook
   */
  async update(webhookId: string, userId: string, data: UpdateWebhookDTO) {
    await this.findById(webhookId, userId);

    const webhook = await prisma.webhook.update({
      where: { id: webhookId },
      data,
    });

    logger.info(`Webhook atualizado: ${webhook.title}`);
    return webhook;
  }

  /**
   * Exclui webhook
   */
  async delete(webhookId: string, userId: string) {
    await this.findById(webhookId, userId);

    await prisma.webhook.delete({
      where: { id: webhookId },
    });

    logger.info(`Webhook excluído: ${webhookId}`);
  }

  /**
   * Enfileira mensagem de webhook
   */
  async queueMessage(webhookId: string, payload: any) {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.active) {
      return null;
    }

    const message = await prisma.webhookMessage.create({
      data: {
        webhookId,
        message: JSON.stringify(payload),
        uuid: uuidv4(),
        sent: false,
      },
    });

    logger.info(`Mensagem enfileirada para webhook ${webhookId}`);
    return message;
  }

  /**
   * Processa mensagens pendentes
   */
  async processPending() {
    const pendingMessages = await prisma.webhookMessage.findMany({
      where: { sent: false },
      include: {
        webhook: true,
      },
      take: 50, // Processa 50 por vez
    });

    let successCount = 0;
    let failCount = 0;

    for (const message of pendingMessages) {
      try {
        await this.sendWebhook(message.webhook, message);
        successCount++;
      } catch (error) {
        failCount++;
        logger.error(`Erro ao enviar webhook: ${error}`);
      }
    }

    logger.info(
      `Webhooks processados: ${successCount} sucesso, ${failCount} falhas`
    );

    return { success: successCount, failed: failCount };
  }

  /**
   * Envia webhook via HTTP
   */
  private async sendWebhook(webhook: any, message: any) {
    const startTime = Date.now();

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-UUID': message.uuid,
        },
        body: message.message,
      });

      const responseText = await response.text();
      const duration = Date.now() - startTime;

      // Registra tentativa
      await prisma.webhookAttempt.create({
        data: {
          webhookMessageId: message.id,
          statusCode: response.status,
          response: responseText.substring(0, 1000), // Limita tamanho
        },
      });

      // Marca como enviada se sucesso
      if (response.ok) {
        await prisma.webhookMessage.update({
          where: { id: message.id },
          data: { sent: true },
        });

        logger.info(
          `Webhook enviado com sucesso: ${webhook.title} (${duration}ms)`
        );
      } else {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
    } catch (error: any) {
      // Registra tentativa falhada
      await prisma.webhookAttempt.create({
        data: {
          webhookMessageId: message.id,
          statusCode: null,
          response: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Testa webhook manualmente
   */
  async test(webhookId: string, userId: string) {
    const webhook = await this.findById(webhookId, userId);

    const testPayload = {
      test: true,
      webhook: {
        id: webhook.id,
        title: webhook.title,
        trigger: webhook.trigger,
      },
      timestamp: new Date().toISOString(),
    };

    const message = await prisma.webhookMessage.create({
      data: {
        webhookId: webhook.id,
        message: JSON.stringify(testPayload),
        uuid: uuidv4(),
        sent: false,
      },
    });

    try {
      await this.sendWebhook(webhook, message);
      return { success: true, message: 'Webhook enviado com sucesso' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Reprocessa mensagem com falha
   */
  async retry(messageId: string, userId: string) {
    const message = await prisma.webhookMessage.findFirst({
      where: {
        id: messageId,
        webhook: { userId },
      },
      include: {
        webhook: true,
      },
    });

    if (!message) {
      throw new Error('Mensagem não encontrada');
    }

    try {
      await this.sendWebhook(message.webhook, message);
      return { success: true, message: 'Webhook reenviado com sucesso' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Obtém histórico de envios
   */
  async getHistory(webhookId: string, userId: string, limit = 50) {
    const webhook = await this.findById(webhookId, userId);

    const messages = await prisma.webhookMessage.findMany({
      where: { webhookId: webhook.id },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages;
  }

  /**
   * Obtém estatísticas dos webhooks
   */
  async getStatistics(userId: string) {
    const webhooks = await prisma.webhook.findMany({
      where: { userId },
      include: {
        messages: true,
      },
    });

    const total = webhooks.length;

    let active = 0;

    for (const webhook of webhooks) {
      if (webhook.active) {
        active += 1;
      }
    }

    let totalMessages = 0;
    let sentMessages = 0;

    for (const webhook of webhooks) {
      totalMessages += webhook.messages.length;
      for (const message of webhook.messages) {
        if (message.sent) {
          sentMessages += 1;
        }
      }
    }
    const pendingMessages = totalMessages - sentMessages;

    return {
      total,
      active,
      inactive: total - active,
      totalMessages,
      sentMessages,
      pendingMessages,
    };
  }
}

export default new WebhookService();
