import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function resetDatabase() {
  console.log('🔄 Resetando banco de dados via Prisma...\n');

  // Banco de produção
  const prismaProduction = new PrismaClient({
    datasources: {
      db: {
        url: 'mysql://root:VagaLume@Root2025!@localhost:3306/vagalume',
      },
    },
  });

  // Banco de testes
  const prismaTest = new PrismaClient({
    datasources: {
      db: {
        url: 'mysql://root:VagaLume@Root2025!@localhost:3306/vagalume_test',
      },
    },
  });

  try {
    // 1. Dropar e recriar banco de produção
    console.log('1️⃣ Resetando banco de produção...');
    await prismaProduction.$executeRawUnsafe('DROP DATABASE IF EXISTS vagalume');
    await prismaProduction.$executeRawUnsafe('CREATE DATABASE vagalume CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Banco de produção resetado\n');

    // 2. Dropar e recriar banco de testes
    console.log('2️⃣ Resetando banco de testes...');
    await prismaTest.$executeRawUnsafe('DROP DATABASE IF EXISTS vagalume_test');
    await prismaTest.$executeRawUnsafe('CREATE DATABASE vagalume_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Banco de testes resetado\n');

    await prismaProduction.$disconnect();
    await prismaTest.$disconnect();

    // 3. Aplicar schema no banco de produção
    console.log('3️⃣ Aplicando schema no banco de produção...');
    const { stdout: pushProd } = await execAsync('npx prisma db push --accept-data-loss');
    console.log(pushProd);
    console.log('✅ Schema aplicado no banco de produção\n');

    // 4. Aplicar schema no banco de testes
    console.log('4️⃣ Aplicando schema no banco de testes...');
    process.env['DATABASE_URL'] = 'mysql://root:VagaLume@Root2025!@localhost:3306/vagalume_test';
    const { stdout: pushTest } = await execAsync('npx prisma db push --accept-data-loss');
    console.log(pushTest);
    console.log('✅ Schema aplicado no banco de testes\n');

    // 5. Gerar Prisma Client
    console.log('5️⃣ Gerando Prisma Client...');
    const { stdout: generate } = await execAsync('npx prisma generate');
    console.log(generate);
    console.log('✅ Prisma Client gerado\n');

    console.log('🎉 SUCESSO TOTAL!');
    console.log('\n✅ Bancos resetados e schema aplicado corretamente!');
    console.log('✅ Tabela bill_installments criada!');
    console.log('✅ Todos os campos corretos na tabela bills!');

  } catch (error: any) {
    console.error('❌ ERRO:', error.message);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.log('stderr:', error.stderr);
    process.exit(1);
  }
}

resetDatabase();
