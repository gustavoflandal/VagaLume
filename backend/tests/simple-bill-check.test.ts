import { prisma } from '@/config/database';

describe('Simple Bill Check', () => {
  it('deve verificar se tabela bills existe', async () => {
    const result = await prisma.$queryRaw`SHOW TABLES LIKE 'bills'`;
    console.log('Bills table:', result);
    expect(result).toBeDefined();
  });

  it('deve verificar se tabela bill_installments existe', async () => {
    const result = await prisma.$queryRaw`SHOW TABLES LIKE 'bill_installments'`;
    console.log('BillInstallments table:', result);
    expect(result).toBeDefined();
  });

  it('deve verificar estrutura da tabela bills', async () => {
    const result = await prisma.$queryRaw`DESCRIBE bills`;
    console.log('Bills structure:', JSON.stringify(result, null, 2));
  });

  it('deve verificar estrutura da tabela bill_installments', async () => {
    const result = await prisma.$queryRaw`DESCRIBE bill_installments`;
    console.log('BillInstallments structure:', JSON.stringify(result, null, 2));
  });
});
