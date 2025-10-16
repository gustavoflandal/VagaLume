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
import accountRoutes from '@/routes/accounts';
import transactionRoutes from '@/routes/transactions';
import categoryRoutes from '@/routes/categories';

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
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
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
    this.app.use('/api/accounts', accountRoutes);
    this.app.use('/api/transactions', transactionRoutes);
    this.app.use('/api/categories', categoryRoutes);

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