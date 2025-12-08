import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Filter,
    X,
    Search,
    CalendarIcon,
    RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

export interface DeadlineFilters {
    search: string;
    status: string;
    type: string;
    sphere: string;
    clientId: string;
    recurrence: string;
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    responsible: string;
}

export interface Client {
    id: string;
    name: string;
}

interface AdvancedFiltersProps {
    filters: DeadlineFilters;
    onFiltersChange: (filters: DeadlineFilters) => void;
    clients: Client[];
    responsibles?: string[];
}

// ============================================================================
// VALORES PADRÃO
// ============================================================================

export const defaultFilters: DeadlineFilters = {
    search: '',
    status: 'all',
    type: 'all',
    sphere: 'all',
    clientId: 'all',
    recurrence: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    responsible: 'all',
};

// ============================================================================
// OPÇÕES DE FILTRO
// ============================================================================

const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Andamento' },
    { value: 'completed', label: 'Concluída' },
    { value: 'overdue', label: 'Atrasada' },
];

const typeOptions = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: 'tax', label: 'Imposto' },
    { value: 'obligation', label: 'Obrigação' },
];

const sphereOptions = [
    { value: 'all', label: 'Todas as Esferas' },
    { value: 'federal', label: 'Federal' },
    { value: 'state', label: 'Estadual' },
    { value: 'municipal', label: 'Municipal' },
];

const recurrenceOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'none', label: 'Não Recorrente' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'semiannual', label: 'Semestral' },
    { value: 'annual', label: 'Anual' },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AdvancedFilters({
    filters,
    onFiltersChange,
    clients,
    responsibles = [],
}: AdvancedFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Contar filtros ativos
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status !== 'all') count++;
        if (filters.type !== 'all') count++;
        if (filters.sphere !== 'all') count++;
        if (filters.clientId !== 'all') count++;
        if (filters.recurrence !== 'all') count++;
        if (filters.dateFrom) count++;
        if (filters.dateTo) count++;
        if (filters.responsible !== 'all') count++;
        return count;
    }, [filters]);

    // Update handler
    const updateFilter = useCallback(
        <K extends keyof DeadlineFilters>(key: K, value: DeadlineFilters[K]) => {
            onFiltersChange({ ...filters, [key]: value });
        },
        [filters, onFiltersChange]
    );

    // Reset handler
    const resetFilters = useCallback(() => {
        onFiltersChange(defaultFilters);
    }, [onFiltersChange]);

    // Responsáveis únicos
    const uniqueResponsibles = useMemo(() => {
        return [...new Set(responsibles.filter(Boolean))].sort();
    }, [responsibles]);

    return (
        <div className="space-y-4">
            {/* Barra de busca e botão de filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título, descrição ou cliente..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pl-10"
                        aria-label="Buscar prazos"
                    />
                    {filters.search && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => updateFilter('search', '')}
                            aria-label="Limpar busca"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex gap-2">
                    {/* Filtros rápidos de status */}
                    <Select
                        value={filters.status}
                        onValueChange={(value) => updateFilter('status', value)}
                    >
                        <SelectTrigger className="w-[160px]" aria-label="Filtrar por status">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Botão para expandir filtros avançados */}
                    <Button
                        variant={isExpanded ? 'secondary' : 'outline'}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="gap-2"
                        aria-expanded={isExpanded}
                        aria-label="Mostrar filtros avançados"
                    >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>

                    {/* Botão de limpar */}
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetFilters}
                            aria-label="Limpar todos os filtros"
                            title="Limpar filtros"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Painel de filtros avançados */}
            {isExpanded && (
                <Card className="animate-in slide-in-from-top-2 duration-200">
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Tipo */}
                            <div className="space-y-2">
                                <Label htmlFor="filter-type">Tipo</Label>
                                <Select
                                    value={filters.type}
                                    onValueChange={(value) => updateFilter('type', value)}
                                >
                                    <SelectTrigger id="filter-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Esfera */}
                            <div className="space-y-2">
                                <Label htmlFor="filter-sphere">Esfera</Label>
                                <Select
                                    value={filters.sphere}
                                    onValueChange={(value) => updateFilter('sphere', value)}
                                >
                                    <SelectTrigger id="filter-sphere">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sphereOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Cliente */}
                            <div className="space-y-2">
                                <Label htmlFor="filter-client">Cliente</Label>
                                <Select
                                    value={filters.clientId}
                                    onValueChange={(value) => updateFilter('clientId', value)}
                                >
                                    <SelectTrigger id="filter-client">
                                        <SelectValue placeholder="Selecionar cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Clientes</SelectItem>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Recorrência */}
                            <div className="space-y-2">
                                <Label htmlFor="filter-recurrence">Recorrência</Label>
                                <Select
                                    value={filters.recurrence}
                                    onValueChange={(value) => updateFilter('recurrence', value)}
                                >
                                    <SelectTrigger id="filter-recurrence">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recurrenceOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Data Início */}
                            <div className="space-y-2">
                                <Label>Data Início</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !filters.dateFrom && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateFrom
                                                ? format(filters.dateFrom, 'dd/MM/yyyy', { locale: ptBR })
                                                : 'Selecionar data'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateFrom}
                                            onSelect={(date) => updateFilter('dateFrom', date)}
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Data Fim */}
                            <div className="space-y-2">
                                <Label>Data Fim</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !filters.dateTo && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateTo
                                                ? format(filters.dateTo, 'dd/MM/yyyy', { locale: ptBR })
                                                : 'Selecionar data'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateTo}
                                            onSelect={(date) => updateFilter('dateTo', date)}
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Responsável */}
                            {uniqueResponsibles.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="filter-responsible">Responsável</Label>
                                    <Select
                                        value={filters.responsible}
                                        onValueChange={(value) => updateFilter('responsible', value)}
                                    >
                                        <SelectTrigger id="filter-responsible">
                                            <SelectValue placeholder="Selecionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            {uniqueResponsibles.map((resp) => (
                                                <SelectItem key={resp} value={resp}>
                                                    {resp}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Tags de filtros ativos */}
                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                                {filters.search && (
                                    <Badge variant="secondary" className="gap-1">
                                        Busca: {filters.search}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => updateFilter('search', '')}
                                        />
                                    </Badge>
                                )}
                                {filters.status !== 'all' && (
                                    <Badge variant="secondary" className="gap-1">
                                        {statusOptions.find((o) => o.value === filters.status)?.label}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => updateFilter('status', 'all')}
                                        />
                                    </Badge>
                                )}
                                {filters.type !== 'all' && (
                                    <Badge variant="secondary" className="gap-1">
                                        {typeOptions.find((o) => o.value === filters.type)?.label}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => updateFilter('type', 'all')}
                                        />
                                    </Badge>
                                )}
                                {filters.sphere !== 'all' && (
                                    <Badge variant="secondary" className="gap-1">
                                        {sphereOptions.find((o) => o.value === filters.sphere)?.label}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => updateFilter('sphere', 'all')}
                                        />
                                    </Badge>
                                )}
                                {filters.dateFrom && (
                                    <Badge variant="secondary" className="gap-1">
                                        De: {format(filters.dateFrom, 'dd/MM/yy')}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => updateFilter('dateFrom', undefined)}
                                        />
                                    </Badge>
                                )}
                                {filters.dateTo && (
                                    <Badge variant="secondary" className="gap-1">
                                        Até: {format(filters.dateTo, 'dd/MM/yy')}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => updateFilter('dateTo', undefined)}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ============================================================================
// HOOK PARA FILTRAR DADOS
// ============================================================================

export interface DeadlineItem {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    type?: string;
    sphere?: string;
    client_id?: string;
    recurrence?: string;
    due_date: string;
    responsible?: string | null;
    clients?: { id: string; name: string } | null;
}

export function useDeadlineFilters(items: DeadlineItem[], filters: DeadlineFilters) {
    return useMemo(() => {
        return items.filter((item) => {
            // Busca textual
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    item.title.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower) ||
                    item.clients?.name.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Status
            if (filters.status !== 'all' && item.status !== filters.status) {
                return false;
            }

            // Tipo
            if (filters.type !== 'all' && item.type !== filters.type) {
                return false;
            }

            // Esfera
            if (filters.sphere !== 'all' && item.sphere !== filters.sphere) {
                return false;
            }

            // Cliente
            if (filters.clientId !== 'all' && item.client_id !== filters.clientId) {
                return false;
            }

            // Recorrência
            if (filters.recurrence !== 'all' && item.recurrence !== filters.recurrence) {
                return false;
            }

            // Data início
            if (filters.dateFrom) {
                const itemDate = new Date(item.due_date);
                if (itemDate < filters.dateFrom) return false;
            }

            // Data fim
            if (filters.dateTo) {
                const itemDate = new Date(item.due_date);
                if (itemDate > filters.dateTo) return false;
            }

            // Responsável
            if (filters.responsible !== 'all' && item.responsible !== filters.responsible) {
                return false;
            }

            return true;
        });
    }, [items, filters]);
}
