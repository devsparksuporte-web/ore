/**
 * Toast · Strata (Sprint 04)
 * API única de notificação (envolve sonner). Componentes NUNCA importam
 * sonner diretamente — usam `notify` para garantir tom e duração padrão.
 */
import { toast } from "sonner";

type NotifyOptions = { description?: string; duration?: number };

export const notify = {
  success: (title: string, opts?: NotifyOptions) => toast.success(title, opts),
  warning: (title: string, opts?: NotifyOptions) => toast.warning(title, opts),
  error: (title: string, opts?: NotifyOptions) => toast.error(title, opts),
  info: (title: string, opts?: NotifyOptions) => toast.info(title, opts),
};
