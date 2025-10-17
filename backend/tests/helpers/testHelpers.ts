import { prisma } from '@/config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '@/config';

/**
 * Cria um usuário de teste no banco
 */
export async function createTestUser(data?: Partial<{
  name: string;
  email: string;
  password: string;
}>) {
  const hashedPassword = await bcrypt.hash(data?.password || 'Test123!', config.security.bcryptRounds);
  
  return await prisma.user.create({
    data: {
      name: data?.name || 'Test User',
      email: data?.email || `test-${Date.now()}@example.com`,
      password: hashedPassword,
    },
  });
}

/**
 * Gera token JWT para um usuário
 */
export function generateTestToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'access' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * Gera refresh token para um usuário
 */
export function generateTestRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

/**
 * Cria uma categoria de teste
 */
export async function createTestCategory(userId: string, data?: Partial<{
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
}>) {
  return await prisma.category.create({
    data: {
      userId,
      name: data?.name || `Test Category ${Date.now()}`,
      color: data?.color || '#6366f1',
      icon: data?.icon || '📁',
      parentId: data?.parentId,
    },
  });
}

/**
 * Cria uma conta de teste
 */
export async function createTestAccount(userId: string, data?: Partial<{
  name: string;
  type: string;
  initialBalance: number;
  currency: string;
}>) {
  return await prisma.account.create({
    data: {
      userId,
      name: data?.name || `Test Account ${Date.now()}`,
      type: (data?.type as any) || 'CHECKING',
      balance: data?.initialBalance || 1000,
      currency: data?.currency || 'BRL',
    },
  });
}

/**
 * Cria uma transação de teste
 */
export async function createTestTransaction(userId: string, data: {
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  date?: Date;
}) {
  return await prisma.transaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      categoryId: data.categoryId,
      date: data.date || new Date(),
      status: 'COMPLETED',
    },
  });
}

/**
 * Cria um budget de teste
 */
export async function createTestBudget(userId: string, data?: Partial<{
  name: string;
  amount: number;
  period: string;
  startDate: Date;
}>) {
  return await prisma.budget.create({
    data: {
      userId,
      name: data?.name || `Test Budget ${Date.now()}`,
      amount: data?.amount || 1000,
      period: (data?.period as any) || 'MONTHLY',
      startDate: data?.startDate || new Date(),
      active: true,
    },
  });
}

/**
 * Cria um bill de teste
 */
export async function createTestBill(userId: string, data?: Partial<{
  name: string;
  amount: number;
  dueDate: Date;
  categoryId: string;
}>) {
  return await prisma.bill.create({
    data: {
      userId,
      name: data?.name || `Test Bill ${Date.now()}`,
      amount: data?.amount || 100,
      dueDate: data?.dueDate || new Date(),
      categoryId: data?.categoryId,
      isPaid: false,
      isRecurring: false,
    },
  });
}

/**
 * Cria um piggy bank de teste
 */
export async function createTestPiggyBank(userId: string, data?: Partial<{
  name: string;
  targetAmount: number;
  currentAmount: number;
  accountId: string;
}>) {
  return await prisma.piggyBank.create({
    data: {
      userId,
      name: data?.name || `Test Piggy Bank ${Date.now()}`,
      targetAmount: data?.targetAmount || 1000,
      currentAmount: data?.currentAmount || 0,
      accountId: data?.accountId,
    },
  });
}

/**
 * Aguarda um tempo (útil para testes assíncronos)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
