export const PatientStatuses = {
    STABLE: 'Stabiel',
    MONITORING: 'Monitoren',
    CRITICAL: 'Kritiek',
} as const;

export type PatientStatus =
    (typeof PatientStatuses)[keyof typeof PatientStatuses];

export function patientStatusAttribute(value: unknown) {
    return (
        Object.values(PatientStatuses).find((status) => value === status) ??
        PatientStatuses.STABLE
    );
}

export const PATIENT_STATUS_OPTIONS = [
    { value: PatientStatuses.STABLE, label: 'Stabiel' },
    { value: PatientStatuses.MONITORING, label: 'Monitoring' },
    { value: PatientStatuses.CRITICAL, label: 'Kritiek' },
] as const;
