# Guia de Uso - Componentes Reutilizáveis

Este guia documenta os componentes extraídos durante a refatoração e como utilizá-los em outras partes do sistema.

---

## 📁 Analytics Components

Localização: `src/pages/Analytics/components/`

### ProgressRing

Anel de progresso circular animado.

**Props:**
```typescript
interface ProgressRingProps {
  percent: number;           // 0-100
  size?: number;             // default: 120px
  strokeWidth?: number;      // default: 12px
  color?: string;            // hex color
  label: string;             // Label abaixo do anel
  value: string | number;    // Valor exibido no centro
}
```

**Exemplo:**
```tsx
import { ProgressRing } from '@/pages/Analytics/components';

<ProgressRing
  percent={75}
  color="#10b981"
  label="Tarefas Concluídas"
  value="30/40"
  size={140}
  strokeWidth={14}
/>
```

---

### StatCard

Card de estatística com ícone, gradiente e badge de mudança.

**Props:**
```typescript
interface StatCardProps {
  icon: LucideIcon;          // Ícone do lucide-react
  label: string;             // Título do card
  value: string | number;    // Valor principal
  change?: number;           // % de mudança (opcional)
  color: string;             // Cor hex
  subtitle?: string;         // Texto secundário (opcional)
}
```

**Exemplo:**
```tsx
import { StatCard } from '@/pages/Analytics/components';
import { Target, Clock, AlertCircle } from 'lucide-react';

<div className="grid grid-cols-3 gap-4">
  <StatCard
    icon={Target}
    label="Taxa de Conclusão"
    value="85%"
    change={12}
    color="#10b981"
    subtitle="Acima da meta"
  />
  
  <StatCard
    icon={Clock}
    label="Média de Tempo"
    value="2.5h"
    color="#3b82f6"
    subtitle="Por tarefa"
  />
  
  <StatCard
    icon={AlertCircle}
    label="Atrasadas"
    value={5}
    change={-20}
    color="#ef4444"
  />
</div>
```

---

### HeatmapCell

Célula colorida para heatmap com cor baseada em intensidade.

**Props:**
```typescript
interface HeatmapCellProps {
  value: number;    // Valor da célula
  max: number;      // Valor máximo (para calcular %)
  label: string;    // Label do tooltip
}
```

**Exemplo:**
```tsx
import { HeatmapCell } from '@/pages/Analytics/components';

<div className="grid grid-cols-7 gap-2">
  {daysOfWeek.map((day, index) => (
    <HeatmapCell
      key={index}
      value={activity[index]}
      max={maxActivity}
      label={day}
    />
  ))}
</div>
```

**Cores automáticas:**
- `> 70%` → Verde (#10b981)
- `40-70%` → Laranja (#f59e0b)
- `0-40%` → Azul (#3b82f6)
- `0%` → Cinza (#e5e7eb)

---

### HealthBadge

Badge indicando saúde/status do cliente.

**Props:**
```typescript
type ClientHealth = 'excellent' | 'good' | 'warning' | 'critical';

interface HealthBadgeProps {
  health: ClientHealth;
}
```

**Exemplo:**
```tsx
import { HealthBadge } from '@/pages/Analytics/components';

<HealthBadge health="excellent" /> // 🏆 Excelente (verde)
<HealthBadge health="good" />      // ✅ Bom (azul)
<HealthBadge health="warning" />   // ⚠️ Atenção (laranja)
<HealthBadge health="critical" />  // 🚨 Crítico (vermelho)
```

---

## 📁 Settings Components

Localização: `src/pages/Settings/components/`

### CompanyTab

Formulário de dados da empresa.

**Props:**
```typescript
interface SettingsTabProps {
  settings: SettingsData;
  onChange: (partial: Partial<SettingsData>) => void;
}
```

**Exemplo:**
```tsx
import { CompanyTab } from '@/pages/Settings/components';

<CompanyTab
  settings={settings}
  onChange={handleSettingsChange}
/>
```

---

### AppearanceTab

Preferências visuais (tema, densidade).

**Props:**
```typescript
interface AppearanceTabProps extends SettingsTabProps {
  theme: string;
  setTheme: (theme: string) => void;
}
```

**Exemplo:**
```tsx
import { AppearanceTab } from '@/pages/Settings/components';
import { useTheme } from '@/components/theme-provider';

const { theme, setTheme } = useTheme();

<AppearanceTab
  settings={settings}
  onChange={handleSettingsChange}
  theme={theme}
  setTheme={setTheme}
/>
```

---

### AutomationTab

Regras de automação (fim de semana, recorrência).

**Exemplo:**
```tsx
import { AutomationTab } from '@/pages/Settings/components';

<AutomationTab
  settings={settings}
  onChange={handleSettingsChange}
/>
```

---

## 📁 Shared Components

Localização: `src/components/shared/`

### CardSkeleton

Skeleton loader que simula um StatCard.

**Exemplo:**
```tsx
import { CardSkeleton } from '@/components/shared/CardSkeleton';

{isLoading ? (
  <div className="grid grid-cols-4 gap-4">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
) : (
  <StatsGrid data={stats} />
)}
```

---

### ListSkeleton

Skeleton para listas.

**Props:**
- `items?: number` - Quantidade de itens (default: 3)

**Exemplo:**
```tsx
import { ListSkeleton } from '@/components/shared/CardSkeleton';

{isLoading ? <ListSkeleton items={5} /> : <ClientList data={clients} />}
```

---

### TableSkeleton

Skeleton para tabelas.

**Props:**
- `rows?: number` - Quantidade de linhas (default: 5)

**Exemplo:**
```tsx
import { TableSkeleton } from '@/components/shared/CardSkeleton';

{isLoading ? <TableSkeleton rows={10} /> : <DataTable data={data} />}
```

---

## 🎯 Boas Práticas

### 1. Sempre use tipos
```tsx
// ❌ Evite
const MyComponent = (props: any) => { ... }

// ✅ Correto
interface MyComponentProps {
  value: number;
  onChange: (value: number) => void;
}

const MyComponent = ({ value, onChange }: MyComponentProps) => { ... }
```

### 2. Memoize componentes pesados
```tsx
import React from 'react';

export const HeavyComponent = React.memo(({ data }: Props) => {
  // Só re-renderiza se 'data' mudar
  return <ExpensiveRender data={data} />;
});
```

### 3. Use useMemo para cálculos
```tsx
import { useMemo } from 'react';

const ExpensiveCalc = ({ items }: Props) => {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]); // Só recalcula se 'items' mudar

  return <div>Total: {total}</div>;
};
```

### 4. Skeleton loaders
```tsx
// Sempre use skeleton que mantém a estrutura
{isLoading ? <CardSkeleton /> : <StatCard {...data} />}

// Evite spinners genéricos em grids
{isLoading ? <Spinner /> : <Grid />} // ❌
```

---

## 📚 Importações

### Barrel Exports
Use os arquivos `index.ts` para imports limpos:

```tsx
// ✅ Recomendado
import { ProgressRing, StatCard } from '@/pages/Analytics/components';

// ❌ Evite
import { ProgressRing } from '@/pages/Analytics/components/ProgressRing';
import { StatCard } from '@/pages/Analytics/components/StatCard';
```

---

## 🔍 Debugging

### React DevTools
Os componentes memoizados aparecem com `Memo(ComponentName)`.

### Performance
Use a aba Profiler do React DevTools para verificar re-renders.

---

**Última atualização:** 10/12/2025
