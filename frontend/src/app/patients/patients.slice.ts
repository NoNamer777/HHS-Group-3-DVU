import type { ErrorResponse, Patient } from '@/models';
import {
    createAsyncThunk,
    createSlice,
    type PayloadAction,
    type WritableDraft,
} from '@reduxjs/toolkit';
import { type FetchStatus, FetchStatuses } from '../shared/store';
import { patientsService } from './patients.service.ts';

interface PatientsState {
    patients: Patient[];
    status: FetchStatus;
    error: ErrorResponse;
}

export const PATIENT_SLICE_NAME = 'patients' as const;

const initialState: PatientsState = {
    patients: [],
    status: FetchStatuses.IDLE,
    error: null,
};

export const fetchAllPatients = createAsyncThunk(
    'patients/fetchAllPatients',
    async () => await patientsService.getAll(),
);

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
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPatients.pending, (state) => {
                state.error = null;
                state.status = FetchStatuses.PENDING;
            })
            .addCase(fetchAllPatients.fulfilled, (state, action) => {
                state.status = FetchStatuses.SUCCEEDED;
                state.patients = [...action.payload];
            })
            .addCase(fetchAllPatients.rejected, (state, action) => {
                state.status = FetchStatuses.FAILED;
                state.error = action.payload as ErrorResponse;
            });
    },
});

export const { setPatients, addPatient, removePatient, updatePatient } =
    patientsSlice.actions;

export default patientsSlice.reducer;
