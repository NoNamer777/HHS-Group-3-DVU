import { configureStore } from '@reduxjs/toolkit';
import { conversationsApi } from './conversations';
import { patientsApi } from './patients';

const store = configureStore({
    reducer: {
        [patientsApi.reducerPath]: patientsApi.reducer,
        [conversationsApi.reducerPath]: conversationsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            patientsApi.middleware,
            conversationsApi.middleware,
        ),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
