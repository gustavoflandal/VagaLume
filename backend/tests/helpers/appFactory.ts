import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from '../../src/config';

// Routes
import authRoutes from '../../src/routes/auth';
import userRoutes from '../../src/routes/users';
import accountRoutes from '../../src/routes/accounts';
import transactionRoutes from '../../src/routes/transactions';
import categoryRoutes from '../../src/routes/categories';
import piggyBankRoutes from '../../src/routes/piggyBanks';
import billRoutes from '../../src/routes/bills';
import budgetRoutes from '../../src/routes/budgets';
import ruleRoutes from '../../src/routes/rules';
import objectGroupRoutes from '../../src/routes/objectGroups';
import webhookRoutes from '../../src/routes/webhooks';
import transactionLinkRoutes from '../../src/routes/transactionLinks';

import { errorHandler } from '../../src/middleware/errorHandler';
import { notFoundHandler } from '../../src/middleware/notFoundHandler';

/**
 * Cria uma instância simplificada do Express App para testes
 * Evita problemas com importações ES6 modules
 */
export function createTestApp() {
  const app = express();

  // Security middlewares (simplificados para testes)
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitar para testes
  }));

  // CORS
  app.use(cors({
    origin: config.cors.origin,
    methods: config.cors.methods.split(','),
    credentials: config.cors.credentials,
  }));

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '1.0.0-test',
    });
  });

  // Welcome route
  app.get('/', (_req, res) => {
    res.json({
      message: '🚀 Bem-vindo à API VagaLume (Test Mode)',
      version: '1.0.0-test',
      status: 'online',
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/piggy-banks', piggyBankRoutes);
  app.use('/api/bills', billRoutes);
  app.use('/api/budgets', budgetRoutes);
  app.use('/api/rules', ruleRoutes);
  app.use('/api/object-groups', objectGroupRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/transaction-links', transactionLinkRoutes);

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
