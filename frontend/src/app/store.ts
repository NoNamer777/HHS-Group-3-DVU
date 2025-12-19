import { configureStore } from '@reduxjs/toolkit';
import { patientsApi } from './patients';

const store = configureStore({
    reducer: {
        [patientsApi.reducerPath]: patientsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(patientsApi.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
