import { Bell, Calendar, AlertTriangle, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function NotificationBell() {
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string, itemType: string) => {
    if (type === "danger") return <AlertCircle className="h-5 w-5 text-destructive" />;
    if (type === "warning") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (itemType === "installment") return <DollarSign className="h-5 w-5 text-primary" />;
    return <Calendar className="h-5 w-5 text-primary" />;
  };

  const getBgColor = (type: string) => {
    if (type === "danger") return "bg-destructive/5 border-destructive/20";
    if (type === "warning") return "bg-amber-500/5 border-amber-500/20";
    return "bg-primary/5 border-primary/20";
  };

  const handleNotificationClick = (itemType: string) => {
    if (itemType === "tax") {
      navigate("/taxes");
    } else if (itemType === "obligation") {
      navigate("/obligations");
    } else {
      navigate("/installments");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 shadow-xl border-border/50" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Notificações</h3>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs font-normal px-2 h-6">
              {unreadCount} novas
            </Badge>
          )}
        </div>

        <ScrollArea className="h-[450px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm text-foreground">Tudo limpo por aqui!</p>
                <p className="text-xs text-muted-foreground">Você não tem novas notificações no momento.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.itemType)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-all group relative ${getBgColor(notification.type)}`}
                >
                  <div className="flex gap-4">
                    <div className={`mt-0.5 p-2 rounded-full bg-background shadow-sm shrink-0 h-fit`}>
                      {getIcon(notification.type, notification.itemType)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-none group-hover:text-primary transition-colors">
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                          {format(parseISO(notification.date), "dd MMM", { locale: ptBR }).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
