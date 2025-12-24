import { type User, type UserRole } from '@/models';
import { nanoid } from 'nanoid';

export class UserBuilder {
    protected readonly user: User;

    public constructor(id = nanoid()) {
        this.user = {
            id: id,
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
