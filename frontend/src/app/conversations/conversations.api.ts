import {
    BASE_URL,
    buildResourceEndPoint,
    type Conversation,
    type CreateConversationData,
    RequestMethods,
    TAG_LIST_ID,
} from '@/models';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const END_POINT = '/api/conversations' as const;
const TAG_TYPE = 'Conversation' as const;

interface GetAllQueryParams {
    to?: string;
    limit?: number;
}

export const conversationsApi = createApi({
    reducerPath: 'conversationsApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    tagTypes: [TAG_TYPE],
    endpoints: (build) => ({
        getConversations: build.query<Conversation[], GetAllQueryParams | void>(
            {
                query: (params) => {
                    if (!params) return END_POINT;
                    const queryParams = new URLSearchParams();

                    console.log(params);

                    if (params.limit) {
                        queryParams.set('limit', `${params.limit}`);
                    }
                    if (params.to) {
                        queryParams.set('to', params.to);
                    }
                    const queryString = queryParams.toString();

                    if (!queryString) return END_POINT;
                    return `${END_POINT}?${queryString}`;
                },
                providesTags: (conversations) =>
                    conversations
                        ? [
                              ...conversations.map(({ id }) => ({
                                  type: TAG_TYPE,
                                  id: id,
                              })),
                              { type: TAG_TYPE, id: TAG_LIST_ID },
                          ]
                        : [{ type: TAG_TYPE, id: TAG_LIST_ID }],
            },
        ),

        createConversation: build.mutation<
            Conversation,
            CreateConversationData
        >({
            query: (data) => ({
                url: END_POINT,
                method: RequestMethods.POST,
                body: data,
            }),
            invalidatesTags: [{ type: TAG_TYPE, id: TAG_LIST_ID }],
        }),

        getConversationById: build.query<Conversation, string>({
            query: (conversationId) =>
                buildResourceEndPoint(END_POINT, conversationId),
            providesTags: (conversation) => [
                { type: TAG_TYPE, id: conversation.id },
            ],
        }),

        updateConversation: build.mutation<Conversation, Conversation>({
            query: ({ id: conversationId, ...conversation }) => ({
                url: buildResourceEndPoint(END_POINT, conversationId),
                method: RequestMethods.PUT,
                body: conversation,
            }),
            invalidatesTags: (result) => [
                { type: TAG_TYPE, id: result.id },
                { type: TAG_TYPE, id: TAG_LIST_ID },
            ],
        }),

        removeConversation: build.mutation<void, string>({
            query: (conversationId) => ({
                url: buildResourceEndPoint(END_POINT, conversationId),
                method: RequestMethods.DELETE,
            }),
            invalidatesTags: (_result, _error, conversationId) => [
                { type: TAG_TYPE, id: conversationId },
                { type: TAG_TYPE, id: TAG_LIST_ID },
            ],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useCreateConversationMutation,
    useGetConversationByIdQuery,
    useUpdateConversationMutation,
    useRemoveConversationMutation,
} = conversationsApi;
