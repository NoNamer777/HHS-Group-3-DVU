import type { Patient } from '../patient';

export interface LabResult {
    id: string;
    type: string;
    value: number;
    unit: string;
    minValue?: number;
    maxValue?: number;

    /**
     * Timestamp in ms since the epoch.
     */
    timestamp: number;
    patient: Patient;
}

export type CreateLabResultData = Pick<LabResult, 'type' | 'value' | 'unit' | 'minValue' | 'maxValue' | 'patient'>;
