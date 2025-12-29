import type { UserRole } from './role.enum';

export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
}
