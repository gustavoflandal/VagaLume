import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import config from '@/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';

// Routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import settingsRoutes from '@/routes/settings';
import accountRoutes from '@/routes/accounts';
import transactionRoutes from '@/routes/transactions';
import categoryRoutes from '@/routes/categories';
import billRoutes from '@/routes/bills';
import budgetRoutes from '@/routes/budgets';
import ruleRoutes from '@/routes/rules';
// import recurrenceRoutes from '@/routes/recurrences'; // Temporariamente desabilitado
// import tagRoutes from '@/routes/tags'; // Temporariamente desabilitado (falta TransactionTag)
// import attachmentRoutes from '@/routes/attachments'; // Temporariamente desabilitado
// import locationRoutes from '@/routes/locations'; // Temporariamente desabilitado
import objectGroupRoutes from '@/routes/objectGroups';
import webhookRoutes from '@/routes/webhooks';
import transactionLinkRoutes from '@/routes/transactionLinks';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    logger.info(`CORS configurado para origem: ${config.cors.origin}`);
    this.app.use(cors({
      origin: config.cors.origin,
      methods: config.cors.methods.split(','),
      credentials: config.cors.credentials,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Muitas tentativas. Tente novamente em alguns minutos.',
        code: 'TOO_MANY_REQUESTS',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
    }

    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: process.env['npm_package_version'] || '1.0.0',
      });
    });
  }

  private initializeRoutes(): void {
    // Welcome route
    this.app.get('/', (_req, res) => {
      res.json({
        message: '🚀 Bem-vindo à API VagaLume',
        version: '1.0.0',
        status: 'online',
        endpoints: {
          auth: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            refresh: 'POST /api/auth/refresh',
            logout: 'POST /api/auth/logout',
          },
          users: {
            profile: 'GET /api/users/me',
            update: 'PUT /api/users/me',
            changePassword: 'PUT /api/users/me/password',
          },
          settings: {
            get: 'GET /api/settings',
            update: 'PUT /api/settings',
            reset: 'POST /api/settings/reset',
          },
          accounts: {
            list: 'GET /api/accounts',
            summary: 'GET /api/accounts/summary',
            create: 'POST /api/accounts',
            details: 'GET /api/accounts/:id',
            update: 'PUT /api/accounts/:id',
            delete: 'DELETE /api/accounts/:id',
          },
          transactions: {
            list: 'GET /api/transactions',
            summary: 'GET /api/transactions/summary',
            create: 'POST /api/transactions',
            details: 'GET /api/transactions/:id',
            update: 'PUT /api/transactions/:id',
            delete: 'DELETE /api/transactions/:id',
          },
          categories: {
            list: 'GET /api/categories',
            create: 'POST /api/categories',
            details: 'GET /api/categories/:id',
            update: 'PUT /api/categories/:id',
            delete: 'DELETE /api/categories/:id',
          },
          bills: {
            list: 'GET /api/bills',
            upcoming: 'GET /api/bills/upcoming',
            statistics: 'GET /api/bills/statistics',
            create: 'POST /api/bills',
            details: 'GET /api/bills/:id',
            update: 'PUT /api/bills/:id',
            delete: 'DELETE /api/bills/:id',
            autoMatch: 'GET /api/bills/:id/auto-match',
            linkTransaction: 'POST /api/bills/:id/link-transaction',
          },
          budgets: {
            list: 'GET /api/budgets',
            create: 'POST /api/budgets',
            details: 'GET /api/budgets/:id',
            update: 'PUT /api/budgets/:id',
            delete: 'DELETE /api/budgets/:id',
            check: 'GET /api/budgets/:id/check',
            createLimit: 'POST /api/budgets/limits',
            updateLimit: 'PUT /api/budgets/limits/:id',
            deleteLimit: 'DELETE /api/budgets/limits/:id',
            setAutoBudget: 'POST /api/budgets/:id/auto-budget',
            removeAutoBudget: 'DELETE /api/budgets/:id/auto-budget',
          },
          rules: {
            listGroups: 'GET /api/rules/groups',
            createGroup: 'POST /api/rules/groups',
            groupDetails: 'GET /api/rules/groups/:id',
            updateGroup: 'PUT /api/rules/groups/:id',
            deleteGroup: 'DELETE /api/rules/groups/:id',
            create: 'POST /api/rules',
            details: 'GET /api/rules/:id',
            update: 'PUT /api/rules/:id',
            delete: 'DELETE /api/rules/:id',
            test: 'GET /api/rules/:id/test',
            apply: 'POST /api/rules/:id/apply',
          },
          recurrences: {
            list: 'GET /api/recurrences',
            create: 'POST /api/recurrences',
            details: 'GET /api/recurrences/:id',
            update: 'PUT /api/recurrences/:id',
            delete: 'DELETE /api/recurrences/:id',
            nextOccurrences: 'GET /api/recurrences/:id/next-occurrences',
            generateAll: 'POST /api/recurrences/generate-all',
          },
          tags: {
            list: 'GET /api/tags',
            cloud: 'GET /api/tags/cloud',
            search: 'GET /api/tags/search',
            statistics: 'GET /api/tags/statistics',
            create: 'POST /api/tags',
            details: 'GET /api/tags/:id',
            update: 'PUT /api/tags/:id',
            delete: 'DELETE /api/tags/:id',
            link: 'POST /api/tags/:id/link',
            unlink: 'DELETE /api/tags/:id/unlink/:transactionId',
          },
          attachments: {
            list: 'GET /api/attachments',
            byEntity: 'GET /api/attachments/entity/:type/:id',
            statistics: 'GET /api/attachments/statistics',
            create: 'POST /api/attachments',
            details: 'GET /api/attachments/:id',
            update: 'PUT /api/attachments/:id',
            delete: 'DELETE /api/attachments/:id',
            markUploaded: 'POST /api/attachments/:id/uploaded',
          },
          locations: {
            nearby: 'GET /api/locations/nearby',
            details: 'GET /api/locations/:id',
            upsert: 'POST /api/locations',
            delete: 'DELETE /api/locations/:id',
          },
          objectGroups: {
            list: 'GET /api/object-groups',
            create: 'POST /api/object-groups',
            details: 'GET /api/object-groups/:id',
            update: 'PUT /api/object-groups/:id',
            delete: 'DELETE /api/object-groups/:id',
            reorder: 'POST /api/object-groups/reorder',
          },
          webhooks: {
            list: 'GET /api/webhooks',
            statistics: 'GET /api/webhooks/statistics',
            create: 'POST /api/webhooks',
            details: 'GET /api/webhooks/:id',
            update: 'PUT /api/webhooks/:id',
            delete: 'DELETE /api/webhooks/:id',
            test: 'POST /api/webhooks/:id/test',
            retry: 'POST /api/webhooks/:id/retry',
            history: 'GET /api/webhooks/:id/history',
            processPending: 'POST /api/webhooks/process-pending',
          },
          transactionLinks: {
            listTypes: 'GET /api/transaction-links/types',
            createType: 'POST /api/transaction-links/types',
            typeDetails: 'GET /api/transaction-links/types/:id',
            updateType: 'PUT /api/transaction-links/types/:id',
            deleteType: 'DELETE /api/transaction-links/types/:id',
            seedTypes: 'POST /api/transaction-links/types/seed',
            byTransaction: 'GET /api/transaction-links/transaction/:transactionId',
            create: 'POST /api/transaction-links',
            delete: 'DELETE /api/transaction-links/:id',
          },
        },
        documentation: config.features.swaggerEnabled && config.nodeEnv !== 'production' 
          ? `http://localhost:${config.port}/api/docs` 
          : null,
        healthCheck: `http://localhost:${config.port}/health`,
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/settings', settingsRoutes);
    this.app.use('/api/accounts', accountRoutes);
    this.app.use('/api/transactions', transactionRoutes);
    this.app.use('/api/categories', categoryRoutes);
    this.app.use('/api/bills', billRoutes);
    this.app.use('/api/budgets', budgetRoutes);
    this.app.use('/api/rules', ruleRoutes);
    // this.app.use('/api/recurrences', recurrenceRoutes); // Temporariamente desabilitado
    // this.app.use('/api/tags', tagRoutes); // Temporariamente desabilitado (falta TransactionTag)
    // this.app.use('/api/attachments', attachmentRoutes); // Temporariamente desabilitado
    // this.app.use('/api/locations', locationRoutes); // Temporariamente desabilitado
    this.app.use('/api/object-groups', objectGroupRoutes);
    this.app.use('/api/webhooks', webhookRoutes);
    this.app.use('/api/transaction-links', transactionLinkRoutes);

    // API documentation
    if (config.features.swaggerEnabled && config.nodeEnv !== 'production') {
      import('swagger-ui-express').then(swaggerUi => {
        import('swagger-jsdoc').then(swaggerJsdoc => {
          const specs = swaggerJsdoc.default({
            definition: {
              openapi: '3.0.0',
              info: {
                title: 'VagaLume API',
                version: '1.0.0',
                description: 'API do sistema de gestão financeira pessoal VagaLume',
              },
              servers: [
                {
                  url: `http://localhost:${config.port}/api`,
                  description: 'Servidor de desenvolvimento',
                },
              ],
            },
            apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
          });

          this.app.use('/api/docs', swaggerUi.default.serve, swaggerUi.default.setup(specs));
        }).catch(err => logger.error('Erro ao carregar swagger-jsdoc:', err));
      }).catch(err => logger.error('Erro ao carregar swagger-ui-express:', err));
    }
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      logger.info(`🚀 VagaLume API rodando na porta ${config.port}`);
      logger.info(`📖 Documentação disponível em: http://localhost:${config.port}/api/docs`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
      logger.info(`🌍 Ambiente: ${config.nodeEnv}`);
    });
  }
}

export default App;