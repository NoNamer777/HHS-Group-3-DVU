import { nanoid } from 'nanoid';
import { type Gender, Genders } from './gender.ts';
import { type PatientStatus, PatientStatuses } from './patient-status.ts';
import { type Patient } from './patient.model.ts';

export class PatientBuilder {
    private readonly patient: Patient;

    public constructor(id?: string) {
        this.patient = {
            id: id ? id : nanoid(),
            gender: Genders.MALE,
            status: PatientStatuses.STABLE,
        } as Patient;
    }

    public build() {
        return this.patient;
    }

    public withName(name: string) {
        this.patient.name = name;
        return this;
    }

    public withDateOfBirth(dateOfBirth: Date) {
        this.patient.dateOfBirth = dateOfBirth.getTime();
        return this;
    }

    public withGender(gender: Gender) {
        this.patient.gender = gender;
        return this;
    }

    public withCondition(condition: string) {
        this.patient.condition = condition;
        return this;
    }

    public withStatus(status: PatientStatus) {
        this.patient.status = status;
        return this;
    }

    public withLastUpdated(lastUpdated: Date) {
        this.patient.lastUpdated = lastUpdated.getTime();
        return this;
    }
}
