# 🚀 Guia de Migração para o Novo Supabase

## ✅ Passo 1: Credenciais Atualizadas

As credenciais do `.env` já foram atualizadas para o novo projeto:

- **Projeto Antigo:** `ccicksnqlhbeagfocsuv`
- **Projeto Novo:** `tdjrodjegykvnreltwke` ✨
- **URL:** https://tdjrodjegykvnreltwke.supabase.co

---

## 🗄️ Passo 2: Executar a Migration no Novo Banco

### Opção A: Via SQL Editor (RECOMENDADO)

1. **Acesse o SQL Editor do novo projeto:**
   👉 https://supabase.com/dashboard/project/tdjrodjegykvnreltwke/sql/new

2. **Abra o arquivo de migration:**
   - Abra o arquivo `supabase/MIGRATION_COMPLETA.sql` no VS Code
   - Copie TODO o conteúdo (Ctrl+A, Ctrl+C)

3. **Cole no SQL Editor:**
   - Cole no editor do Supabase
   - Clique em **"Run"** ou **"Executar"**
   - Aguarde a confirmação de sucesso ✅

### Opção B: Via Supabase CLI

Se você tem o CLI instalado:

```bash
cd c:\Users\Admin\OneDrive\Desktop\control-fiscal-lov
npx supabase db push
```

---

## 🔄 Passo 3: Reiniciar o Servidor de Desenvolvimento

Após executar a migration, reinicie o servidor:

1. **Pare o servidor atual:**
   - Vá no terminal onde está rodando `npm run dev`
   - Pressione `Ctrl + C`

2. **Inicie novamente:**
   ```bash
   npm run dev
   ```

3. **Recarregue a página do navegador:**
   - Pressione `F5` ou `Ctrl + R`

---

## ✅ Passo 4: Verificar se Funcionou

### Teste 1: Criar um Cliente
1. Acesse http://127.0.0.1:8080
2. Vá em **Clientes**
3. Clique em **Novo Cliente**
4. Preencha todos os campos, incluindo:
   - ✅ Tipo de Atividade
   - ✅ Estado
   - ✅ Cidade
5. Clique em **Salvar**
6. **Deve funcionar sem erros!** 🎉

### Teste 2: Verificar no Supabase
1. Acesse: https://supabase.com/dashboard/project/tdjrodjegykvnreltwke/editor
2. Clique na tabela **clients**
3. Você deve ver as colunas:
   - `business_activity`
   - `state`
   - `city`
   - E todas as outras colunas

---

## 📊 O que foi criado no novo banco:

### Tabelas:
- ✅ `clients` - Clientes (com os novos campos!)
- ✅ `obligations` - Prazos fiscais (com campo `amount`)
- ✅ `installments` - Parcelamentos
- ✅ `installment_payments` - Parcelas individuais
- ✅ `notifications` - Notificações
- ✅ `templates` - Templates de obrigações

### Segurança:
- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Políticas de acesso configuradas (cada usuário vê apenas seus dados)

### Performance:
- ✅ Índices criados nas colunas mais consultadas
- ✅ Triggers para atualizar `updated_at` automaticamente

### Novos Campos:
- ✅ `clients.business_activity` - Tipo de atividade (comércio/serviço/ambos)
- ✅ `clients.state` - Estado (UF)
- ✅ `clients.city` - Cidade
- ✅ `obligations.amount` - Valor monetário da obrigação

---

## 🔍 Verificação Rápida

Execute este SQL no SQL Editor para confirmar que tudo foi criado:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar colunas da tabela clients
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

Você deve ver:
- 6 tabelas
- Na tabela `clients`: business_activity, state, city

---

## 🐛 Solução de Problemas

### Erro: "relation already exists"
- **Causa:** Tabela já existe
- **Solução:** Tudo bem! Significa que parte da migration já foi executada

### Erro: "permission denied"
- **Causa:** Falta de permissões
- **Solução:** Certifique-se de estar logado como owner do projeto

### App não conecta ao banco
1. Verifique se o `.env` foi atualizado
2. Reinicie o servidor (`Ctrl+C` e `npm run dev`)
3. Limpe o cache do navegador (Ctrl+Shift+Delete)

---

## 📞 Próximos Passos

Após executar a migration:

1. ✅ Teste criar um cliente
2. ✅ Teste criar um prazo
3. ✅ Teste as ações em massa
4. ✅ Teste o botão de menu (sidebar)

---

## 🎉 Tudo Pronto!

Seu novo Supabase está configurado com:
- ✅ Todas as tabelas necessárias
- ✅ Novos campos implementados
- ✅ Segurança configurada
- ✅ Performance otimizada

**Boa sorte com os testes!** 🚀
