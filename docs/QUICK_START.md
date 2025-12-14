# 🚀 Quick Start - Next.js 16

## Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Firebase

# 3. Executar em desenvolvimento
npm run dev

# 4. Acessar no navegador
# http://localhost:3000
```

## 📋 Checklist de Configuração

- [ ] Instalar dependências (`npm install`)
- [ ] Configurar `.env.local` com credenciais do Firebase
- [ ] Verificar se o Firebase está configurado corretamente
- [ ] Testar login (email/senha e Google)
- [ ] Verificar se as disciplinas estão sendo salvas

## 🔧 Comandos Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Executar build de produção
npm run lint         # Verificar erros de lint
npm run type-check   # Verificar tipos TypeScript
```

## 📁 Estrutura Principal

```
app/                    # Rotas do Next.js (App Router)
components/             # Componentes React
  ├── ui/              # Componentes shadcn/ui
  ├── layout/          # Header, Footer
  ├── features/        # Features principais
  └── pages/           # Páginas completas
lib/                    # Utilitários e configurações
types/                  # Tipos TypeScript
public/                 # Assets estáticos
```

## 🎨 Componentes Principais

- **Header**: Navegação principal com autenticação
- **Footer**: Rodapé com links e informações
- **CourseSelection**: Seleção de curso
- **DisciplineForm**: Formulário para adicionar disciplinas
- **AcademicHistory**: Tabela de histórico acadêmico
- **Summary**: Resumo e requisitos de formatura

## 🔐 Autenticação

O sistema usa Firebase Authentication com suporte para:
- Email/Senha
- Google OAuth

## 📊 Funcionalidades Implementadas

✅ Gerenciamento de disciplinas
✅ Cálculo de CR e estatísticas
✅ Requisitos de formatura por curso
✅ Autenticação Firebase
✅ Tema claro/escuro
✅ Responsividade completa

## 🐛 Problemas Comuns

### Firebase não inicializa
- Verifique se as variáveis de ambiente estão configuradas
- Certifique-se de que o Firebase está configurado no console

### Erro de build
- Execute `npm install` novamente
- Verifique se todas as dependências estão instaladas

### Estilos não aparecem
- Certifique-se de que o Tailwind está configurado
- Verifique se `globals.css` está importado no layout

## 📚 Próximos Passos

Consulte `MIGRACAO_NEXTJS.md` para mais detalhes sobre a migração e funcionalidades pendentes.

