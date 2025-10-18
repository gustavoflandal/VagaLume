import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '@/utils/logger';

/**
 * Middleware genérico de validação usando Zod
 */
export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Erro de validação:', { errors, body: req.body });
        
        res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors,
        });
        return;
      }
      
      logger.error('Erro inesperado na validação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno de validação',
      });
      return;
    }
  };
}

// ============================================
// SCHEMAS DE VALIDAÇÃO - TRANSAÇÕES
// ============================================

export const createTransactionSchema = z
  .object({
    description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição muito longa'),
    amount: z.number().positive('Valor deve ser maior que zero'),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'], {
      errorMap: () => ({ message: 'Tipo inválido. Use INCOME, EXPENSE ou TRANSFER' }),
    }),
    date: z.preprocess((arg) => {
      if (typeof arg === 'string') {
        // Aceita tanto "2025-10-16" quanto "2025-10-16T00:00:00.000Z"
        return new Date(arg);
      }
      return arg;
    }, z.date({ invalid_type_error: 'Data inválida' })),
    fromAccountId: z.string().cuid('ID de conta inválido').optional(),
    toAccountId: z.string().cuid('ID de conta inválido').optional(),
    categoryId: z.string().cuid('ID de categoria inválido').optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
    notes: z.string().max(1000, 'Notas muito longas').optional(),
    tags: z.array(z.string()).optional(),
    attachments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'TRANSFER') {
        return data.fromAccountId && data.toAccountId;
      }
      if (data.type === 'EXPENSE') {
        return data.fromAccountId;
      }
      if (data.type === 'INCOME') {
        return data.toAccountId;
      }
      return true;
    },
    {
      message: 'Contas obrigatórias não fornecidas para o tipo de transação',
      path: ['fromAccountId', 'toAccountId'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'TRANSFER' && data.fromAccountId === data.toAccountId) {
        return false;
      }
      return true;
    },
    {
      message: 'Contas de origem e destino devem ser diferentes em transferências',
      path: ['toAccountId'],
    }
  );

export const updateTransactionSchema = z
  .object({
    description: z.string().min(1).max(255).optional(),
    amount: z.number().positive().optional(),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
    date: z.preprocess((arg) => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    }, z.date()).optional(),
    fromAccountId: z.string().cuid().nullable().optional(),
    toAccountId: z.string().cuid().nullable().optional(),
    categoryId: z.string().cuid().nullable().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
    notes: z.string().max(1000).optional(),
  })
  .partial();

// ============================================
// SCHEMAS DE VALIDAÇÃO - CATEGORIAS
// ============================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)').optional(),
  icon: z.string().max(50, 'Ícone muito longo').optional(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  parentId: z.string().cuid('ID de categoria pai inválido').optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().max(50).optional(),
    description: z.string().max(500).optional(),
    parentId: z.string().cuid().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .partial();

// ============================================
// SCHEMAS DE VALIDAÇÃO - CONTAS
// ============================================

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'CASH', 'OTHER'], {
    errorMap: () => ({ message: 'Tipo de conta inválido' }),
  }),
  initialBalance: z.number().default(0),
  currency: z.string().length(3, 'Código de moeda deve ter 3 caracteres').default('BRL'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  includeInNetWorth: z.boolean().default(true),
});

export const updateAccountSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'CASH', 'OTHER']).optional(),
    currency: z.string().length(3).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().max(50).optional(),
    description: z.string().max(500).optional(),
    includeInNetWorth: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .partial();

// ============================================
// SCHEMAS DE VALIDAÇÃO - AUTENTICAÇÃO
// ============================================

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// ============================================
// SCHEMAS DE VALIDAÇÃO - ORÇAMENTOS
// ============================================

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Período inválido' }),
  }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  active: z.boolean().default(true),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// ============================================
// SCHEMAS DE VALIDAÇÃO - BILLS
// ============================================

export const createBillSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  dueDate: z.coerce.date(),
  categoryId: z.string().uuid('ID de categoria inválido').optional(),
  accountId: z.string().uuid('ID de conta inválido').optional(),
  isPaid: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export const updateBillSchema = createBillSchema.partial();

// ============================================
// SCHEMAS DE VALIDAÇÃO - PIGGY BANKS
// ============================================

export const createPiggyBankSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  targetAmount: z.number().positive('Meta deve ser maior que zero'),
  currentAmount: z.number().min(0, 'Valor atual não pode ser negativo').default(0),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
  accountId: z.string().uuid('ID de conta inválido').optional(),
  notes: z.string().max(500).optional(),
});

export const updatePiggyBankSchema = createPiggyBankSchema.partial();

