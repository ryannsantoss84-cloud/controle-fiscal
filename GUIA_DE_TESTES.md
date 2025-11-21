# 🧪 Guia de Testes - Funcionalidades Implementadas

## 🌐 Acesso ao Sistema
**URL:** http://127.0.0.1:8080

O servidor está rodando e pronto para testes!

---

## ✅ Teste 1: Botão de Menu (Sidebar Toggle)

### Objetivo:
Verificar se o botão de menu permite abrir e fechar a sidebar sem problemas.

### Passos:
1. Abra o navegador e acesse `http://127.0.0.1:8080`
2. Localize o **botão de menu** (ícone ☰) no **canto superior esquerdo** da barra superior
3. Clique no botão para **fechar a sidebar**
   - ✅ A sidebar deve colapsar (ficar estreita)
   - ✅ O botão ☰ continua visível
4. Clique novamente no botão ☰ para **reabrir a sidebar**
   - ✅ A sidebar deve expandir novamente
   - ✅ Os nomes dos menus devem aparecer

### Resultado Esperado:
- ✅ Botão sempre visível na barra superior
- ✅ Sidebar abre e fecha suavemente
- ✅ Sem problemas para reabrir após fechar

---

## ✅ Teste 2: Formulário de Clientes - Novos Campos

### Objetivo:
Verificar os 3 novos campos: Tipo de Atividade, Estado e Cidade.

### Passos:
1. No menu lateral, clique em **"Clientes"**
2. Clique no botão **"Novo Cliente"** (canto superior direito)
3. O formulário deve abrir com os seguintes campos:

#### Campos Existentes:
- Nome *
- CNPJ *
- Regime Tributário *
- Email
- Telefone

#### ✨ NOVOS CAMPOS (verifique):

**a) Tipo de Atividade *** (logo após Regime Tributário)
- Deve ser um dropdown com 3 opções:
  - ✅ Comércio
  - ✅ Serviço
  - ✅ Comércio e Serviço

**b) Estado *** e **Cidade *** (em duas colunas lado a lado)
- **Estado:** Dropdown com todos os estados brasileiros
  - Formato: "SP - São Paulo", "RJ - Rio de Janeiro", etc.
- **Cidade:** Campo de texto livre
  - Inicialmente **desabilitado** (cinza)

### Teste de Interação Estado → Cidade:
1. Selecione um estado (ex: "SP - São Paulo")
   - ✅ O campo Cidade deve ser **habilitado**
2. Digite o nome de uma cidade (ex: "Campinas")
   - ✅ Deve aceitar texto livre
3. Mude o estado para outro (ex: "RJ - Rio de Janeiro")
   - ✅ O campo Cidade deve ser **limpo automaticamente**

### Teste de Validação:
1. Tente salvar o formulário sem preencher os novos campos
   - ✅ Deve mostrar mensagens de erro:
     - "Selecione o tipo de atividade"
     - "Estado é obrigatório"
     - "Cidade é obrigatória"

### Resultado Esperado:
- ✅ 3 novos campos visíveis
- ✅ Cidade desabilita/habilita conforme estado
- ✅ Validação funcionando
- ✅ Formulário maior (max-w-2xl) para acomodar campos

---

## ✅ Teste 3: Ações em Massa nos Prazos

### Objetivo:
Verificar a funcionalidade de seleção e ações em massa.

### Passos:
1. No menu lateral, clique em **"Prazos"** ou **"Prazos Fiscais"**
2. Verifique se há prazos na lista
   - Se não houver, crie alguns prazos primeiro

### Teste de Seleção:
1. Localize os **checkboxes** no canto superior esquerdo de cada card de prazo
2. Clique no checkbox de **1 prazo**
   - ✅ Uma **barra de ações em massa** deve aparecer no topo
   - ✅ Deve mostrar: "1 prazo selecionado"
3. Clique no checkbox de **mais 2 prazos** (total de 3)
   - ✅ A barra deve atualizar: "3 prazos selecionados"

### Verificar a Barra de Ações em Massa:

A barra deve ter:
- **Visual:**
  - ✅ Gradiente de fundo (azul claro)
  - ✅ Borda destacada
  - ✅ Sombra suave
  - ✅ Animação de entrada suave

- **Conteúdo à esquerda:**
  - ✅ Checkbox "Selecionar Todos"
  - ✅ Texto: "X prazos selecionados"
  - ✅ Subtexto: "Escolha uma ação para aplicar em massa"

- **Botões à direita (4 opções):**
  1. 🔵 **Marcar Pendente** (borda azul)
  2. 🟡 **Em Andamento** (borda amarela)
  3. 🟢 **Concluir** (botão verde sólido)
  4. 🔴 **Excluir** (botão vermelho)

### Teste de Ações:
1. Com prazos selecionados, clique em **"Concluir"**
   - ✅ Deve mostrar toast: "X prazos concluídos com sucesso!"
   - ✅ Status dos prazos deve mudar para "Concluída"
   - ✅ Seleção deve ser limpa

2. Selecione outros prazos e clique em **"Excluir"**
   - ✅ Deve mostrar confirmação: "Tem certeza que deseja excluir X prazos?"
   - ✅ Ao confirmar, deve excluir e mostrar toast

### Teste "Selecionar Todos":
1. Clique no checkbox **"Selecionar Todos"** na barra
   - ✅ Todos os prazos visíveis devem ser selecionados
2. Clique novamente
   - ✅ Todos devem ser desmarcados

### Resultado Esperado:
- ✅ Checkboxes visíveis em todos os cards
- ✅ Barra aparece/desaparece conforme seleção
- ✅ 4 botões de ação funcionando
- ✅ Mensagens de feedback corretas
- ✅ Design moderno e responsivo

---

## 📋 Checklist Geral

### Sidebar Toggle:
- [ ] Botão ☰ visível na barra superior
- [ ] Sidebar fecha ao clicar
- [ ] Sidebar reabre ao clicar novamente
- [ ] Transições suaves

### Formulário de Clientes:
- [ ] Campo "Tipo de Atividade" presente
- [ ] Campo "Estado" com 27 estados
- [ ] Campo "Cidade" como input de texto
- [ ] Cidade desabilita sem estado
- [ ] Cidade limpa ao mudar estado
- [ ] Validação dos 3 campos funcionando

### Ações em Massa:
- [ ] Checkboxes nos cards de prazos
- [ ] Barra aparece ao selecionar
- [ ] 4 botões de ação visíveis
- [ ] Ações funcionam corretamente
- [ ] Mensagens de feedback adequadas
- [ ] Selecionar todos funciona

---

## 🐛 Problemas Conhecidos Resolvidos

✅ **Sidebar não reabria:** Resolvido com botão na TopBar
✅ **Cidade era dropdown:** Alterado para input de texto livre
✅ **Ações em massa básicas:** Expandido para 4 opções de status

---

## 💡 Dicas de Teste

1. **Teste em diferentes resoluções:** A barra de ações em massa é responsiva
2. **Teste com 1 e múltiplos itens:** Mensagens mudam (singular/plural)
3. **Teste validação:** Tente salvar formulários incompletos
4. **Teste fluxo completo:** Crie cliente → Crie prazo → Ações em massa

---

## 📞 Suporte

Se encontrar algum problema durante os testes, anote:
- Qual funcionalidade
- O que esperava acontecer
- O que realmente aconteceu
- Screenshots se possível

Bons testes! 🚀
