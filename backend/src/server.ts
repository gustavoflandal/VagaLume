import App from './app';
import { logger } from '@/utils/logger';
import { prisma, connectDatabase, disconnectDatabase } from '@/config/database';

// Graceful shutdown
async function gracefulShutdown(): Promise<void> {
  logger.info('🛑 Iniciando shutdown graceful...');
  
  try {
    await disconnectDatabase();
    logger.info('✅ Desconectado do banco de dados');
  } catch (error) {
    logger.error('❌ Erro ao desconectar do banco:', error);
  }
  
  process.exit(0);
}

// Event listeners para shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Error handlers globais
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Inicializar aplicação
async function startServer(): Promise<void> {
  try {
    // Conectar ao banco
    await connectDatabase();
    
    // Inicializar app
    const app = new App();
    app.listen();
    
  } catch (error) {
    logger.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Exportar prisma para uso na aplicação
export { prisma };

// Iniciar servidor se não estiver em teste
if (process.env['NODE_ENV'] !== 'test') {
  startServer().catch((error) => {
    logger.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}