import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, addMonths, subMonths, setMonth, setYear, getYear, getMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MonthPickerProps {
    date?: Date
    setDate: (date: Date | undefined) => void
    className?: string
}

export function MonthPicker({ date, setDate, className }: MonthPickerProps) {
    const [year, setYear] = React.useState(date ? getYear(date) : getYear(new Date()))
    const [open, setOpen] = React.useState(false)

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(year, monthIndex, 1)
        setDate(newDate)
        setOpen(false)
    }

    const nextYear = () => setYear(year + 1)
    const prevYear = () => setYear(year - 1)

    const clearDate = (e: React.MouseEvent) => {
        e.stopPropagation()
        setDate(undefined)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[200px] justify-start text-left font-normal relative",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione o mês</span>}
                    {date && (
                        <div
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full cursor-pointer"
                            onClick={clearDate}
                        >
                            <X className="h-3 w-3 text-muted-foreground" />
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
                <div className="flex items-center justify-between p-2 border-b">
                    <Button variant="ghost" size="icon" onClick={prevYear}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="font-semibold">{year}</div>
                    <Button variant="ghost" size="icon" onClick={nextYear}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 p-2">
                    {months.map((month, index) => (
                        <Button
                            key={month}
                            variant={date && getMonth(date) === index && getYear(date) === year ? "default" : "ghost"}
                            className="h-8 text-xs"
                            onClick={() => handleMonthSelect(index)}
                        >
                            {month.substring(0, 3)}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
