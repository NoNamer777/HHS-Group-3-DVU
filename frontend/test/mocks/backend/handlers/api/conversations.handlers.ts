import { delay, http, HttpResponse, type RequestHandler } from 'msw';
import { BASE_URL } from '@/models';

const endPoint = `${BASE_URL}/api/conversations`;

export const conversationsHandlers: RequestHandler[] = [
    http.get(endPoint, async () => {
        await delay();

        return HttpResponse.json([]);
    }),
];
