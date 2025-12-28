import { nanoid } from 'nanoid';
import { UserBuilder, UserRoles } from '../../auth';
import { DiabetesTypes } from './diabetes-types.enum';
import { type Gender, Genders } from './gender.enum';
import { type PatientStatus, PatientStatuses } from './patient-status.enum';
import type { Patient } from './patient.model';

export class PatientBuilder extends UserBuilder {
    private readonly patient: Patient;

    public constructor(id = nanoid()) {
        super(id);

        this.user.role = UserRoles.PATIENT;
        this.patient = {
            gender: Genders.MALE,
            condition: DiabetesTypes.TYPE_1,
            status: PatientStatuses.STABLE,
        } as Patient;
    }

    public override build() {
        return {
            ...this.patient,
            ...this.user,
        } as Patient;
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
