import { DiabetesTypes, Genders, PatientBuilder, PatientStatuses } from '@/models';

export const [alice, bob, charlie, diana, eve] = [
    new PatientBuilder('2t6j6EWk6H-pQGy7c3un2')
        .withName('Alice Smith')
        .withDateOfBirth(new Date('1985-03-15'))
        .withGender(Genders.FEMALE)
        .withCondition(DiabetesTypes.TYPE_2)
        .withLastUpdated(new Date('2025-12-17T10:30:00Z'))
        .build(),
    new PatientBuilder('ZBn1Kmn-J7B4mE5Y0ZtxQ')
        .withName('Bob Johnson')
        .withDateOfBirth(new Date('1970-11-22'))
        .withLastUpdated(new Date('2025-12-18T08:15:00Z'))
        .withStatus(PatientStatuses.MONITORING)
        .build(),
    new PatientBuilder('I8y_dSGl0b8QLGEbL7DMk')
        .withName('Charlie Brown')
        .withDateOfBirth(new Date('1992-07-01'))
        .withCondition(DiabetesTypes.TYPE_2)
        .withLastUpdated(new Date('2025-12-18T14:00:00Z'))
        .withStatus(PatientStatuses.CRITICAL)
        .build(),
    new PatientBuilder('VMGG7cVFJDNZXlhm54P4N')
        .withName('Diana Prince')
        .withDateOfBirth(new Date('1960-01-01'))
        .withGender(Genders.FEMALE)
        .withCondition(DiabetesTypes.GESTATIONAL)
        .withLastUpdated(new Date('2025-12-16T16:45:00Z'))
        .build(),
    new PatientBuilder('NTDqsTjZ2YoxJS3r_PDdY')
        .withName('Eve Adams')
        .withDateOfBirth(new Date('2000-05-10'))
        .withGender(Genders.FEMALE)
        .withLastUpdated(new Date('2025-12-18T11:00:00Z'))
        .withStatus(PatientStatuses.MONITORING)
        .build(),
];

export const defaultPatients = [alice, bob, charlie, diana, eve];
