/** @modules/notifications — central de notificações (M15). */
import { notifications } from "@/mocks/plataforma";
import type { Notification } from "@/types/domain";

export type { Notification };

export const listNotifications = (): Notification[] => notifications;
export const countUnread = (): number => notifications.filter((n) => !n.read).length;
