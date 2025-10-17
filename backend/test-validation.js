// Script de teste rápido para validação de data
const { z } = require('zod');

const createTransactionSchema = z
  .object({
    description: z.string().min(1),
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    date: z.preprocess((arg) => {
      if (typeof arg === 'string') {
        console.log('Convertendo string para Date:', arg);
        return new Date(arg);
      }
      return arg;
    }, z.date({ invalid_type_error: 'Data inválida' })),
    fromAccountId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  });

// Teste com o payload do frontend
const testData = {
  type: "EXPENSE",
  amount: 100,
  description: "COMPRA PAULO CEZAR",
  date: "2025-10-16",
  fromAccountId: "cmgtlowsy000k10n89nlx9kt7",
  categoryId: "cmgtlows5000110n8gcetnm3y",
  status: "COMPLETED"
};

console.log('\n=== TESTE DE VALIDAÇÃO ===\n');
console.log('Payload de entrada:', JSON.stringify(testData, null, 2));

try {
  const result = createTransactionSchema.parse(testData);
  console.log('\n✅ VALIDAÇÃO PASSOU!');
  console.log('Resultado:', JSON.stringify(result, null, 2));
  console.log('\nTipo de date:', typeof result.date);
  console.log('Data convertida:', result.date);
} catch (error) {
  console.log('\n❌ VALIDAÇÃO FALHOU!');
  console.log('Erro:', error.errors || error.message);
}
