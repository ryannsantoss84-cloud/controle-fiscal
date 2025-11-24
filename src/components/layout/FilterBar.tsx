
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List as ListIcon } from "lucide-react";

interface FilterBarProps {
    children: ReactNode;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
    className?: string;
}

export function FilterBar({ children, viewMode, onViewModeChange, className }: FilterBarProps) {
    return (
        <div className={`flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm items-center animate-in fade-in duration-500 delay-100 ${className}`}>
            {children}

            {viewMode && onViewModeChange && (
                <div className="flex items-center border rounded-md bg-muted/50 p-1 ml-auto sm:ml-0">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewModeChange('grid')}
                        title="Visualização em Grade"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewModeChange('list')}
                        title="Visualização em Lista"
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
