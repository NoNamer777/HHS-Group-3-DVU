import {
    BASE_URL,
    buildResourceEndPoint,
    type CreatePatientData,
    type Patient,
    RequestMethods,
    TAG_LIST_ID,
} from '@/models';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const END_POINT = '/api/patients' as const;

const TAG_TYPE = 'Patient' as const;

export const patientsApi = createApi({
    reducerPath: 'patientsApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    tagTypes: [TAG_TYPE],
    endpoints: (build) => ({
        getPatients: build.query<Patient[], void>({
            query: () => END_POINT,
            providesTags: (patients) =>
                patients
                    ? [
                          ...patients.map(({ id }) => ({
                              type: TAG_TYPE,
                              id: id,
                          })),
                          { type: TAG_TYPE, id: TAG_LIST_ID },
                      ]
                    : [{ type: TAG_TYPE, id: TAG_LIST_ID }],
        }),

        createPatient: build.mutation<Patient, CreatePatientData>({
            query: (data) => ({
                url: END_POINT,
                method: RequestMethods.POST,
                body: data,
            }),
            invalidatesTags: [{ type: TAG_TYPE, id: TAG_LIST_ID }],
        }),

        getPatientById: build.query<Patient, string>({
            query: (patientId) => buildResourceEndPoint(END_POINT, patientId),
            providesTags: (patient) => [{ type: TAG_TYPE, id: patient.id }],
        }),

        updatePatient: build.mutation<Patient, Patient>({
            query: ({ id: patientId, ...patient }) => ({
                url: buildResourceEndPoint(END_POINT, patientId),
                method: RequestMethods.PUT,
                body: patient,
            }),
            invalidatesTags: (result) => [
                { type: TAG_TYPE, id: result.id },
                { type: TAG_TYPE, id: TAG_LIST_ID },
            ],
        }),

        removePatient: build.mutation<void, string>({
            query: (patientId) => ({
                url: buildResourceEndPoint(END_POINT, patientId),
                method: RequestMethods.DELETE,
            }),
            invalidatesTags: (_result, _error, patientId) => [
                { type: TAG_TYPE, id: patientId },
                { type: TAG_TYPE, id: TAG_LIST_ID },
            ],
        }),
    }),
});

export const {
    useGetPatientsQuery,
    useCreatePatientMutation,
    useGetPatientByIdQuery,
    useUpdatePatientMutation,
    useRemovePatientMutation,
} = patientsApi;
