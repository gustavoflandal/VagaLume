const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se usuário já existe
    const existing = await prisma.user.findUnique({
      where: { email: 'demo@vagalume.com.br' }
    });

    if (existing) {
      console.log('⚠️  Usuário demo já existe!');
      return;
    }

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
    console.log('📧 Email: demo@vagalume.com.br');
    console.log('🔑 Senha: Demo@2025');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
