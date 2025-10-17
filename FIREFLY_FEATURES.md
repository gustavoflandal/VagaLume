# 🔥 VagaLume - Funcionalidades Completas do Firefly III

Este documento lista **TODAS** as funcionalidades implementadas para replicar exatamente o Firefly III.

## ✅ Status da Implementação

### 📊 Schema do Banco de Dados (COMPLETO)

#### Modelos Básicos (Já existentes)
- ✅ **User**: Usuários do sistema
- ✅ **RefreshToken**: Tokens de refresh JWT
- ✅ **Account**: Contas financeiras
- ✅ **Category**: Categorias e subcategorias
- ✅ **Transaction**: Transações básicas

#### 🎯 Novos Modelos Adicionados (Firefly III)

##### 1. **Piggy Banks (Cofrinhos/Metas de Economia)** 🐷
- `PiggyBank`: Metas de economia com valores alvo
- `PiggyBankEvent`: Histórico de adições/remoções de dinheiro

**Funcionalidades**:
- Criar objetivos de economia (ex: "Viagem", "Carro Novo")
- Definir valor alvo e data limite
- Adicionar/remover dinheiro manualmente
- Vincular transações específicas
- Acompanhar progresso visualmente
- Agrupar cofrinhos por objetivo

##### 2. **Bills (Assinaturas/Contas Recorrentes)** 📄
- `Bill`: Contas recorrentes esperadas

**Funcionalidades**:
- Cadastrar assinaturas (Netflix, internet, aluguel, etc)
- Definir valores mín/máx esperados
- Frequência de repetição (mensal, trimestral, anual)
- **Auto-match de transações**: Vincula automaticamente transações que correspondam ao padrão
- Alertas de vencimento
- Skip de períodos
- Data de término/extensão

##### 3. **Budgets Avançados** 💰
- `Budget`: Orçamentos
- `BudgetLimit`: Limites por período
- `AutoBudget`: Orçamento automático

**Funcionalidades**:
- Definir limites de gastos por categoria
- Limites por período (mensal, trimestral, anual)
- **Auto-Budget com 3 tipos**:
  - **RESET**: Zera no início do período
  - **ROLLOVER**: Transfere saldo não utilizado para o próximo período
  - **ADJUSTED**: Ajusta baseado no gasto anterior
- Alertas quando ultrapassar limite
- Gráficos de progresso

##### 4. **Rules (Regras/Automação)** ⚙️
- `RuleGroup`: Grupos de regras
- `Rule`: Regras de automação
- `RuleTrigger`: Gatilhos (condições)
- `RuleAction`: Ações a executar

**Funcionalidades**:
- **Triggers disponíveis** (40+ tipos):
  - `description_is`, `description_contains`, `description_starts`, `description_ends`
  - `amount_more`, `amount_less`, `amount_is`
  - `category_is`, `budget_is`, `tag_is`
  - `from_account_is`, `to_account_is`
  - `bill_is`, `has_no_category`, `has_no_budget`
  - `date_before`, `date_after`
  - E muitos outros...

- **Actions disponíveis** (30+ tipos):
  - `set_category`, `set_budget`, `add_tag`
  - `set_description`, `append_description`, `prepend_description`
  - `set_amount`, `add_to_piggy_bank`
  - `link_to_bill`, `set_notes`
  - `convert_to_withdrawal`, `convert_to_deposit`, `convert_to_transfer`
  - `delete_transaction`
  - E muitos outros...

- **Modos de execução**:
  - **Strict (AND)**: Todas as condições devem ser verdadeiras
  - **Non-strict (OR)**: Qualquer condição verdadeira
  - **Stop processing**: Para a execução após match
  - Ordem de execução configurável

- **Teste de regras**: Preview das transações que seriam afetadas
- Aplicação manual ou automática (ao criar transações)

##### 5. **Recurrences (Transações Recorrentes)** 🔄
- `Recurrence`: Transação recorrente
- `RecurrenceRepetition`: Configuração de repetição
- `RecurrenceTransaction`: Template da transação
- `RecurrenceTransactionMeta`: Metadados adicionais

**Funcionalidades**:
- **Frequências**:
  - Diária, semanal, mensal, trimestral, semestral, anual, customizada
- **Configurações avançadas**:
  - Primeiro dia de execução
  - Data limite ou número de repetições
  - Pular períodos (skip)
  - Tratamento de finais de semana (pular, criar antes, criar depois, criar no dia)
- **Geração automática via Cron Job**
- **Preview**: Visualizar próximas 5 transações que serão criadas
- Aplicar regras automaticamente nas transações geradas

##### 6. **Tags** 🏷️
- `Tag`: Tags personalizadas
- `TransactionTag`: Vínculo transação-tag

