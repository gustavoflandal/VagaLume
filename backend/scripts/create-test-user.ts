import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    console.log('🔄 Criando usuário de teste...');
    
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      },
    });
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Senha: Test@123');
    console.log('🆔 ID:', user.id);
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
