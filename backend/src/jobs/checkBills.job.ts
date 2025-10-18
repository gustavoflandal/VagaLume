import billService from '@/services/bill.service';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

/**
 * Cron Job: Verificar Bills Vencidas
 * Frequência: Diário às 08:00
 * Descrição: Verifica bills próximas do vencimento e envia notificações
 */
export async function checkUpcomingBills() {
  const startTime = Date.now();
  logger.info('📅 Iniciando job de verificação de bills...');

  try {
    let notified = 0;

    // Buscar todos os usuários que têm bills ativas
    const billsWithUsers = await prisma.bill.findMany({
      where: {
        active: true,
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Remover duplicatas
    const userMap = new Map();
    billsWithUsers.forEach((b: { user: { id: string; email: string; name: string } }) => {
      if (!userMap.has(b.user.id)) {
        userMap.set(b.user.id, b.user);
      }
    });
    const users = Array.from(userMap.values());

    for (const user of users) {
      try {
        // Buscar bills próximas (próximos 3 dias)
        const upcomingBills = await billService.getUpcoming(user.id, 3);

        if (upcomingBills.length > 0) {
          // Aqui você pode implementar o envio de notificação
          // Por exemplo: email, push notification, etc.
          logger.info(`📧 [NOTIFICAÇÃO] Usuário ${user.name} (${user.email}) tem ${upcomingBills.length} bill(s) próxima(s):`);
          
          for (const bill of upcomingBills) {
            const nextDate = bill.nextDate ? bill.nextDate.toISOString().split('T')[0] : 'data não calculada';
            logger.info(`  - ${bill.name}: R$ ${bill.amount} (${nextDate})`);
          }

          notified++;

          // TODO: Integrar com serviço de email/notificação
          // await notificationService.sendBillReminder(user.email, upcomingBills);
        }
      } catch (error) {
        logger.error(`Erro ao verificar bills do usuário ${user.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Job concluído: ${notified} usuário(s) notificado(s) em ${duration}ms`);
    
    return { notified };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Erro no job de verificação de bills após ${duration}ms:`, error);
    throw error;
  }
}

export default {
  name: 'check-upcoming-bills',
  schedule: '0 8 * * *', // Diário às 08:00
  handler: checkUpcomingBills,
};
