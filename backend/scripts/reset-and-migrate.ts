import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

async function resetAndMigrate() {
  console.log('🔄 Iniciando reset e migração do banco de dados...\n');

  try {
    // 1. Dropar banco de produção
    console.log('1️⃣ Dropando banco de produção (vagalume)...');
    await execAsync('mysql -u root -pVagaLume@Root2025! -e "DROP DATABASE IF EXISTS vagalume;"');
    console.log('✅ Banco dropado\n');

    // 2. Criar banco de produção
    console.log('2️⃣ Criando banco de produção...');
    await execAsync('mysql -u root -pVagaLume@Root2025! -e "CREATE DATABASE vagalume CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"');
    console.log('✅ Banco criado\n');

    // 3. Dropar banco de testes
    console.log('3️⃣ Dropando banco de testes (vagalume_test)...');
    await execAsync('mysql -u root -pVagaLume@Root2025! -e "DROP DATABASE IF EXISTS vagalume_test;"');
    console.log('✅ Banco de testes dropado\n');

    // 4. Criar banco de testes
    console.log('4️⃣ Criando banco de testes...');
    await execAsync('mysql -u root -pVagaLume@Root2025! -e "CREATE DATABASE vagalume_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"');
    console.log('✅ Banco de testes criado\n');

    // 5. Aplicar schema no banco de produção
    console.log('5️⃣ Aplicando schema no banco de produção...');
    const { stdout: pushOutput } = await execAsync('npx prisma db push', {
      cwd: path.join(__dirname, '..'),
    });
    console.log(pushOutput);
    console.log('✅ Schema aplicado no banco de produção\n');

    // 6. Aplicar schema no banco de testes
    console.log('6️⃣ Aplicando schema no banco de testes...');
    const { stdout: pushTestOutput } = await execAsync(
      'npx prisma db push',
      {
        cwd: path.join(__dirname, '..'),
        env: {
          ...process.env,
          DATABASE_URL: 'mysql://root:VagaLume@Root2025!@localhost:3306/vagalume_test',
        },
      }
    );
    console.log(pushTestOutput);
    console.log('✅ Schema aplicado no banco de testes\n');

    // 7. Gerar Prisma Client
    console.log('7️⃣ Gerando Prisma Client...');
    const { stdout: generateOutput } = await execAsync('npx prisma generate', {
      cwd: path.join(__dirname, '..'),
    });
    console.log(generateOutput);
    console.log('✅ Prisma Client gerado\n');

    console.log('🎉 SUCESSO! Banco de dados resetado e migrado corretamente!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Reiniciar o backend (npm run dev)');
    console.log('   2. Reiniciar o frontend (npm run dev)');
    console.log('   3. Testar o módulo Bills');

  } catch (error: any) {
    console.error('❌ ERRO:', error.message);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.log('stderr:', error.stderr);
    process.exit(1);
  }
}

resetAndMigrate();
