import { type CreateLabResultData, type LabResult } from '@/models';
import { add, getAll, getById, remove, update } from '../../utils/LocalStorageAdapter';

const LAB_RESULTS_KEY = 'labResults';

export function useGetLabResultsQuery(params?: { patient?: string; limit?: number }) {
    let results = getAll<LabResult>(LAB_RESULTS_KEY);
    if (params?.patient) {
        results = results.filter((r) => r.patient?.id === params.patient);
    }
    if (params?.limit) {
        results = results.slice(0, params.limit);
    }
    return {
        data: results,
        refetch: () => {},
    };
}

export function useCreateLabResultMutation() {
    return [
        async (data: CreateLabResultData) => {
            const id = Math.random().toString(36).slice(2);
            // Force timestamp as ISO string (YYYY-MM-DD) for consistency
            let timestamp: string;
            if (typeof (data as any).timestamp === 'string') {
                timestamp = (data as any).timestamp;
            } else if (typeof (data as any).timestamp === 'number') {
                timestamp = new Date((data as any).timestamp).toISOString().slice(0, 10);
            } else {
                timestamp = new Date().toISOString().slice(0, 10);
            }
            add(LAB_RESULTS_KEY, { ...data, id, timestamp });
            return { ...data, id, timestamp };
        },
    ];
}

export function useGetLabResultByIdQuery(labResultId?: string) {
    return {
        data: labResultId ? getById<LabResult>(LAB_RESULTS_KEY, labResultId) : undefined,
        isLoading: false,
    };
}

export function useUpdateLabResultMutation() {
    return [
        async (labResult: LabResult) => {
            update(LAB_RESULTS_KEY, labResult);
            return labResult;
        },
    ];
}

export function useRemoveLabResultMutation() {
    return [
        async (labResultId: string) => {
            remove(LAB_RESULTS_KEY, labResultId);
        },
    ];
}
