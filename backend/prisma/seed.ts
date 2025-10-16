import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Dados existentes limpos');

  // Criar usuário demo
  const hashedPassword = await bcrypt.hash('Demo@2025', 12);
  
  const user = await prisma.user.create({
    data: {
      name: 'Usuário Demo',
      email: 'demo@vagalume.com.br',
      password: hashedPassword,
      emailVerified: true,
    },
  });

  console.log('✅ Usuário demo criado:', user.email);

  // Criar categorias padrão
  const categories = await prisma.category.createMany({
    data: [
      // Categorias gerais (despesas e receitas)
      { name: 'Alimentação', color: '#FF6B6B', icon: 'utensils', userId: user.id },
      { name: 'Transporte', color: '#4ECDC4', icon: 'car', userId: user.id },
      { name: 'Moradia', color: '#45B7D1', icon: 'home', userId: user.id },
      { name: 'Saúde', color: '#96CEB4', icon: 'heartbeat', userId: user.id },
      { name: 'Educação', color: '#FFEAA7', icon: 'book', userId: user.id },
      { name: 'Lazer', color: '#DDA15E', icon: 'gamepad', userId: user.id },
      { name: 'Vestuário', color: '#BC6C25', icon: 'tshirt', userId: user.id },
      { name: 'Serviços', color: '#606C38', icon: 'tools', userId: user.id },
      { name: 'Outros', color: '#9E9E9E', icon: 'ellipsis-h', userId: user.id },
      { name: 'Salário', color: '#2ECC71', icon: 'money-bill-wave', userId: user.id },
      { name: 'Freelance', color: '#3498DB', icon: 'laptop-code', userId: user.id },
      { name: 'Investimentos', color: '#F39C12', icon: 'chart-line', userId: user.id },
      { name: 'Presente', color: '#E91E63', icon: 'gift', userId: user.id },
      { name: 'Outras Receitas', color: '#9B59B6', icon: 'plus-circle', userId: user.id },
    ],
  });

  console.log('✅ Categorias padrão criadas:', categories.count);

  // Criar contas padrão
  const checkingAccount = await prisma.account.create({
    data: {
      name: 'Conta Corrente',
      type: 'CHECKING',
      balance: 5000.00,
      currency: 'BRL',
      userId: user.id,
    },
  });

  const savingsAccount = await prisma.account.create({
    data: {
      name: 'Poupança',
      type: 'SAVINGS',
      balance: 10000.00,
      currency: 'BRL',
      userId: user.id,
    },
  });

  const creditCard = await prisma.account.create({
    data: {
      name: 'Cartão de Crédito',
      type: 'CREDIT_CARD',
      balance: -1500.00,
      currency: 'BRL',
      userId: user.id,
    },
  });

  console.log('✅ Contas criadas:', [checkingAccount.name, savingsAccount.name, creditCard.name].join(', '));

  // Criar algumas transações de exemplo
  const alimentacaoCategory = await prisma.category.findFirst({
    where: { name: 'Alimentação', userId: user.id },
  });

  const salarioCategory = await prisma.category.findFirst({
    where: { name: 'Salário', userId: user.id },
  });

  if (alimentacaoCategory && salarioCategory) {
    await prisma.transaction.createMany({
      data: [
        // Receita: Salário
        {
          description: 'Salário Outubro',
          amount: 5000.00,
          type: 'INCOME',
          date: new Date('2025-10-01'),
          toAccountId: checkingAccount.id,
          categoryId: salarioCategory.id,
          userId: user.id,
        },
        // Despesas
        {
          description: 'Supermercado',
          amount: 350.50,
          type: 'EXPENSE',
          date: new Date('2025-10-05'),
          fromAccountId: checkingAccount.id,
          categoryId: alimentacaoCategory.id,
          userId: user.id,
        },
        {
          description: 'Restaurante',
          amount: 120.00,
          type: 'EXPENSE',
          date: new Date('2025-10-08'),
          fromAccountId: creditCard.id,
          categoryId: alimentacaoCategory.id,
          userId: user.id,
        },
        // Transferência
        {
          description: 'Transferência para Poupança',
          amount: 1000.00,
          type: 'TRANSFER',
          date: new Date('2025-10-10'),
          fromAccountId: checkingAccount.id,
          toAccountId: savingsAccount.id,
          categoryId: null,
          userId: user.id,
        },
      ],
    });

    console.log('✅ Transações de exemplo criadas');
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });