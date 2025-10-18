import { prisma } from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function applyMigration() {
  try {
    console.log('🔄 Aplicando migration...');
    
    const migrationPath = path.join(__dirname, '../prisma/migrations/20251017172232_update_bills_add_installments/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Dividir por comandos SQL
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('/*'));
    
    for (const command of commands) {
      console.log(`Executando: ${command.substring(0, 50)}...`);
      await prisma.$executeRawUnsafe(command);
    }
    
    console.log('✅ Migration aplicada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
