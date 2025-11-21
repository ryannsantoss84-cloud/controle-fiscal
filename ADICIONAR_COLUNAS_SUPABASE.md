# 🔧 Como Adicionar as Colunas no Supabase

## Opção 1: Via Dashboard do Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Cole o SQL abaixo e clique em **Run**

```sql
-- Add business_activity, state, and city columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS business_activity TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add check constraint for valid business activities
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'clients_business_activity_check'
  ) THEN
    ALTER TABLE public.clients 
    ADD CONSTRAINT clients_business_activity_check 
    CHECK (business_activity IN ('commerce', 'service', 'both'));
  END IF;
END $$;

-- Add comments to columns
COMMENT ON COLUMN public.clients.business_activity IS 'Type of business activity: commerce, service, or both';
COMMENT ON COLUMN public.clients.state IS 'Brazilian state (UF) where the client is located';
COMMENT ON COLUMN public.clients.city IS 'City where the client is located';
```

## Opção 2: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
npx supabase db push
```

## Opção 3: Manualmente via Table Editor

1. Acesse o **Table Editor** no Supabase
2. Selecione a tabela **clients**
3. Clique em **Add Column** para cada campo:

### Campo 1: business_activity
- **Name:** business_activity
- **Type:** text
- **Default value:** (deixe vazio)
- **Is nullable:** ✅ Yes
- **Is unique:** ❌ No

### Campo 2: state
- **Name:** state
- **Type:** text
- **Default value:** (deixe vazio)
- **Is nullable:** ✅ Yes
- **Is unique:** ❌ No

### Campo 3: city
- **Name:** city
- **Type:** text
- **Default value:** (deixe vazio)
- **Is nullable:** ✅ Yes
- **Is unique:** ❌ No

---

## ✅ Verificação

Após executar, verifique se as colunas foram criadas:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

Você deve ver as colunas:
- business_activity
- state
- city

---

## 🔄 Após Adicionar as Colunas

1. **Recarregue a página** do aplicativo (F5)
2. Tente criar um novo cliente
3. Os campos devem funcionar normalmente

---

## 🐛 Se ainda der erro

1. Limpe o cache do navegador (Ctrl + Shift + Delete)
2. Reinicie o servidor de desenvolvimento:
   ```bash
   # Pare o servidor (Ctrl + C no terminal)
   npm run dev
   ```
3. Recarregue a página

---

## 📞 Link Rápido

Acesse diretamente o SQL Editor do seu projeto:
https://supabase.com/dashboard/project/ccicksnqlhbeagfocsuv/sql/new
