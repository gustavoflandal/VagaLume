import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void => {
  // Se response já foi enviado, delegue para o handler padrão do Express
  if (res.headersSent) {
    return next(error);
  }

  // Log do erro
  logger.error('Erro na aplicação:', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    code: error.code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    details: error.details,
  });

  // Determinar status code
  const statusCode = error.statusCode || 500;
  
  // Determinar código de erro
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  // Resposta de erro
  const errorResponse = {
    error: {
      message: error.message || 'Erro interno do servidor',
      code,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  };

  // Em desenvolvimento, incluir stack trace
  if (process.env['NODE_ENV'] === 'development') {
    (errorResponse.error as unknown as { stack: string }).stack = error.stack || '';
  }

  return res.status(statusCode).json(errorResponse);
};