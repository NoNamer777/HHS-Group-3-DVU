import {
    BASE_URL,
    buildResourceEndPoint,
    type CreateLabResultData,
    type LabResult,
    RequestMethods,
    TAG_LIST_ID,
} from '@/models';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const END_POINT = '/api/lab-results' as const;
const TAG_TYPE = 'LabResult' as const;

interface GetAllQueryParams {
    patient?: string;
    limit?: number;
}

export const labResultsApi = createApi({
    reducerPath: 'labResultsApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    tagTypes: [TAG_TYPE],
    endpoints: (build) => ({
        getLabResults: build.query<LabResult[], GetAllQueryParams | void>({
            query: (params) => {
                if (!params) return END_POINT;
                const queryParams = new URLSearchParams();

                if (params.limit) {
                    queryParams.set('limit', `${params.limit}`);
                }
                if (params.patient) {
                    queryParams.set('patient', params.patient);
                }
                const queryString = queryParams.toString();

                if (!queryString) return END_POINT;
                return `${END_POINT}?${queryString}`;
            },
            providesTags: (labResults) =>
                labResults
                    ? [
                          ...labResults.map(({ id }) => ({
                              type: TAG_TYPE,
                              id: id,
                          })),
                          { type: TAG_TYPE, id: TAG_LIST_ID },
                      ]
                    : [{ type: TAG_TYPE, id: TAG_LIST_ID }],
        }),

        createLabResult: build.mutation<LabResult, CreateLabResultData>({
            query: (data) => ({
                url: END_POINT,
                method: RequestMethods.POST,
                body: data,
            }),
            invalidatesTags: [{ type: TAG_TYPE, id: TAG_LIST_ID }],
        }),

        getLabResultById: build.query<LabResult, string>({
            query: (labResultId) =>
                buildResourceEndPoint(END_POINT, labResultId),
            providesTags: (labResult) => [{ type: TAG_TYPE, id: labResult.id }],
        }),

        updateLabResult: build.mutation<LabResult, LabResult>({
            query: ({ id: labResultId, ...labResult }) => ({
                url: buildResourceEndPoint(END_POINT, labResultId),
                method: RequestMethods.PUT,
                body: labResult,
            }),
            invalidatesTags: (result) => [
                { type: TAG_TYPE, id: result.id },
                { type: TAG_TYPE, id: TAG_LIST_ID },
            ],
        }),

        removeLabResult: build.mutation<void, string>({
            query: (labResultId) => ({
                url: buildResourceEndPoint(END_POINT, labResultId),
                method: RequestMethods.DELETE,
            }),
            invalidatesTags: (_result, _error, labResultId) => [
                { type: TAG_TYPE, id: labResultId },
                { type: TAG_TYPE, id: TAG_LIST_ID },
            ],
        }),
    }),
});

export const {
    useGetLabResultsQuery,
    useCreateLabResultMutation,
    useGetLabResultByIdQuery,
    useUpdateLabResultMutation,
    useRemoveLabResultMutation,
} = labResultsApi;
