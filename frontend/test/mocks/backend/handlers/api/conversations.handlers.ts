import {
    BASE_URL,
    type CreateConversationData,
    HttpStatusCodes,
    HttpStatusNames,
} from '@/models';
import { mockConversationsDB } from '@/test';
import { delay, http, HttpResponse, type RequestHandler } from 'msw';

const endPoint = `${BASE_URL}/api/conversations`;

export const conversationsHandlers: RequestHandler[] = [
    http.get(endPoint, async () => {
        await delay();

        return HttpResponse.json(mockConversationsDB.getAll());
    }),
    http.post<null, CreateConversationData>(endPoint, async ({ request }) => {
        await delay();

        const data = await request.json();
        const created = mockConversationsDB.create(data);

        const status = HttpStatusCodes.CREATED;
        const location = `${endPoint}/${created.id}`;

        return HttpResponse.json(data, {
            status: status,
            statusText: HttpStatusNames[status],
            headers: {
                Location: location,
            },
        });
    }),
];
