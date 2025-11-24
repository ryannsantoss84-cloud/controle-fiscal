# 🧪 Guia de Testes - Sistema de Controle Fiscal

## ✅ Checklist de Funcionalidades Corrigidas

### 1️⃣ Visualização Lista/Blocos (Prazos e Clientes)

**Como testar:**
1. Acesse a página **Prazos**
2. No canto superior direito, procure pelos botões de visualização (ícones de grade e lista)
3. Clique no ícone de **Lista** (três linhas horizontais)
   - ✅ Deve mostrar os prazos em formato de tabela
4. Clique no ícone de **Blocos** (grade)
   - ✅ Deve mostrar os prazos em cards
5. Repita o mesmo teste na página **Clientes**

**Resultado esperado:**
- Alternância suave entre os modos
- Todos os dados devem aparecer em ambos os formatos
- A preferência deve ser mantida enquanto você navega

---

### 2️⃣ Data de Conclusão (Completed_at)

**Como testar:**
1. Acesse a página **Prazos**
2. Encontre um prazo com status **Pendente**
3. Clique em **Concluir**
   - ✅ Deve aparecer a data de conclusão (data de hoje)
4. Clique em **Reabrir**
   - ✅ A data de conclusão deve DESAPARECER
5. Clique em **Concluir** novamente
   - ✅ Deve aparecer uma NOVA data de conclusão (atualizada)

**Resultado esperado:**
- Ao concluir: mostra "Concluída em DD/MM/AAAA"
- Ao reabrir: a data some completamente
- Ao concluir de novo: mostra a nova data atual

---

### 3️⃣ Formulário de Parcelamento (Sem Duplicatas)

**Como testar:**
1. Acesse a página **Parcelamentos**
2. Clique em **Novo Parcelamento** (botão +)
3. Verifique os campos do formulário:
   - ✅ Nome do Parcelamento
   - ✅ Protocolo
   - ✅ Cliente
   - ✅ Número da Parcela (aparece APENAS UMA VEZ)
   - ✅ Total de Parcelas (aparece APENAS UMA VEZ)
   - ✅ Data de Vencimento
   - ✅ Tratamento de Final de Semana
   - ✅ Status
   - ❌ NÃO deve ter campo "Valor da Parcela"
   - ❌ NÃO deve ter campos duplicados

**Resultado esperado:**
- Formulário limpo, sem duplicatas
- Sem campo de valor
- Todos os campos funcionando normalmente

---

### 4️⃣ Geração Mensal de Obrigações (Automação)

**⚠️ IMPORTANTE: Antes de testar, você precisa executar o SQL no Supabase!**

**Passo 1 - Aplicar o SQL:**
1. Abra o arquivo `CORRIGIR_AUTOMACAO.sql` na raiz do projeto
2. Copie TODO o conteúdo
3. Acesse o [Painel do Supabase](https://supabase.com/dashboard)
4. Vá em **SQL Editor**
5. Cole o código e clique em **Run**
6. ✅ Deve aparecer "Success. No rows returned"

**Passo 2 - Testar a Automação:**
1. Acesse a página **Prazos**
2. Clique no botão **Gerar Mensal** (ícone de calendário)
3. Selecione o mês desejado
4. Clique em **Gerar**
   - ✅ Deve aparecer mensagem de sucesso
   - ✅ Deve mostrar quantos clientes foram processados
   - ✅ Deve mostrar quantas obrigações foram criadas

**Passo 3 - Testar a Lógica de Recuperação:**
1. Delete manualmente um prazo que foi criado pela automação
2. Rode a automação novamente para o mesmo mês
   - ✅ O prazo deletado deve ser RECRIADO
3. Marque um prazo como **Concluído**
4. Rode a automação novamente
   - ✅ O prazo concluído NÃO deve ser duplicado (fica como está)

**Resultado esperado:**
- Automação funciona sem erros
- Prazos deletados são recuperados
- Prazos existentes (mesmo concluídos) não são duplicados

---

## 🐛 Se Algo Não Funcionar

### Problema: Botões de Lista/Blocos não aparecem
**Solução:** 
- Verifique se o servidor está rodando (`npm run dev`)
- Recarregue a página (Ctrl + R)

### Problema: Data de conclusão não limpa ao reabrir
**Solução:**
- Limpe o cache do navegador
- Verifique se há erros no console (F12)

### Problema: Erro "function not found" na automação
**Solução:**
- Você ainda não executou o SQL no Supabase
- Siga o "Passo 1 - Aplicar o SQL" acima

### Problema: Formulário de parcelamento ainda tem duplicatas
**Solução:**
- Recarregue a página completamente (Ctrl + Shift + R)
- Verifique se o arquivo foi salvo corretamente

---

## 📊 Resumo das Correções

| Funcionalidade | Status | Como Verificar |
|---------------|--------|----------------|
| Lista/Blocos em Prazos | ✅ | Botões no canto superior direito |
| Lista/Blocos em Clientes | ✅ | Botões no canto superior direito |
| Data de Conclusão | ✅ | Concluir → Reabrir → Concluir |
| Formulário Parcelamento | ✅ | Abrir formulário e contar campos |
| Automação Mensal | ⚠️ | Precisa executar SQL primeiro |

---

## 🎯 Teste Rápido (5 minutos)

1. ✅ Abra **Prazos** → Alterne entre Lista e Blocos
2. ✅ Abra **Clientes** → Alterne entre Lista e Blocos
3. ✅ Em **Prazos** → Concluir um item → Reabrir → Verificar se a data sumiu
4. ✅ Abra **Parcelamentos** → Novo → Contar se os campos estão corretos
5. ⚠️ Execute o SQL no Supabase → Teste **Gerar Mensal**

**Se todos os 5 itens funcionarem, está tudo OK! 🎉**
