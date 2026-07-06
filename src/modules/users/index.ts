/** @modules/users — sessão e usuários do tenant (M08). */
import { users } from "@/mocks/plataforma";
import type { User } from "@/types/domain";

export { mockSession, type Session } from "@/lib/session";
export type { User };

export const listUsers = (): User[] => users;
