const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Configurando banco de dados de teste...\n');

try {
  // Carregar variáveis de ambiente de teste
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });
  
  console.log('📊 Aplicando schema Prisma ao banco de teste...');
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  
  console.log('\n✅ Banco de dados de teste configurado com sucesso!');
  console.log('📝 Você pode agora executar: npm test\n');
} catch (error) {
  console.error('\n❌ Erro ao configurar banco de teste:', error.message);
  process.exit(1);
}
