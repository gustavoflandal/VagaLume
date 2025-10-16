import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '@/config';

// Definir formatos de log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  }),
);

// Configurar transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: config.logs.level,
    format: consoleFormat,
  }),
];

// File transport (opcional)
if (config.logs.file) {
  // Log de erro
  transports.push(
    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    }),
  );

  // Log geral
  transports.push(
    new DailyRotateFile({
      level: config.logs.level,
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
    }),
  );
}

// Criar logger
export const logger = winston.createLogger({
  level: config.logs.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Stream para Morgan
export const loggerStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

// Interceptar console.log em produção
if (config.nodeEnv === 'production') {
  console.log = (...args: unknown[]): void => {
    logger.info(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
  };
  
  console.error = (...args: unknown[]): void => {
    logger.error(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
  };
  
  console.warn = (...args: unknown[]): void => {
    logger.warn(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
  };
}

export default logger;