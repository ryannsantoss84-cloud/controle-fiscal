import { useEffect, useState } from "react";
import { useDeadlines } from "./useDeadlines";
import { useInstallments } from "./useInstallments";
import { differenceInDays, parseISO } from "date-fns";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "warning" | "danger" | "info";
    date: string;
    itemId: string;
    itemType: "tax" | "obligation" | "installment";
}

export function useNotifications() {
    const { deadlines } = useDeadlines();
    const { installments } = useInstallments();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const notificationDays = 7; // Pode vir das configurações
        const today = new Date();
        const newNotifications: Notification[] = [];

        // Notificações de prazos
        deadlines.forEach((deadline) => {
            if (deadline.status === "completed" || deadline.status === "overdue") return;

            const dueDate = parseISO(deadline.due_date);
            const daysUntil = differenceInDays(dueDate, today);
            const itemType = deadline.type === "tax" ? "tax" : "obligation";

            if (daysUntil < 0) {
                newNotifications.push({
                    id: `deadline-${deadline.id}`,
                    title: "Prazo Atrasado!",
                    message: `${deadline.title} - Venceu há ${Math.abs(daysUntil)} dias`,
                    type: "danger",
                    date: deadline.due_date,
                    itemId: deadline.id,
                    itemType: itemType,
                });
            } else if (daysUntil === 0) {
                newNotifications.push({
                    id: `deadline-${deadline.id}`,
                    title: "Vence Hoje!",
                    message: deadline.title,
                    type: "danger",
                    date: deadline.due_date,
                    itemId: deadline.id,
                    itemType: itemType,
                });
            } else if (daysUntil <= notificationDays) {
                newNotifications.push({
                    id: `deadline-${deadline.id}`,
                    title: `Vence em ${daysUntil} ${daysUntil === 1 ? "dia" : "dias"}`,
                    message: deadline.title,
                    type: "warning",
                    date: deadline.due_date,
                    itemId: deadline.id,
                    itemType: itemType,
                });
            }
        });

        // Notificações de parcelamentos
        installments.forEach((installment) => {
            if (installment.status === "paid" || installment.status === "overdue") return;

            const dueDate = parseISO(installment.due_date);
            const daysUntil = differenceInDays(dueDate, today);

            if (daysUntil < 0) {
                newNotifications.push({
                    id: `installment-${installment.id}`,
                    title: "Parcela Atrasada!",
                    message: `Parcela ${installment.installment_number}/${installment.total_installments} - Venceu há ${Math.abs(daysUntil)} dias`,
                    type: "danger",
                    date: installment.due_date,
                    itemId: installment.id,
                    itemType: "installment",
                });
            } else if (daysUntil === 0) {
                newNotifications.push({
                    id: `installment-${installment.id}`,
                    title: "Parcela Vence Hoje!",
                    message: `Parcela ${installment.installment_number}/${installment.total_installments}`,
                    type: "danger",
                    date: installment.due_date,
                    itemId: installment.id,
                    itemType: "installment",
                });
            } else if (daysUntil <= notificationDays) {
                newNotifications.push({
                    id: `installment-${installment.id}`,
                    title: `Parcela vence em ${daysUntil} ${daysUntil === 1 ? "dia" : "dias"}`,
                    message: `Parcela ${installment.installment_number}/${installment.total_installments}`,
                    type: "warning",
                    date: installment.due_date,
                    itemId: installment.id,
                    itemType: "installment",
                });
            }
        });

        // Ordenar por data (mais próximos primeiro)
        newNotifications.sort((a, b) =>
            parseISO(a.date).getTime() - parseISO(b.date).getTime()
        );

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.length);
    }, [deadlines, installments]);

    return {
        notifications,
        unreadCount,
        hasNotifications: notifications.length > 0,
    };
}
