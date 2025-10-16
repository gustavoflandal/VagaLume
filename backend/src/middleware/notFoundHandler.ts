import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): Response => {
  return res.status(404).json({
    error: {
      message: `Rota não encontrada: ${req.method} ${req.path}`,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};