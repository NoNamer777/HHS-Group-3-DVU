import { type User, type UserRole, UserRoles } from '@/models';
import { nanoid } from 'nanoid';

export class UserBuilder {
    private readonly user: User;

    public constructor(id?: string) {
        this.user = {
            id: id ? id : nanoid(),
            role: UserRoles.PATIENT,
        } as User;
    }

    public build() {
        return this.user;
    }

    public withEmail(email: string) {
        this.user.email = email;
        return this;
    }

    public withPassword(password: string) {
        this.user.password = password;
        return this;
    }

    public withName(name: string) {
        this.user.name = name;
        return this;
    }

    public withRole(role: UserRole) {
        this.user.role = role;
        return this;
    }
}
