import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  redis: {
    url: string;
    password?: string | undefined;
    db: number;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    origin: string;
    methods: string;
    credentials: boolean;
  };
  security: {
    bcryptRounds: number;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
    path: string;
  };
  logs: {
    level: string;
    file: boolean;
  };
  features: {
    swaggerEnabled: boolean;
    metricsEnabled: boolean;
  };
}

const config: Config = {
  port: parseInt(process.env['PORT'] || '3001', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  
  database: {
    url: process.env['DATABASE_URL'] || 'mysql://vagalume:password@localhost:3306/vagalume',
  },
  
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key-change-in-production',
    expiresIn: process.env['JWT_EXPIRE'] || '15m',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRE'] || '7d',
  },
  
  redis: {
    url: process.env['REDIS_URL'] || 'redis://localhost:6379',
    password: process.env['REDIS_PASSWORD'],
    db: parseInt(process.env['REDIS_DB'] || '0', 10),
  },
  
  email: {
    host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] || '587', 10),
    secure: process.env['SMTP_SECURE'] === 'true',
    user: process.env['SMTP_USER'] || '',
    pass: process.env['SMTP_PASS'] || '',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000', 10), // 1 minuto em dev
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '1000', 10), // 1000 requisições em dev
  },
  
  cors: {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
    methods: process.env['CORS_METHODS'] || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: process.env['CORS_CREDENTIALS'] === 'true' || true,
  },
  
  security: {
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10),
  },
  
  upload: {
    maxSize: parseInt(process.env['UPLOAD_MAX_SIZE'] || '10485760', 10), // 10MB
    allowedTypes: (process.env['UPLOAD_ALLOWED_TYPES'] || 'image/jpeg,image/png,image/webp,application/pdf').split(','),
    path: process.env['UPLOAD_PATH'] || './uploads',
  },
  
  logs: {
    level: process.env['LOG_LEVEL'] || 'info',
    file: process.env['LOG_FILE'] === 'true',
  },
  
  features: {
    swaggerEnabled: process.env['SWAGGER_ENABLED'] !== 'false',
    metricsEnabled: process.env['METRICS_ENABLED'] === 'true',
  },
};

// Validações de configuração obrigatória
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
      // eslint-disable-next-line no-console
      console.warn(
        `[config] Variável ${envVar} não definida. Usando valor padrão para ambiente ${config.nodeEnv}.`
      );
    } else {
      throw new Error(`Variável de ambiente obrigatória não encontrada: ${envVar}`);
    }
  }
}

export default config;