**Funcionalidades**:
- Tags personalizadas com data
- **Cloud de tags**: Visualização com tamanho proporcional ao uso
- Filtros por tag
- Relatórios por tag
- Geolocalização (latitude/longitude/zoom)
- Descrição detalhada

##### 7. **Attachments (Anexos)** 📎
- `Attachment`: Arquivos anexados

**Funcionalidades**:
- Upload de arquivos (PDF, imagens, documentos)
- Vincular a qualquer entidade:
  - Transações
  - Cofrinhos
  - Bills
  - Budgets
  - Categorias
  - Tags
  - Recorrências
- Armazenamento local ou S3
- Preview de imagens
- Download de arquivos

##### 8. **Notes (Notas)** 📝
- `Note`: Notas de texto

**Funcionalidades**:
- Adicionar notas detalhadas a:
  - Transações
  - Cofrinhos
  - Bills
  - Budgets
  - Categorias
  - Recorrências
- Suporte a Markdown
- Histórico de edições

##### 9. **Locations (Geolocalização)** 📍
- `Location`: Coordenadas geográficas

**Funcionalidades**:
- Adicionar localização a:
  - Transações (onde foi feita a compra)
  - Tags (eventos com local)
- Mapa interativo com Mapbox/Google Maps
- Zoom configurável
- Pesquisa de endereço
- Visualização de gastos por região

##### 10. **Object Groups (Agrupamento)** 📦
- `ObjectGroup`: Grupos de objetos

**Funcionalidades**:
- Agrupar cofrinhos relacionados
- Agrupar bills relacionados
- Ordenação customizada
- Visualização agrupada

##### 11. **Webhooks** 🪝
- `Webhook`: Configuração de webhook
- `WebhookMessage`: Mensagens a enviar
- `WebhookAttempt`: Tentativas de envio

**Funcionalidades**:
- **Triggers**:
  - `STORE_TRANSACTION`, `UPDATE_TRANSACTION`, `DESTROY_TRANSACTION`
  - `STORE_BUDGET`, `UPDATE_BUDGET`, `DESTROY_BUDGET`
  - `STORE_UPDATE_BUDGET_LIMIT`
- **Responses**:
  - `TRANSACTIONS`: Detalhes da transação
  - `ACCOUNTS`: Detalhes da conta
  - `BUDGET`: Detalhes do orçamento
  - `NONE`: Sem dados adicionais
- **Delivery**: JSON via POST
- Retry automático em caso de falha
- Histórico de envios e respostas

##### 12. **Transaction Links (Links entre Transações)** 🔗
- `LinkType`: Tipos de link
- `TransactionLink`: Links específicos

**Funcionalidades**:
- Vincular transações relacionadas
- **Tipos de link padrão**:
  - "Paga" / "Pago por"
  - "Reembolsa" / "Reembolsado por"
  - "Refunde" / "Refundado por"
  - "Parte de" / "Consiste de" (splits)
- Tipos customizados
- Navegação bidirecional

---

## 🎨 Frontend a Implementar

### Views Principais

#### 1. **Piggy Banks View** 🐷
- Grid de cofrinhos com progresso visual
- Botões "+/-" para adicionar/remover dinheiro
- Modal de criação/edição
- Ordenação drag-and-drop
- Filtros: ativos, concluídos, por grupo

#### 2. **Bills View** 📄
- Lista de assinaturas com status
- Indicador visual: pago, pendente, atrasado
- Auto-match de transações
- Alertas de vencimento próximo
- Gráfico de gastos mensais

#### 3. **Budgets View (Atualizada)** 💰
- Configuração de limites por período
- Gráficos de progresso
- Auto-budget (reset, rollover, adjusted)
- Comparação mensal
- Alertas visuais ao ultrapassar

#### 4. **Rules View** ⚙️
- Lista de grupos de regras
- Construtor visual de regras (drag-drop)
- Teste de regras com preview
- Ordenação e prioridade
- Ativação/desativação rápida

#### 5. **Recurrences View** 🔄
- Lista de transações recorrentes
- Preview das próximas 5 ocorrências
- Calendário visual
- Configuração de skip/weekend
- Execução manual

#### 6. **Tags View** 🏷️
- Cloud de tags interativa
- Filtros por período
- Mapa de tags geolocalizadas
- Estatísticas de uso

#### 7. **Webhooks View** 🪝
- Lista de webhooks configurados
- Teste manual
- Histórico de envios
- Status de mensagens pendentes
- Retry manual

