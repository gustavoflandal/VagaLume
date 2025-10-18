import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    console.log('🔄 Criando usuário administrador...\n');
    
    // Verificar se já existe
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@vagalume.com' }
    });
    
    if (existing) {
      console.log('⚠️  Usuário admin@vagalume.com já existe!');
      console.log('🔑 Use a senha: Admin@123\n');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@vagalume.com',
        password: hashedPassword,
      },
    });
    
    console.log('✅ Usuário administrador criado com sucesso!\n');
    console.log('📧 Email: admin@vagalume.com');
    console.log('🔑 Senha: Admin@123');
    console.log('🆔 ID:', user.id);
    console.log('\n💡 Use essas credenciais para fazer login no sistema!');
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    
    if (error.code === 'P2002') {
      console.log('\n⚠️  Usuário já existe! Use: admin@vagalume.com / Admin@123');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
