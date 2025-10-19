type AutoBudgetType = 'RESET' | 'ROLLOVER' | 'ADJUSTED';
type AutoBudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEAR' | 'YEARLY';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Cron Job: Processar Auto-Budgets
 * frequência: Diário às 01:00
 * Descrição: Processa os auto-budgets no início de cada período (RESET/ROLLOVER/ADJUSTED)
 */
export async function processAutoBudgets() {
  const startTime = Date.now();
  logger.info('💰 Iniciando job de processamento de auto-budgets...');

  try {
    const now = new Date();
    let processed = 0;

    // Buscar todos os auto-budgets ativos
    const autoBudgets = await prisma.autoBudget.findMany({
      where: {
        budget: {
          active: true,
        },
      },
      include: {
        budget: {
          include: {
            limits: {
              orderBy: {
                startDate: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    for (const autoBudget of autoBudgets) {
      try {
        const shouldProcess = checkShouldProcessPeriod(now, autoBudget.period);
        
        if (!shouldProcess) {
          continue;
        }

        const lastLimit = autoBudget.budget.limits[0];
        const { startDate, endDate } = calculatePeriodDates(now, autoBudget.period);

        // Calcular gasto do período anterior
        let newAmount = autoBudget.amount;

        if (autoBudget.type === AutoBudgetType.ROLLOVER && lastLimit) {
          // ROLLOVER: transfere o que sobrou do período anterior
          const previousSpent = await calculateSpentAmount(
            autoBudget.budgetId,
            lastLimit.startDate,
            lastLimit.endDate
          );
          const remaining = lastLimit.amount.minus(previousSpent);
          if (remaining.greaterThan(0)) {
            newAmount = autoBudget.amount.plus(remaining);
          }
        } else if (autoBudget.type === AutoBudgetType.ADJUSTED && lastLimit) {
          // ADJUSTED: ajusta baseado no gasto real do período anterior
          const previousSpent = await calculateSpentAmount(
            autoBudget.budgetId,
            lastLimit.startDate,
            lastLimit.endDate
          );
          
          // Ajusta +10% do gasto real
          newAmount = previousSpent.times(1.1);
        }
        // RESET: usa sempre o valor fixo (não precisa cálculo)

        // Criar novo limite para o período
        await prisma.budgetLimit.create({
          data: {
            budgetId: autoBudget.budgetId,
            amount: newAmount,
            startDate,
            endDate,
          },
        });

        processed++;
        logger.info(`✓ Auto-budget processado: Budget ${autoBudget.budgetId} - Tipo: ${autoBudget.type} - Período: ${autoBudget.period} - Valor: ${newAmount}`);
      } catch (error) {
        logger.error(`Erro ao processar auto-budget ${autoBudget.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Job concluído: ${processed} auto-budget(s) processado(s) em ${duration}ms`);
    
    return { processed };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Erro no job de auto-budgets após ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Verifica se deve processar o período baseado na data atual
 */
function checkShouldProcessPeriod(now: Date, period: AutoBudgetPeriod): boolean {
  const day = now.getDate();
  const dayOfWeek = now.getDay();
  const month = now.getMonth();

  switch (period) {
    case AutoBudgetPeriod.DAILY:
      return true; // Sempre processa
    case AutoBudgetPeriod.WEEKLY:
      return dayOfWeek === 1; // Segunda-feira
    case AutoBudgetPeriod.MONTHLY:
      return day === 1; // Dia 1 do mês
    case AutoBudgetPeriod.QUARTERLY:
      return day === 1 && [0, 3, 6, 9].includes(month); // Jan, Abr, Jul, Out
    case AutoBudgetPeriod.HALF_YEAR:
      return day === 1 && [0, 6].includes(month); // Jan, Jul
    case AutoBudgetPeriod.YEARLY:
      return day === 1 && month === 0; // 1 de Janeiro
    default:
      return false;
  }
}

/**
 * Calcula as datas de início e fim do período atual
 */
function calculatePeriodDates(now: Date, period: AutoBudgetPeriod): { startDate: Date; endDate: Date } {
  const startDate = new Date(now);
  const endDate = new Date(now);

  switch (period) {
    case AutoBudgetPeriod.DAILY:
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case AutoBudgetPeriod.WEEKLY:
      startDate.setDate(now.getDate() - now.getDay() + 1); // Segunda-feira
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6); // Domingo
      endDate.setHours(23, 59, 59, 999);
      break;
    case AutoBudgetPeriod.MONTHLY:
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Último dia do mês
      endDate.setHours(23, 59, 59, 999);
      break;
    case AutoBudgetPeriod.QUARTERLY:
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate.setMonth(quarterStartMonth);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(quarterStartMonth + 3);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case AutoBudgetPeriod.HALF_YEAR:
      const halfYearStartMonth = now.getMonth() < 6 ? 0 : 6;
      startDate.setMonth(halfYearStartMonth);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(halfYearStartMonth + 6);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case AutoBudgetPeriod.YEARLY:
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11);
      endDate.setDate(31);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate };
}

/**
 * Calcula o total gasto em um período
 */
/**
 * Calcula o total gasto em um período para um budget
 * Nota: Como não há relação direta budgetId, isso precisaria ser implementado
 * através de categories que pertencem ao budget
 */
async function calculateSpentAmount(budgetId: string, startDate: Date, endDate: Date): Promise<Decimal> {
  // Buscar categorias do budget
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      limits: {
        where: {
          startDate: {
            lte: endDate,
          },
          endDate: {
            gte: startDate,
          },
        },
      },
    },
  });

  if (!budget) {
    return new Decimal(0);
  }

  // Por enquanto retorna 0, mas deveria buscar transações das categorias do budget
  // TODO: Implementar busca por categorias quando houver relação Budget -> Category
  return new Decimal(0);
}

export default {
  name: 'process-auto-budgets',
  schedule: '0 1 * * *', // Diário às 01:00
  handler: processAutoBudgets,
};
