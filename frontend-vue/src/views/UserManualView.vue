<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, Home, Rocket, Wallet, ArrowLeftRight, Tag, Calendar, PiggyBank, BarChart3, Settings, Info, CheckCircle, AlertCircle } from 'lucide-vue-next'

const activeSection = ref('intro')

const sections = [
  { id: 'intro', title: 'Introdução', icon: Home },
  { id: 'start', title: 'Primeiros Passos', icon: Rocket },
  { id: 'accounts', title: 'Contas', icon: Wallet },
  { id: 'transactions', title: 'Transações', icon: ArrowLeftRight },
  { id: 'categories', title: 'Categorias', icon: Tag },
  { id: 'bills', title: 'Contas Recorrentes', icon: Calendar },
  { id: 'budgets', title: 'Orçamentos', icon: PiggyBank },
  { id: 'reports', title: 'Relatórios', icon: BarChart3 },
  { id: 'settings', title: 'Configurações', icon: Settings },
]

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  alert('Copiado para a área de transferência!')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen class="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Manual de Utilização</h1>
            <p class="text-gray-600 mt-1">Guia completo do VagaLume - Sistema de Gestão Financeira</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <div class="p-4 border-b border-gray-200">
              <h3 class="font-semibold text-gray-900">Navegação</h3>
            </div>
            <nav class="p-2">
              <a
                v-for="section in sections"
                :key="section.id"
                :href="`#${section.id}`"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                :class="{ 'bg-blue-50 text-blue-600': activeSection === section.id }"
              >
                <component :is="section.icon" class="w-5 h-5" />
                <span class="text-sm font-medium">{{ section.title }}</span>
              </a>
            </nav>
          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-3 space-y-8">
          <!-- Introdução -->
          <section id="intro" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <Home class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Introdução</h2>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 mb-4">
                Bem-vindo ao <strong>VagaLume</strong>, seu sistema completo de gestão financeira pessoal.
                Este manual irá guiá-lo através de todas as funcionalidades do sistema, desde o cadastro inicial
                até recursos avançados como orçamentos e relatórios.
              </p>

              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                <div class="flex items-start">
                  <Info class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p class="font-semibold text-blue-900 mb-1">O que é o VagaLume?</p>
                    <p class="text-blue-800 text-sm">
                      VagaLume é uma plataforma moderna de gestão financeira que permite controlar suas receitas,
                      despesas, contas bancárias, orçamentos e muito mais, tudo em um só lugar.
                    </p>
                  </div>
                </div>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mt-6 mb-3">Principais Recursos</h3>
              <ul class="space-y-2">
                <li class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><strong>Contas Bancárias:</strong> Gerencie múltiplas contas (corrente, poupança, cartão)</span>
                </li>
                <li class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><strong>Transações:</strong> Registre receitas, despesas e transferências</span>
                </li>
                <li class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><strong>Categorias:</strong> Organize suas transações</span>
                </li>
                <li class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><strong>Contas Recorrentes:</strong> Controle contas fixas e parceladas</span>
                </li>
                <li class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><strong>Orçamentos:</strong> Defina limites de gastos</span>
                </li>
                <li class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span><strong>Relatórios:</strong> Visualize análises detalhadas</span>
                </li>
              </ul>
            </div>
          </section>

          <!-- Primeiros Passos -->
          <section id="start" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <Rocket class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Primeiros Passos</h2>
            </div>

            <div class="prose max-w-none space-y-6">
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">1. Cadastro e Login</h3>
                <ol class="space-y-2 list-decimal list-inside">
                  <li>Acesse a página de registro e preencha seus dados (nome, email, senha)</li>
                  <li>Confirme seu cadastro clicando no link enviado por email</li>
                  <li>Faça login com suas credenciais</li>
                  <li>Você será direcionado ao Dashboard, sua página inicial</li>
                </ol>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">2. Configurar Contas Bancárias</h3>
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                  <p class="text-sm text-gray-600">Navegue até: <strong>Contas → Nova Conta</strong></p>
                </div>
                <ul class="space-y-2">
                  <li><strong>Nome:</strong> Ex: "Conta Corrente Banco X"</li>
                  <li><strong>Tipo:</strong> Escolha entre: Corrente, Poupança, Cartão de Crédito, Investimento, Dinheiro</li>
                  <li><strong>Saldo Inicial:</strong> Informe o saldo atual da conta</li>
                  <li><strong>Moeda:</strong> Selecione a moeda (padrão: BRL)</li>
                  <li><strong>Cor:</strong> Escolha uma cor para identificação visual</li>
                  <li><strong>Salvar:</strong> Clique em "Salvar Conta"</li>
                </ul>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">3. Criar Categorias</h3>
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                  <p class="text-sm text-gray-600">Navegue até: <strong>Categorias → Nova Categoria</strong></p>
                </div>
                <ul class="space-y-2">
                  <li><strong>Nome:</strong> Ex: "Alimentação", "Transporte", "Lazer"</li>
                  <li><strong>Tipo:</strong> Receita ou Despesa</li>
                  <li><strong>Ícone:</strong> Escolha um emoji representativo</li>
                  <li><strong>Cor:</strong> Selecione uma cor para identificação visual</li>
                </ul>
              </div>

              <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <div class="flex items-start">
                  <AlertCircle class="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p class="font-semibold text-yellow-900 mb-1">Dica Importante</p>
                    <p class="text-yellow-800 text-sm">
                      Cadastre todas as suas contas bancárias e categorias antes de começar a registrar transações.
                      Isso facilitará o controle financeiro completo e permitirá análises mais precisas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Contas -->
          <section id="accounts" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <Wallet class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Contas Bancárias</h2>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 mb-6">
                As contas bancárias são a base do seu controle financeiro. Cada transação está vinculada a uma conta,
                e o saldo é calculado automaticamente baseado nas movimentações.
              </p>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Tipos de Conta Disponíveis</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">💳 Conta Corrente</h4>
                  <p class="text-sm text-gray-600">Conta bancária principal para movimentações diárias</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">🏦 Poupança</h4>
                  <p class="text-sm text-gray-600">Conta para guardar dinheiro e rendimentos</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">💎 Cartão de Crédito</h4>
                  <p class="text-sm text-gray-600">Controle de gastos no cartão e fatura</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">📈 Investimento</h4>
                  <p class="text-sm text-gray-600">Acompanhe seus investimentos e rentabilidade</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">💵 Dinheiro</h4>
                  <p class="text-sm text-gray-600">Controle de dinheiro em espécie</p>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">🔧 Outro</h4>
                  <p class="text-sm text-gray-600">Qualquer outro tipo de conta</p>
                </div>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Gerenciando Suas Contas</h3>
              <ul class="space-y-2 mb-6">
                <li><strong>Visualizar Saldo:</strong> O saldo é calculado automaticamente: Saldo Inicial + Receitas - Despesas</li>
                <li><strong>Editar Conta:</strong> Clique no ícone de edição para alterar nome, tipo, cor, etc.</li>
                <li><strong>Arquivar Conta:</strong> Contas inativas podem ser arquivadas sem perder histórico</li>
                <li><strong>Excluir Conta:</strong> Apenas contas sem transações podem ser excluídas</li>
                <li><strong>Saldo Atual:</strong> Mostra o saldo atualizado em tempo real</li>
              </ul>

              <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div class="flex items-start">
                  <Info class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p class="font-semibold text-blue-900 mb-1">Saldo Automático</p>
                    <p class="text-blue-800 text-sm">
                      O saldo de cada conta é calculado automaticamente baseado em todas as transações.
                      Não é necessário atualizar manualmente. O cálculo é: Saldo Inicial + Receitas - Despesas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Transações -->
          <section id="transactions" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <ArrowLeftRight class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Transações</h2>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 mb-6">
                Transações são todas as movimentações financeiras: receitas, despesas e transferências entre contas.
              </p>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Tipos de Transação</h3>

              <div class="space-y-4 mb-6">
                <div class="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                  <h4 class="font-semibold text-green-900 mb-2">💰 Receita (Income)</h4>
                  <p class="text-sm text-green-800 mb-3">Entrada de dinheiro na conta</p>
                  <p class="text-sm text-green-800"><strong>Exemplos:</strong> Salário, Freelance, Venda, Presente recebido</p>
                </div>

                <div class="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                  <h4 class="font-semibold text-red-900 mb-2">💸 Despesa (Expense)</h4>
                  <p class="text-sm text-red-800 mb-3">Saída de dinheiro da conta</p>
                  <p class="text-sm text-red-800"><strong>Exemplos:</strong> Supermercado, Aluguel, Transporte, Lazer, Saúde</p>
                </div>

                <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <h4 class="font-semibold text-blue-900 mb-2">🔄 Transferência (Transfer)</h4>
                  <p class="text-sm text-blue-800 mb-3">Movimentação entre suas próprias contas</p>
                  <p class="text-sm text-blue-800"><strong>Exemplos:</strong> Corrente → Poupança, Dinheiro → Corrente</p>
                </div>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Criando uma Transação</h3>
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <p class="text-sm text-gray-600">Navegue até: <strong>Transações → Nova Transação</strong></p>
              </div>

              <ol class="space-y-3 mb-6">
                <li><strong>Tipo:</strong> Selecione Receita, Despesa ou Transferência</li>
                <li><strong>Valor:</strong> Informe o valor da transação</li>
                <li><strong>Descrição:</strong> Descreva a transação (ex: "Supermercado Dia 15", "Salário Janeiro")</li>
                <li><strong>Data:</strong> Data em que a transação ocorreu</li>
                <li><strong>Conta:</strong> Conta de origem (para despesas/receitas) ou conta de origem e destino (para transferências)</li>
                <li><strong>Categoria:</strong> Classifique a transação (obrigatório para receitas e despesas)</li>
                <li><strong>Status:</strong> Pendente ou Concluída</li>
                <li><strong>Tags (opcional):</strong> Adicione tags para filtros avançados</li>
              </ol>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Filtros e Busca</h3>
              <p class="text-gray-700 mb-4">
                A lista de transações possui filtros poderosos para encontrar exatamente o que você precisa:
              </p>
              <ul class="space-y-2">
                <li><strong>Por Tipo:</strong> Filtre apenas receitas, despesas ou transferências</li>
                <li><strong>Por Período:</strong> Selecione data inicial e final</li>
                <li><strong>Por Conta:</strong> Veja transações de uma conta específica</li>
                <li><strong>Por Categoria:</strong> Analise gastos de uma categoria específica</li>
                <li><strong>Por Status:</strong> Visualize apenas pendentes ou concluídas</li>
                <li><strong>Busca por Texto:</strong> Procure por palavras na descrição</li>
                <li><strong>Ordenação:</strong> Organize por data, valor, descrição, etc.</li>
              </ul>
            </div>
          </section>

          <!-- Categorias -->
          <section id="categories" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <Tag class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Categorias</h2>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 mb-6">
                Categorias ajudam a organizar e analisar seus gastos e receitas de forma estruturada,
                permitindo identificar padrões de consumo e facilitar a criação de orçamentos.
              </p>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Categorias Padrão</h3>
              <p class="text-gray-700 mb-4">
                O sistema já vem com categorias pré-cadastradas organizadas por tipo de gasto comum:
              </p>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div class="bg-gray-50 rounded-lg p-3 text-center">
                  <span class="text-2xl">🍔</span>
                  <p class="text-sm font-medium mt-1">Alimentação</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 text-center">
                  <span class="text-2xl">🚗</span>
                  <p class="text-sm font-medium mt-1">Transporte</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 text-center">
                  <span class="text-2xl">🏠</span>
                  <p class="text-sm font-medium mt-1">Moradia</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 text-center">
                  <span class="text-2xl">🎬</span>
                  <p class="text-sm font-medium mt-1">Lazer</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 text-center">
                  <span class="text-2xl">🏥</span>
                  <p class="text-sm font-medium mt-1">Saúde</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-3 text-center">
                  <span class="text-2xl">📚</span>
                  <p class="text-sm font-medium mt-1">Educação</p>
                </div>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Personalizando Categorias</h3>
              <ul class="space-y-2">
                <li><strong>Criar Nova:</strong> Defina nome, tipo (receita/despesa), ícone e cor</li>
                <li><strong>Editar:</strong> Altere informações de categorias existentes</li>
                <li><strong>Desativar:</strong> Categorias não usadas podem ser desativadas para limpar a interface</li>
                <li><strong>Organização:</strong> As categorias são exibidas em ordem alfabética</li>
              </ul>

              <div class="bg-green-50 border-l-4 border-green-500 p-4 mt-6">
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p class="font-semibold text-green-900 mb-1">Categorização Inteligente</p>
                    <p class="text-green-800 text-sm">
                      Use categorias específicas para facilitar a análise de gastos. Por exemplo, em vez de "Despesa Genérica",
                      categorize como "Alimentação - Restaurante" ou "Transporte - Uber".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Contas Recorrentes -->
          <section id="bills" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <Calendar class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Contas Recorrentes</h2>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 mb-6">
                Gerencie contas fixas mensais e compras parceladas de forma automática.
                O sistema gera parcelas automaticamente baseado nas configurações.
              </p>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Tipos de Recorrência</h3>
              <ul class="space-y-2 mb-6">
                <li><strong>Diária:</strong> Cobra todo dia (ex: despesas diárias)</li>
                <li><strong>Semanal:</strong> Cobra toda semana (ex: limpeza semanal)</li>
                <li><strong>Mensal:</strong> Cobra todo mês (mais comum - aluguel, internet, celular)</li>
                <li><strong>Anual:</strong> Cobra uma vez por ano (ex: seguro, IPVA)</li>
              </ul>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Criando uma Conta Recorrente</h3>
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <p class="text-sm text-gray-600">Navegue até: <strong>Contas Recorrentes → Nova Conta</strong></p>
              </div>

              <ol class="space-y-3 mb-6">
                <li><strong>Nome:</strong> Ex: "Netflix", "Aluguel", "Celular Parcelado"</li>
                <li><strong>Valor:</strong> Valor da parcela ou conta fixa</li>
                <li><strong>Data de Vencimento:</strong> Dia do mês que vence (1-31)</li>
                <li><strong>Frequência:</strong> Diária, Semanal, Mensal, Anual</li>
                <li><strong>Número de Parcelas:</strong> Quantas vezes vai repetir (deixe vazio para infinito)</li>
                <li><strong>Dia Fixo:</strong> Marque se sempre vence no mesmo dia (ignora finais de semana)</li>
                <li><strong>Conta:</strong> Conta bancária vinculada</li>
                <li><strong>Categoria:</strong> Classifique a conta</li>
              </ol>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Sistema de Parcelas</h3>
              <p class="text-gray-700 mb-4">
                O VagaLume gera automaticamente as parcelas da conta recorrente:
              </p>
              <ul class="space-y-2 mb-6">
                <li><strong>Parcelas do Mês:</strong> Veja as parcelas que vencem este mês</li>
                <li><strong>Próximo Mês:</strong> Visualize as parcelas do próximo mês</li>
                <li><strong>Pagar Parcela:</strong> Clique no ícone 💳 para registrar pagamento</li>
                <li><strong>Editar Parcela:</strong> Altere valor ou data de uma parcela específica</li>
                <li><strong>Excluir Parcela:</strong> Remova apenas a última parcela não paga</li>
              </ul>

              <div class="bg-green-50 border-l-4 border-green-500 p-4">
                <div class="flex items-start">
                  <CheckCircle class="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p class="font-semibold text-green-900 mb-1">Pagamento Automático</p>
                    <p class="text-green-800 text-sm">
                      Ao clicar em "Pagar Parcela", uma transação é criada automaticamente e vinculada à parcela,
                      atualizando o saldo da conta e marcando a parcela como paga.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Orçamentos -->
          <section id="budgets" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <PiggyBank class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Orçamentos</h2>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 mb-6">
                Defina limites de gastos e acompanhe seu controle financeiro de forma inteligente.
                Receba alertas quando estiver próximo ou acima do limite estabelecido.
              </p>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Tipos de Orçamento</h3>

              <div class="space-y-4 mb-6">
                <div class="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                  <h4 class="font-semibold text-purple-900 mb-2">📊 Orçamento Geral</h4>
                  <p class="text-sm text-purple-800 mb-2">
                    Define um limite total de gastos para o período, considerando TODAS as despesas.
                  </p>
                  <p class="text-sm text-purple-800">
                    <strong>Exemplo:</strong> "Quero gastar no máximo R$ 5.000,00 por mês com todas as despesas"
                  </p>
                </div>

                <div class="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded-r-lg">
                  <h4 class="font-semibold text-indigo-900 mb-2">🎯 Orçamento por Categoria</h4>
                  <p class="text-sm text-indigo-800 mb-2">
                    Define limites específicos para cada categoria de gasto.
                  </p>
                  <p class="text-sm text-indigo-800">
                    <strong>Exemplo:</strong> "R$ 1.500 para Alimentação, R$ 800 para Transporte, R$ 400 para Lazer"
                  </p>
                </div>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Criando um Orçamento</h3>
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <p class="text-sm text-gray-600">Navegue até: <strong>Orçamentos → Novo Orçamento</strong></p>
              </div>

              <ol class="space-y-3 mb-6">
                <li><strong>Nome:</strong> Ex: "Orçamento Mensal 2025"</li>
                <li><strong>Tipo:</strong> Escolha entre Geral ou Por Categoria</li>
                <li><strong>Adicionar Limite:</strong> Clique em "+ Adicionar Limite"</li>
                <li><strong>Valor do Limite:</strong> Defina o valor máximo permitido</li>
                <li><strong>Período:</strong> Data inicial e final do limite</li>
                <li><strong>Categoria (se por categoria):</strong> Selecione a categoria específica</li>
                <li><strong>Salvar:</strong> Clique em "Salvar Orçamento"</li>
              </ol>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Acompanhando Orçamentos</h3>
              <ul class="space-y-2">
                <li><strong>Barra de Progresso:</strong> Visualize quanto já foi gasto em relação ao limite</li>
                <li><strong>Status:</strong> Seguro (até 69%), Atenção (70-89%), Perigo (90-99%), Excedido (100%+)</li>
                <li><strong>Valor Disponível:</strong> Quanto ainda pode gastar dentro do limite</li>
                <li><strong>Notificações:</strong> Receba alertas quando atingir percentuais definidos</li>
              </ul>
            </div>
          </section>

          <!-- Relatórios -->
          <section id="reports" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <BarChart3 class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Relatórios</h2>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 mb-6">
                Visualize análises detalhadas de suas finanças com gráficos interativos e tabelas.
                Exporte dados para análise externa quando necessário.
              </p>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Relatórios Disponíveis</h3>

              <div class="space-y-4 mb-6">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">📊 Gastos por Categoria</h4>
                  <p class="text-sm text-gray-600 mb-3">
                    Veja como seus gastos estão distribuídos entre as diferentes categorias
                  </p>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Gráfico de pizza com distribuição percentual</li>
                    <li>• Gráfico de barras comparativo</li>
                    <li>• Tabela detalhada com totais e médias</li>
                    <li>• Filtro por período personalizável</li>
                  </ul>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">📈 Receitas vs Despesas</h4>
                  <p class="text-sm text-gray-600 mb-3">
                    Compare receitas e despesas ao longo do tempo
                  </p>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Cards de resumo (total receitas, despesas, saldo)</li>
                    <li>• Gráfico de linha mostrando evolução mensal</li>
                    <li>• Tabela mensal com análise detalhada</li>
                    <li>• Taxa de economia calculada automaticamente</li>
                  </ul>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">💰 Análise de Orçamentos</h4>
                  <p class="text-sm text-gray-600 mb-3">
                    Acompanhe o desempenho dos seus orçamentos
                  </p>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Seletor de orçamento específico</li>
                    <li>• Filtro por tipo (geral vs por categoria)</li>
                    <li>• Cards com status e percentual utilizado</li>
                    <li>• Gráficos de comparação limite vs gasto</li>
                  </ul>
                </div>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Funcionalidades Comuns</h3>
              <ul class="space-y-2">
                <li><strong>Filtros de Período:</strong> Selecione datas específicas para análise</li>
                <li><strong>Exportação CSV:</strong> Baixe dados para análise externa</li>
                <li><strong>Gráficos Interativos:</strong> Passe o mouse para ver detalhes</li>
                <li><strong>Responsivo:</strong> Funciona perfeitamente em desktop e mobile</li>
              </ul>
            </div>
          </section>

          <!-- Configurações -->
          <section id="settings" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-3 mb-6">
              <Settings class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">Configurações</h2>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 mb-6">
                Personalize o sistema de acordo com suas preferências e necessidades.
              </p>

              <h3 class="text-xl font-bold text-gray-900 mb-4">Abas de Configuração</h3>

              <div class="space-y-4 mb-6">
                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">⚙️ Geral</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Moeda padrão (BRL, USD, EUR, etc.)</li>
                    <li>• Formato de data (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)</li>
                    <li>• Idioma (Português, Inglês, Espanhol)</li>
                    <li>• Fuso horário</li>
                  </ul>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">🔒 Segurança</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Alterar senha da conta</li>
                    <li>• Ver sessões ativas</li>
                    <li>• Configurações de 2FA (futuro)</li>
                  </ul>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">🔔 Notificações</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Contas próximas do vencimento</li>
                    <li>• Orçamento excedido</li>
                    <li>• Transações recorrentes</li>
                    <li>• Dias de antecedência para alertas</li>
                  </ul>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">🎨 Preferências</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Tema (claro, escuro, automático)</li>
                    <li>• Mostrar/ocultar saldos</li>
                    <li>• Aplicar regras automaticamente</li>
                  </ul>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">🔗 Integrações</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Configuração de webhooks</li>
                    <li>• Documentação da API</li>
                    <li>• Exemplos de integração</li>
                  </ul>
                </div>

                <div class="border border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-900 mb-2">⚠️ Zona de Perigo</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Exportar todos os dados (JSON)</li>
                    <li>• Excluir conta (confirmação dupla)</li>
                  </ul>
                </div>
              </div>

              <div class="bg-red-50 border-l-4 border-red-500 p-4">
                <div class="flex items-start">
                  <AlertCircle class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p class="font-semibold text-red-900 mb-1">Atenção</p>
                    <p class="text-red-800 text-sm">
                      Sempre clique em "Salvar Alterações" após modificar configurações.
                      Algumas mudanças requerem recarregamento da página para surtir efeito.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  color: #374151;
  max-width: none;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  color: #111827;
}

.prose a {
  color: #2563eb;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
</style>
