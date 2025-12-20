export const UserRoles = {
    PRACTISE_ASSISTANT: 'Praktijkondersteuner',
    GENERAL_PRACTITIONER: 'Huisarts',
    DOCTOR: 'Dokter',
    DIETITIAN: 'Dietist',
    PATIENT: 'Patient',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
