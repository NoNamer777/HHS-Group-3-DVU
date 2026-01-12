import { type Doctor, type Patient, UserBuilder, type UserRole } from '@/models';
import { nanoid } from 'nanoid';

export class DoctorBuilder {
    private readonly userBuilder: UserBuilder;
    private readonly doctor: Doctor;

    public constructor(id = nanoid()) {
        this.userBuilder = new UserBuilder(id);
        this.doctor = {} as Doctor;
    }

    public build() {
        return {
            ...this.userBuilder.build(),
            ...this.doctor,
        } as Doctor;
    }

    public withPatients(...patients: Patient[]) {
        this.doctor.patients = [...patients];
        return this;
    }

    public withEmail(email: string) {
        this.userBuilder.withEmail(email);
        return this;
    }

    public withPassword(password: string) {
        this.userBuilder.withPassword(password);
        return this;
    }

    public withName(name: string) {
        this.userBuilder.withName(name);
        return this;
    }

    public withRole(role: UserRole) {
        this.userBuilder.withRole(role);
        return this;
    }
}
