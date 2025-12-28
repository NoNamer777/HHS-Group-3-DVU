import { DoctorBuilder, UserRoles } from '@/models';
import { alice, bob, charlie, diana, eve } from './patients.ts';

export const [drHartman, drKuiper] = [
    new DoctorBuilder()
        .withName('Dr. Emma Hartman')
        .withEmail('emma.hartman@example.com')
        .withRole(UserRoles.GENERAL_PRACTITIONER)
        .withPatients(alice, bob, charlie)
        .build(),
    new DoctorBuilder()
        .withName('Dr. Lars Kuiper')
        .withEmail('lars.kuiper@example.com')
        .withRole(UserRoles.PRACTISE_ASSISTANT)
        .withPatients(diana, eve)
        .build(),
];

export const defaultDoctors = [drHartman, drKuiper];
