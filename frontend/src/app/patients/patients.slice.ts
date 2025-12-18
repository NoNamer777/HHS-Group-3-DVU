import {
    createSlice,
    type PayloadAction,
    type WritableDraft,
} from '@reduxjs/toolkit';
import type { Patient } from './models.ts';

interface PatientsState {
    patients: Patient[];
}

export const PATIENT_SLICE_NAME = 'patients' as const;

const initialState: PatientsState = {
    patients: [],
};

export const patientsSlice = createSlice({
    name: PATIENT_SLICE_NAME,
    initialState: initialState,
    reducers: {
        setPatients: (
            state: WritableDraft<PatientsState>,
            action: PayloadAction<Patient[]>,
        ) => {
            state.patients = [...action.payload];
        },
        addPatient: (state: PatientsState, action: PayloadAction<Patient>) => {
            state.patients = [...state.patients, action.payload];
        },
        removePatient: (
            state: PatientsState,
            action: PayloadAction<string>,
        ) => {
            state.patients = state.patients.filter(
                (patient) => action.payload !== patient.id,
            );
        },
        updatePatient: (
            state: PatientsState,
            action: PayloadAction<Patient>,
        ) => {
            state.patients = state.patients.map((patient) => {
                if (patient.id !== action.payload.id) return patient;
                return action.payload;
            });
        },
    },
});

export const { setPatients, addPatient, removePatient, updatePatient } =
    patientsSlice.actions;

export default patientsSlice.reducer;
