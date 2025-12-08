# Estrutura de Arquivos SQL

Este diretório contém scripts SQL para o banco de dados Supabase.

## Estrutura Recomendada

```
database/
├── migrations/          # Migrações oficiais (versionadas)
├── fixes/               # Scripts de correção pontuais
├── schema/              # Definições de schema
├── seeds/               # Dados iniciais
└── scripts/             # Scripts utilitários
```

## Categorização dos Arquivos Atuais

### 🔵 Migrações (migrations/)
Arquivos que devem ser executados em ordem para criar/atualizar o banco:
- `CRIAR_BANCO_DO_ZERO.sql` - Schema inicial completo
- `RESET_BANCO_COMPLETO.sql` - Reset completo do banco
- `MIGRATION_COMPLETA.sql` - Migração consolidada
- `MIGRATION_FINAL.sql` - Migração final

### 🟢 Correções (fixes/)
Scripts para corrigir problemas específicos:
- `FIX_*.sql` - Correções diversas
- `CORRIGIR_*.sql` - Correções específicas
- `CORRECAO_*.sql` - Correções de problemas

### 🟡 Diagnóstico (scripts/)
Scripts para debug e verificação:
- `DIAGNOSTICO.sql` - Diagnóstico do banco
- `CHECK_COLUMNS.sql` - Verificar colunas
- `INSPECT_INSTALLMENTS.sql` - Inspecionar parcelas
- `DEBUG_*.sql` - Scripts de debug
- `VERIFICACAO_E_OTIMIZACAO.sql` - Verificação

### 🟠 Automação (functions/)
Funções e triggers:
- `AUTOMACAO_COMPLETA.sql` - Sistema de automação
- `AUTOMATION_FUNCTION.sql` - Funções de automação
- `UPDATE_AUTOMATION_LOGIC.sql` - Lógica de automação

### 🔴 RLS/Segurança
Scripts relacionados a Row Level Security:
- `FIX_RLS_*.sql` - Correções de RLS
- `CORRIGIR_RLS_*.sql` - Correções de RLS
- `DESABILITAR_RLS_TEMP.sql` - Desabilitar temporariamente

## Como Usar

### Novo ambiente
```sql
-- 1. Criar banco do zero
\i database/CRIAR_BANCO_DO_ZERO.sql

-- 2. Aplicar migrações
\i supabase/migrations/*.sql (em ordem)
```

### Correções
```sql
-- Executar script específico de correção
\i database/FIX_<problema>.sql
```

## Notas

- Scripts na pasta `supabase/migrations/` são gerenciados pelo Supabase CLI
- Scripts na pasta `database/` são manuais
- Prefira usar migrações versionadas para mudanças de schema
