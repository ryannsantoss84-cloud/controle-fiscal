# Sistema de Controle Fiscal 📊

Sistema moderno de controle de vencimentos fiscais para escritórios contábeis, desenvolvido com React, TypeScript e Supabase.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)

---

## 🚀 Funcionalidades

### Gestão Completa
- ✅ **Dashboard Operacional** - Métricas em tempo real com analytics avançado
- ✅ **Impostos e Obrigações** - Separação clara por esfera (Federal, Estadual, Municipal)
- ✅ **Parcelas** - Sistema independente de parcelamentos
- ✅ **Calendário Visual** - Visualização mensal integrada
- ✅ **Analytics** - Gráficos, heatmaps e rankings de performance
- ✅ **Templates** - Automação de criação de obrigações

### Automação Inteligente
- 🤖 **Auto-geração** - Trigger SQL + React Hook para geração automática
- 📅 **Cálculo de finais de semana** - Ajuste automático de datas
- 🔄 **Recorrência mensal** - Templates aplicados automaticamente

### UX Profissional
- 🎨 **Tema claro/escuro** - Paleta corporativa profissional
- ⚡ **Performance otimizada** - React.memo + useMemo aplicados
- 💀 **Skeleton loaders** - Feedback visual detalhado
- 📱 **Responsivo** - Mobile-first design

---

## 🏗️ Arquitetura

### Stack Tecnológica
```
Frontend:
├── React 18.3 + TypeScript 5.8
├── Vite (build tool)
├── TailwindCSS + shadcn/ui
├── React Query (cache/estado)
└── React Router (navegação)

Backend:
├── Supabase (PostgreSQL)
├── Row Level Security (RLS)
├── Triggers automáticos
└── Edge Functions (futuro)
```

### Estrutura Modular (Após Refatoração ✨)
```
src/
├── types/                    # Tipos TypeScript centralizados
│   ├── analytics.ts          # 6 interfaces
│   └── settings.ts           # 4 interfaces
│
├── pages/
│   ├── Analytics/
│   │   ├── components/       # ✨ 4 componentes extraídos
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── HeatmapCell.tsx
│   │   │   └── HealthBadge.tsx
│   │   └── index.tsx         # 653→530 linhas (-18.8%)
│   │
│   ├── Settings/
│   │   ├── components/       # ✨ 3 componentes extraídos
│   │   │   ├── CompanyTab.tsx
│   │   │   ├── AppearanceTab.tsx
│   │   │   └── AutomationTab.tsx
│   │   └── index.tsx
│   │
│   └── [outras páginas...]
│
├── components/
│   └── shared/
│       ├── CardSkeleton.tsx  # ✨ 3 variantes de skeleton
│       └── [outros...]
│
└── hooks/                    # 19 hooks customizados
```

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ ([instalar com nvm](https://github.com/nvm-sh/nvm))
- npm ou bun

### Passos

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Entre no diretório
cd controle-fiscal

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 5. Execute o script SQL de criação do banco
# Acesse Supabase → SQL Editor
# Execute database/CRIAR_BANCO_DO_ZERO.sql

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

---

## 🎯 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Linter ESLint
```

---

## 🧩 Componentes Reutilizáveis

### Analytics Components

#### ProgressRing
```tsx
import { ProgressRing } from '@/pages/Analytics/components';

<ProgressRing
  percent={85}
  color="#10b981"
  label="Concluídas"
  value="45/50"
/>
```

#### StatCard
```tsx
import { StatCard } from '@/pages/Analytics/components';
import { Target } from 'lucide-react';

<StatCard
  icon={Target}
  label="Taxa de Conclusão"
  value="85%"
  change={12}
  color="#10b981"
/>
```

### Loading States

```tsx
import { CardSkeleton, ListSkeleton, TableSkeleton } from '@/components/shared/CardSkeleton';

// Durante carregamento
{isLoading ? <CardSkeleton /> : <StatCard {...props} />}
{isLoading ? <ListSkeleton items={5} /> : <ClientList />}
{isLoading ? <TableSkeleton rows={10} /> : <DataTable />}
```

---

## 🎨 Personalização

### Tema
Configurável em **Configurações → Aparência**:
- Claro / Escuro / Automático
- Itens por página (10, 25, 50, 100)

### Automação
Configurável em **Configurações → Automação**:
- Tratamento de finais de semana
- Geração automática mensal

---

## 📊 Melhorias Recentes (Dez 2025)

### Refatoração de Código
- ✅ **Analytics**: 653→530 linhas (-18.8%)
- ✅ **8 componentes** extraídos e tipados
- ✅ **100% TypeScript** (zero `any`)

### Performance
- ✅ **React.memo** em componentes pesados
- ✅ **useMemo** para cálculos complexos
- ✅ **-30-40% re-renders** estimados

### UX
- ✅ **3 tipos de Skeleton** loaders
- ✅ **Feedback visual** profissional
- ✅ **Layout shift** minimizado

Veja [walkthrough.md](./docs/WALKTHROUGH_MELHORIAS.md) para detalhes completos.

---

## 🧪 Testes

```bash
# Testes unitários (em breve)
npm run test

# Testes E2E (em breve)
npm run test:e2e

# Coverage (em breve)
npm run test:coverage
```

---

## 📚 Documentação

- [Guia de Automação](./docs/GUIA_AUTOMACAO_COMPLETA.md)
- [Deploy Grátis](./docs/DEPLOY_GRATIS.md)
- [Migração Supabase](./docs/GUIA_MIGRACAO_SUPABASE.md)
- [Paleta Corporativa](./docs/PALETA_CORPORATIVA.md)
- [Auditoria de Design](./docs/AUDITORIA_DESIGN.md)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é privado e proprietário.

---

## 🛠️ Troubleshooting

### Erro de build
```bash
# Limpe o cache e reinstale
rm -rf node_modules
rm package-lock.json
npm install
```

### Erro de TypeScript
```bash
# Reinicie o servidor TypeScript no VSCode
Ctrl+Shift+P → TypeScript: Restart TS Server
```

### Banco de dados
Veja [database/README.md](./database/README.md) para scripts de correção.

---

## 📞 Suporte

Para questões e suporte, entre em contato com o desenvolvedor.

---

**Desenvolvido com ❤️ usando React + TypeScript + Supabase**
