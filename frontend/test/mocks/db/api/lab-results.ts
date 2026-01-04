import type { CreateLabResultData, LabResult } from '@/models';
import { nanoid } from 'nanoid';
import type { Records } from '../../types';

class MockLabResultsDB {
    private records: Records<LabResult> = {};

    public getAll(params: URLSearchParams) {
        let labResults = Object.values(this.records);

        if (params.has('patient')) {
            labResults = labResults.filter(
                ({ patient }) => patient.id === params.get('patient'),
            );
        }
        if (params.has('limit')) {
            labResults = labResults.slice(
                0,
                Number.parseInt(params.get('limit')) - 1,
            );
        }
        return labResults.sort((curr, next) => next.timestamp - curr.timestamp);
    }

    public create(data: CreateLabResultData) {
        const labResult: LabResult = {
            id: nanoid(),
            patient: data.patient,
            type: data.type,
            value: data.value,
            unit: data.unit,
            maxValue: data.maxValue,
            minValue: data.minValue,
            timestamp: new Date().getTime(),
        };
        this.records[labResult.id] = labResult;
        return labResult;
    }

    public reset() {
        this.records = {};
    }
}

export const mockLabResultsDB = new MockLabResultsDB();
