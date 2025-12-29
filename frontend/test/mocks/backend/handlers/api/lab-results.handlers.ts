import { BASE_URL } from '@/models';
import { delay, http, HttpResponse, type RequestHandler } from 'msw';

const endPoint = `${BASE_URL}/api/lab-results`;

export const labResultsHandlers: RequestHandler[] = [
    http.get(endPoint, async () => {
        await delay();

        return HttpResponse.json([]);
    }),
];