#### 8. **Dashboard (Atualizado)** 📊
- **Novos widgets**:
  - Progresso de cofrinhos
  - Bills próximas do vencimento
  - Resumo de budgets
  - Próximas transações recorrentes
  - Cloud de tags do mês
  - Gráfico de gastos por localização

#### 9. **Transactions View (Atualizado)** 💳
- **Novos recursos**:
  - Campo de tags com autocomplete
  - Upload de attachments
  - Seleção de localização em mapa
  - Links para outras transações
  - Aplicação manual de regras
  - Vincular a cofrinhos
  - Vincular a bills
  - Campo de external_id e external_url

### Componentes Compartilhados

- **MapPicker**: Seleção de localização no mapa
- **FileUpload**: Upload com preview
- **TagInput**: Input com múltiplas tags
- **RuleBuilder**: Construtor visual de regras
- **ProgressBar**: Barra de progresso com porcentagem
- **DateRangePicker**: Seleção de período
- **FrequencySelector**: Seleção de frequência de repetição
- **AmountRangeInput**: Input de faixa de valores

---

## 🔧 Backend a Implementar

### Services

1. **PiggyBankService**: CRUD + addMoney, removeMoney, calculateProgress
2. **BillService**: CRUD + autoMatch, checkDue, getNextExpected
3. **AutoBudgetService**: CRUD + generateLimits (reset, rollover, adjusted)
4. **BudgetLimitService**: CRUD + checkExceeded
5. **RuleService**: CRUD + test, apply, execute
6. **RuleGroupService**: CRUD + reorder
7. **RecurrenceService**: CRUD + generateTransactions, getNextOccurrences
8. **TagService**: CRUD + getCloud, search
9. **AttachmentService**: CRUD + upload, download
10. **LocationService**: CRUD + search, getNearby
11. **ObjectGroupService**: CRUD + reorder
12. **WebhookService**: CRUD + trigger, retry, getHistory
13. **TransactionLinkService**: CRUD + getLinkTypes

### Controllers

- `PiggyBanksController`: Todas as rotas CRUD + `/add-money`, `/remove-money`
- `BillsController`: CRUD + `/auto-match`, `/check-due`
- `RulesController`: CRUD + `/test`, `/apply/:id`
- `RuleGroupsController`: CRUD + `/reorder`
- `RecurrencesController`: CRUD + `/generate`, `/preview`
- `TagsController`: CRUD + `/cloud`, `/search`
- `AttachmentsController`: CRUD + `/upload`, `/download/:id`
- `WebhooksController`: CRUD + `/test/:id`, `/retry/:messageId`
- `TransactionLinksController`: CRUD + `/types`

### Cron Jobs

1. **GenerateRecurringTransactions**: Roda diariamente, gera transações recorrentes
2. **ProcessAutoBudgets**: Roda no início do período, processa auto-budgets
3. **CheckBillsDue**: Roda diariamente, envia alertas de bills próximas
4. **ProcessWebhooks**: Roda a cada 5 minutos, processa webhooks pendentes
5. **CalculatePiggyBankProgress**: Roda semanalmente, recalcula progresso

---

## 📊 Estatísticas do Projeto

### Banco de Dados
- **Tabelas**: 32 (7 existentes + 25 novas)
- **Relacionamentos**: 50+
- **Enums**: 11
- **Campos**: 300+

### Backend (a implementar)
- **Services**: 13 novos
- **Controllers**: 10 novos
- **Rotas**: 100+ novas
- **Cron Jobs**: 5
- **Middlewares**: 3 (rate limit, file upload, webhook validation)

### Frontend (a implementar)
- **Views**: 7 novas + 2 atualizadas
- **Components**: 10+ compartilhados
- **Services**: 10 novos
- **Stores**: 8 novos

---

## 🚀 Próximos Passos

1. ✅ **Schema Prisma atualizado** (CONCLUÍDO)
2. ⏳ **Criar migration** (próximo)
3. ⏳ **Implementar Services**
4. ⏳ **Implementar Controllers**
5. ⏳ **Configurar rotas**
6. ⏳ **Implementar Cron Jobs**
7. ⏳ **Frontend - Types**
8. ⏳ **Frontend - Services**
9. ⏳ **Frontend - Stores**
10. ⏳ **Frontend - Views**
11. ⏳ **Frontend - Components**
12. ⏳ **Seed com dados de exemplo**
13. ⏳ **Documentação da API**
14. ⏳ **Testes**

---

## 📚 Referências

- **Firefly III**: https://github.com/firefly-iii/firefly-iii
- **Documentação**: https://docs.firefly-iii.org
- **API Docs**: https://api-docs.firefly-iii.org

---

**Desenvolvido com base no Firefly III - Um gerenciador de finanças pessoais de código aberto** 🔥
