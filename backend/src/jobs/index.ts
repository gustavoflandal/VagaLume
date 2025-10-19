/**
 * Cron Jobs Manager
 * Gerencia a execução de todos os cron jobs do sistema
 */

// import generateRecurrencesJob from './generateRecurrences.job'; // Temporariamente desabilitado
// import processAutoBudgetsJob from './processAutoBudgets.job'; // Temporariamente desabilitado
import checkBillsJob from './checkBills.job';
import processWebhooksJob from './processWebhooks.job';
import logger from '@/utils/logger';

export interface CronJob {
  name: string;
  schedule: string; // Cron expression
  handler: () => Promise<any>;
}

// Lista de todos os jobs
export const jobs: CronJob[] = [
  // generateRecurrencesJob, // Temporariamente desabilitado
  // processAutoBudgetsJob, // Temporariamente desabilitado
  checkBillsJob,
  processWebhooksJob,
];

/**
 * Inicializa todos os cron jobs
 * Requer uma biblioteca como node-cron para funcionar
 */
export function initializeJobs() {
  logger.info('📅 Inicializando cron jobs...');
  
  // Para usar node-cron, instale: npm install node-cron @types/node-cron
  // Exemplo de uso:
  // import cron from 'node-cron';
  // jobs.forEach(job => {
  //   cron.schedule(job.schedule, async () => {
  //     logger.info(`Executando job: ${job.name}`);
  //     await job.handler();
  //   });
  //   logger.info(`✓ Job agendado: ${job.name} (${job.schedule})`);
  // });

  logger.warn('⚠️ Cron jobs definidos mas não inicializados. Instale node-cron para ativar.');
  logger.info(`📋 Jobs disponíveis: ${jobs.map(j => j.name).join(', ')}`);
}

/**
 * Executa um job manualmente (útil para testes)
 */
export async function runJob(jobName: string) {
  const job = jobs.find(j => j.name === jobName);
  
  if (!job) {
    throw new Error(`Job "${jobName}" não encontrado`);
  }

  logger.info(`🔧 Executando job manualmente: ${job.name}`);
  const result = await job.handler();
  return result;
}

export default {
  jobs,
  initializeJobs,
  runJob,
};
