import { type CreatePatientData, type Patient } from '@/models';
import { add, getAll, getById, remove, update } from '../../utils/LocalStorageAdapter';

const PATIENTS_KEY = 'patients';

export function useGetPatientsQuery(params?: { name?: string }) {
    return {
        data: getAll<Patient>(PATIENTS_KEY).filter((p: Patient) =>
            params?.name ? p.name?.toLowerCase().includes(params.name.toLowerCase()) : true,
        ),
        refetch: () => {},
    };
}

export function useCreatePatientMutation() {
    return [
        async (data: CreatePatientData) => {
            const id = Math.random().toString(36).slice(2);
            // Force lastUpdated as ISO string with date and time
            const lastUpdated = new Date().toISOString();
            add(PATIENTS_KEY, { ...data, id, lastUpdated });
            return { ...data, id, lastUpdated };
        },
    ];
}

export function useGetPatientByIdQuery(patientId?: string) {
    return {
        data: patientId ? getById<Patient>(PATIENTS_KEY, patientId) : undefined,
        isLoading: false,
    };
}

export function useUpdatePatientMutation() {
    return [
        async (patient: Patient) => {
            update(PATIENTS_KEY, patient);
            return patient;
        },
    ];
}

export function useRemovePatientMutation() {
    return [
        async (patientId: string) => {
            remove(PATIENTS_KEY, patientId);
        },
    ];
}
