import type { UserRole } from './role.enum.ts';

export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
}
