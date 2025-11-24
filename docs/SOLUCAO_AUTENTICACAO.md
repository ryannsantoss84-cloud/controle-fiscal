# 🔧 SOLUÇÃO: Erro "Usuário não autenticado"

## 🎯 O Problema

Seu sistema não tem tela de login ainda, mas o Supabase exige autenticação por padrão.

## ✅ SOLUÇÃO APLICADA

Fiz 2 alterações para você poder usar o sistema SEM LOGIN (temporariamente):

### 1️⃣ Código Atualizado
- ✅ O sistema agora usa um `user_id` padrão se você não estiver logado
- ✅ Não vai mais dar erro "Usuário não autenticado"

### 2️⃣ Desabilitar RLS no Banco

**Execute este script no Supabase:**

1. Abra: `DESABILITAR_RLS_TEMP.sql`
2. Copie tudo (Ctrl + A → Ctrl + C)
3. Supabase → SQL Editor
4. Cole e Execute (Run)

---

## 🚀 TESTE AGORA:

1. **Recarregue a página** (Ctrl + Shift + R)
2. **Tente criar um cliente**
3. **Deve funcionar!** ✅

---

## ⚠️ IMPORTANTE - Segurança

**Com RLS desabilitado:**
- ❌ Qualquer pessoa pode acessar/modificar os dados
- ❌ Não há separação por usuário
- ⚠️ Use apenas para DESENVOLVIMENTO/TESTE

**Quando for colocar em produção:**
- ✅ Implemente sistema de login
- ✅ Reabilite o RLS
- ✅ Use as políticas de segurança corretas

---

## 🔐 Quer Adicionar Login Agora?

Se quiser, posso criar um sistema de login simples com:
- Tela de Login/Cadastro
- Autenticação do Supabase
- RLS habilitado corretamente

**Me avise se quer que eu crie isso!** 😊

---

## 📝 Resumo do que fazer:

1. ✅ Execute `DESABILITAR_RLS_TEMP.sql` no Supabase
2. ✅ Recarregue a página do sistema
3. ✅ Teste criar um cliente
4. ✅ Funciona! 🎉

---

**Depois de executar o script SQL, me avise se funcionou!** 🚀
