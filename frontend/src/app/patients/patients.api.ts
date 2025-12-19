import {
    BASE_URL,
    type CreatePatientData,
    type Patient,
    RequestMethods,
} from '@/models';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const END_POINT = '/patients' as const;

const TAG_TYPE = 'Patient' as const;
const TAG_LIST_ID = 'LIST' as const;

function buildPatientEndPoint(patientId: string) {
    return `${END_POINT}/${patientId}`;
}

export const patientsApi = createApi({
    reducerPath: 'patientsApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    tagTypes: ['Patient'],
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
            query: (patientId) => buildPatientEndPoint(patientId),
            providesTags: (patient) => [{ type: TAG_TYPE, id: patient.id }],
        }),

        updatePatient: build.mutation<Patient, Patient>({
            query: ({ id: patientId, ...patient }) => ({
                url: buildPatientEndPoint(patientId),
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
                url: buildPatientEndPoint(patientId),
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
