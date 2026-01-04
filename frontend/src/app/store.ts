import { configureStore } from '@reduxjs/toolkit';
import { conversationsApi } from './conversations';
import { labResultsApi } from './lab-results';
import { patientsApi } from './patients';

const store = configureStore({
    reducer: {
        [patientsApi.reducerPath]: patientsApi.reducer,
        [conversationsApi.reducerPath]: conversationsApi.reducer,
        [labResultsApi.reducerPath]: labResultsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            patientsApi.middleware,
            conversationsApi.middleware,
            labResultsApi.middleware,
        ),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
