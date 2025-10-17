import dotenv from 'dotenv';

// Carregar variáveis de ambiente de teste ANTES de importar qualquer coisa
dotenv.config({ path: '.env.test' });

import { prisma } from '@/config/database';

// Timeout global para testes
jest.setTimeout(30000);

// Setup antes de todos os testes
beforeAll(async () => {
  // Garantir que estamos em ambiente de teste
  if (process.env['NODE_ENV'] !== 'test') {
    throw new Error('NODE_ENV deve ser "test" para rodar testes!');
  }

  // Limpar banco de dados antes dos testes
  await cleanDatabase();
});

// Cleanup após cada teste (desabilitado para melhor performance)
// afterEach(async () => {
//   await cleanDatabase();
// });

// Cleanup após todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * Limpa todas as tabelas do banco de dados de teste
 */
async function cleanDatabase() {
  const tables = [
    'TransactionLink',
    'TransactionLinkType',
    'WebhookDelivery',
    'Webhook',
    'ObjectGroup',
    'Location',
    'Attachment',
    'TransactionTag',
    'Tag',
    'RecurrenceTransaction',
    'RecurrenceRepetitionConfig',
    'Recurrence',
    'RuleAction',
    'RuleCondition',
    'Rule',
    'RuleGroup',
    'AutoBudget',
    'BudgetLimit',
    'Budget',
    'BillTransaction',
    'Bill',
    'PiggyBankEvent',
    'PiggyBank',
    'Transaction',
    'Category',
    'Account',
    'User',
  ];

  // Desabilitar verificação de chaves estrangeiras
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  // Limpar cada tabela
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
    } catch (error) {
      // Ignorar silenciosamente erros de tabelas que não existem
    }
  }

  // Reabilitar verificação de chaves estrangeiras
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
}

// Exportar função de limpeza para uso nos testes
export { cleanDatabase };
