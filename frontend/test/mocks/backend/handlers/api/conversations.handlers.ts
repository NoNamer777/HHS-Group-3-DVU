import { BASE_URL, type CreateConversationData, HttpStatusCodes, HttpStatusNames } from '@/models';
import { delay, http, HttpResponse, type RequestHandler } from 'msw';
import { mockConversationsDB } from '../../../db';

const endPoint = `${BASE_URL}/api/conversations`;

export const conversationsHandlers: RequestHandler[] = [
    http.get(endPoint, async ({ request }) => {
        await delay();

        const url = new URL(request.url);

        return HttpResponse.json(mockConversationsDB.getAll(url.searchParams));
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
