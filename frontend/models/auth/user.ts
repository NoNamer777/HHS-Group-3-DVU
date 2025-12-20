import type { UserRole } from './role.ts';

export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    roles: UserRole[];
}
