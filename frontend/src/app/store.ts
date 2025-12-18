import { configureStore } from '@reduxjs/toolkit';
import patientReducers from './patients/patients.slice.ts';

const store = configureStore({
    reducer: {
        patients: patientReducers,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
