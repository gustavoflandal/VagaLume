# Como Contribuir para o VagaLume

Obrigado por considerar contribuir para o VagaLume! 🎉

Este documento fornece diretrizes e informações sobre como contribuir para o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Submissão de Pull Requests](#submissão-de-pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Funcionalidades](#sugerindo-funcionalidades)

## 🤝 Código de Conduta

Este projeto adere ao [Código de Conduta do Contributor Covenant](CODE_OF_CONDUCT.md). Ao participar, você concorda em seguir este código.

## 🚀 Como Posso Contribuir?

### Tipos de Contribuição
- 🐛 **Reportar bugs**
- ✨ **Sugerir funcionalidades**
- 💻 **Contribuir com código**
- 📚 **Melhorar documentação**
- 🧪 **Escrever testes**
- 🌐 **Traduzir conteúdo**
- 🎨 **Melhorar UI/UX**

### Áreas que Precisam de Ajuda
- [ ] Implementação de testes E2E
- [ ] Documentação da API
- [ ] Otimização de performance
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Segurança e auditoria
- [ ] Integração com bancos brasileiros

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- Node.js >= 20.0.0
- MySQL >= 8.0.0
- Git
- Editor de código (VS Code recomendado)

### Configuração Inicial

```bash
# 1. Fork o repositório no GitHub

# 2. Clone seu fork
git clone https://github.com/SEU_USUARIO/vagalume.git
cd vagalume

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL_USUARIO/vagalume.git

# 4. Instale dependências
npm run install:all

# 5. Configure o ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 6. Configure o banco de dados
npm run db:setup

# 7. Inicie o desenvolvimento
npm run dev
```

### Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "vue.volar",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

## 🔄 Processo de Desenvolvimento

### Fluxo Git

```bash
# 1. Certifique-se de estar na branch main atualizada
git checkout main
git pull upstream main

# 2. Crie uma nova branch para sua feature
git checkout -b feature/nome-da-feature

# 3. Faça suas alterações e commits
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 4. Push para seu fork
git push origin feature/nome-da-feature

# 5. Abra um Pull Request no GitHub
```

### Convenção de Branches
```
main                    # Produção
develop                # Desenvolvimento
feature/nome-feature   # Novas funcionalidades
bugfix/nome-bug        # Correção de bugs
hotfix/nome-hotfix     # Correções urgentes
docs/nome-doc          # Documentação
test/nome-test         # Testes
refactor/nome-refactor # Refatoração
```

### Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta o código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção
- `perf`: Melhorias de performance
- `ci`: Integração contínua

#### Exemplos
```bash
feat(auth): adiciona autenticação JWT
fix(api): corrige erro na validação de dados
docs(readme): atualiza instruções de instalação
test(users): adiciona testes para CRUD de usuários
```

## 📏 Padrões de Código

### TypeScript
- Use tipos explícitos sempre que possível
- Evite `any`, prefira `unknown` quando necessário
- Use interfaces para contratos públicos
- Use types para unions e helpers

### Vue.js
- Use Composition API
- Componentes em PascalCase
- Props com tipos definidos
- Emits tipados

### Estilo de Código
```javascript
// ✅ Bom
interface User {
  id: number;
  name: string;
  email: string;
}

const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  // implementação
};

// ❌ Evitar
const createUser = async (userData: any) => {
  // implementação
};
```

### Estrutura de Arquivos
```
src/
├── components/        # Componentes reutilizáveis
│   ├── ui/           # Componentes base (botões, inputs)
│   ├── forms/        # Formulários
│   └── charts/       # Gráficos
├── views/            # Páginas/Views
├── stores/           # Estado global (Pinia)
├── composables/      # Lógica reutilizável
├── utils/            # Utilitários
├── types/            # Tipos TypeScript
└── api/              # Cliente da API
```

## 📝 Submissão de Pull Requests

### Checklist antes de submeter

- [ ] Código segue os padrões do projeto
- [ ] Testes foram escritos e passam
- [ ] Documentação foi atualizada
- [ ] Commit messages seguem convenção
- [ ] Branch está atualizada com main
- [ ] Não há conflitos

### Template de PR

```markdown
## 📋 Descrição
Breve descrição das mudanças realizadas.

## 🔄 Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação

## 🧪 Como foi testado?
Descreva os testes realizados.

## 📷 Screenshots (se aplicável)
Adicione screenshots para mudanças visuais.

## ✅ Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Realizei uma auto-revisão do meu código
- [ ] Comentei partes complexas do código
- [ ] Documentação foi atualizada
- [ ] Testes foram adicionados/atualizados
- [ ] Todos os testes passam
```

## 🐛 Reportando Bugs

### Template de Bug Report

```markdown
## 🐛 Descrição do Bug
Descrição clara e concisa do bug.

## 🔄 Passos para Reproduzir
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

## ✅ Comportamento Esperado
Descrição do que deveria acontecer.

## 🖼️ Screenshots
Se aplicável, adicione screenshots.

## 🌍 Ambiente
- OS: [ex. Windows 10]
- Browser: [ex. Chrome 91]
- Versão: [ex. 1.0.0]

## ℹ️ Informações Adicionais
Qualquer outra informação relevante.
```

## ✨ Sugerindo Funcionalidades

### Template de Feature Request

```markdown
## 🚀 Descrição da Funcionalidade
Descrição clara da funcionalidade sugerida.

## 🎯 Problema que Resolve
Que problema esta funcionalidade resolve?

## 💡 Solução Proposta
Descrição da solução que você gostaria.

## 🔄 Alternativas Consideradas
Outras soluções que você considerou.

## ℹ️ Informações Adicionais
Qualquer outra informação relevante.
```

## 🧪 Executando Testes

```bash
# Todos os testes
npm test

# Testes do backend
npm run test:backend

# Testes do frontend
npm run test:frontend

# Testes E2E
npm run test:e2e

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📚 Recursos Adicionais

### Documentação
- [Documentação da API](docs/api.md)
- [Guia de Componentes](docs/components.md)
- [Arquitetura do Sistema](docs/architecture.md)

### Links Úteis
- [Vue.js 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🆘 Precisa de Ajuda?

- 💬 **Discord:** [Servidor VagaLume](https://discord.gg/vagalume)
- 📧 **Email:** suporte@vagalume.com.br
- 🐛 **Issues:** [GitHub Issues](https://github.com/usuario/vagalume/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/usuario/vagalume/discussions)

---

**Obrigado por contribuir! 🙏**