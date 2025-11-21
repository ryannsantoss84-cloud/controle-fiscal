---
description: Guia de Ações em Massa para Prazos Fiscais
---

# Ações em Massa - Prazos Fiscais

## ✅ Funcionalidades Implementadas

### 1. **Estado de Seleção**
- Gerenciamento de seleção usando `Set<string>` para performance otimizada
- Função `toggleSelection(id)` para selecionar/desselecionar itens individuais
- Função `toggleSelectAll()` para selecionar/desselecionar todos os prazos filtrados

### 2. **Checkbox nos Cards**
- Cada `DeadlineCard` possui um checkbox no canto superior esquerdo
- O checkbox não interfere com o clique no card (usa `stopPropagation`)
- Visual integrado ao design do card

### 3. **Barra de Ações em Massa Aprimorada**

#### Design Visual:
- **Gradiente de fundo**: `from-primary/10 via-primary/5 to-primary/10`
- **Borda destacada**: `border-2 border-primary/30`
- **Sombra suave**: `shadow-lg`
- **Animação de entrada**: `animate-in slide-in-from-top-2 duration-300`
- **Layout responsivo**: Adapta-se para mobile e desktop

#### Funcionalidades:
- **Contador de seleção**: Mostra quantos prazos estão selecionados
- **Checkbox "Selecionar Todos"**: Permite selecionar/desselecionar todos de uma vez
- **Texto descritivo**: "Escolha uma ação para aplicar em massa"

### 4. **Ações Disponíveis**

#### 🔵 Marcar como Pendente
- Botão com borda azul
- Muda o status de todos os selecionados para "pending"
- Limpa a data de conclusão

#### 🟡 Marcar como Em Andamento
- Botão com borda amarela
- Muda o status de todos os selecionados para "in_progress"
- Útil para iniciar múltiplas tarefas simultaneamente

#### 🟢 Concluir
- Botão verde sólido (ação principal)
- Muda o status para "completed"
- Define `completed_at` com a data/hora atual
- Ideal para finalizar múltiplas obrigações de uma vez

#### 🔴 Excluir
- Botão vermelho destrutivo
- Solicita confirmação antes de excluir
- Remove permanentemente os prazos selecionados

### 5. **Feedback ao Usuário**

#### Mensagens de Sucesso:
- Singular/Plural correto: "1 prazo concluído" vs "3 prazos concluídos"
- Mensagens específicas por ação:
  - "X prazos marcados como pendentes"
  - "X prazos marcados como em andamento"
  - "X prazos concluídos"
  - "X prazos excluídos"

#### Confirmações:
- Diálogo de confirmação para exclusão em massa
- Previne exclusões acidentais

## 🎨 Melhorias de UI/UX

1. **Cores Semânticas**:
   - Azul para pendente (neutro)
   - Amarelo para em andamento (atenção)
   - Verde para concluído (sucesso)
   - Vermelho para excluir (perigo)

2. **Responsividade**:
   - Layout em coluna no mobile
   - Layout em linha no desktop
   - Botões com wrap automático

3. **Acessibilidade**:
   - Ícones em todos os botões
   - Labels descritivos
   - Contraste adequado

## 🔧 Como Usar

### Seleção Individual:
1. Navegue até a página "Prazos Fiscais"
2. Clique no checkbox de qualquer prazo
3. A barra de ações aparecerá automaticamente

### Seleção Múltipla:
1. Clique em vários checkboxes
2. Ou use o checkbox "Selecionar Todos" na barra

### Aplicar Ação:
1. Com prazos selecionados, clique no botão da ação desejada
2. Confirme se necessário (apenas para exclusão)
3. Aguarde a confirmação de sucesso

### Desselecionar:
- Clique novamente nos checkboxes individuais
- Ou use "Selecionar Todos" para desmarcar tudo

## 📝 Notas Técnicas

- **Performance**: Usa `Set` para operações O(1) de busca
- **Otimização**: Limpa seleção após cada ação
- **Integração**: Usa hooks existentes (`useDeadlines`, `useToast`)
- **Type Safety**: TypeScript com tipos adequados
- **Mutações**: Operações assíncronas com feedback visual

## 🐛 Correções Realizadas

1. Adicionada propriedade `amount?: number` à interface `Deadline`
2. Corrigida função de exclusão em massa com contagem correta
3. Melhoradas mensagens de toast com singular/plural correto
4. Unificadas funções de mudança de status em `handleBulkStatusChange`
