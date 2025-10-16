import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// Configuração do Prisma Client
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log de queries do Prisma em desenvolvimento
if (process.env['NODE_ENV'] === 'development') {
  prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
    logger.debug('Prisma Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Função para conectar ao banco
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Conectado ao banco de dados MySQL');
  } catch (error) {
    logger.error('❌ Erro ao conectar com o banco de dados:', error);
    throw error;
  }
}

// Função para desconectar do banco
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('✅ Desconectado do banco de dados MySQL');
  } catch (error) {
    logger.error('❌ Erro ao desconectar do banco de dados:', error);
    throw error;
  }
}

export default prisma;