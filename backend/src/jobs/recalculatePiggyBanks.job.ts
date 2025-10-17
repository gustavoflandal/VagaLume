import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import logger from '@/utils/logger';

/**
 * Cron Job: Recalcular Progresso de Piggy Banks
 * Frequência: Semanal aos domingos às 23:00
 * Descrição: Recalcula o progresso e estatísticas de todos os piggy banks ativos
 */
export async function recalculatePiggyBanks() {
  const startTime = Date.now();
  logger.info('🐷 Iniciando job de recálculo de piggy banks...');

  try {
    let recalculated = 0;

    // Buscar todos os piggy banks ativos
    const piggyBanks = await prisma.piggyBank.findMany({
      where: {
        active: true,
      },
      include: {
        events: true,
        account: true,
      },
    });

    for (const piggyBank of piggyBanks) {
      try {
        // Recalcular saldo atual baseado nos eventos
        const totalAdded = piggyBank.events
          .filter((e: { amount: Decimal }) => e.amount.greaterThan(0))
          .reduce((sum: Decimal, e: { amount: Decimal }) => sum.plus(e.amount), new Decimal(0));

        const totalRemoved = piggyBank.events
          .filter((e: { amount: Decimal }) => e.amount.lessThan(0))
          .reduce((sum: Decimal, e: { amount: Decimal }) => sum.plus(e.amount.abs()), new Decimal(0));

        const calculatedAmount = totalAdded.minus(totalRemoved);

        // Verificar se há discrepância
        if (!calculatedAmount.equals(piggyBank.currentAmount)) {
          logger.warn(`⚠️ Discrepância encontrada no piggy bank ${piggyBank.id} (${piggyBank.name}):`);
          logger.warn(`  - Valor armazenado: R$ ${piggyBank.currentAmount}`);
          logger.warn(`  - Valor calculado: R$ ${calculatedAmount}`);

          // Corrigir o valor
          await prisma.piggyBank.update({
            where: { id: piggyBank.id },
            data: { currentAmount: calculatedAmount },
          });

          logger.info(`✓ Valor corrigido para R$ ${calculatedAmount}`);
        }

        // Verificar se atingiu a meta
        if (piggyBank.targetAmount && calculatedAmount.greaterThanOrEqualTo(piggyBank.targetAmount)) {
          const percentage = calculatedAmount.div(piggyBank.targetAmount).times(100);
          
          if (percentage.greaterThanOrEqualTo(100) && piggyBank.active) {
            logger.info(`🎉 Piggy bank "${piggyBank.name}" atingiu a meta de R$ ${piggyBank.targetAmount}!`);
            
            // TODO: Enviar notificação ao usuário
            // await notificationService.sendPiggyBankGoalAchieved(piggyBank);
          }
        }

        recalculated++;
      } catch (error) {
        logger.error(`Erro ao recalcular piggy bank ${piggyBank.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Job concluído: ${recalculated} piggy bank(s) recalculado(s) em ${duration}ms`);
    
    return { recalculated };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Erro no job de recálculo de piggy banks após ${duration}ms:`, error);
    throw error;
  }
}

export default {
  name: 'recalculate-piggy-banks',
  schedule: '0 23 * * 0', // Domingos às 23:00
  handler: recalculatePiggyBanks,
};
