import {
    BASE_URL,
    type CreateLabResultData,
    HttpStatusCodes,
    HttpStatusNames,
} from '@/models';
import { delay, http, HttpResponse, type RequestHandler } from 'msw';
import { mockLabResultsDB } from '../../../db';

const endPoint = `${BASE_URL}/api/lab-results`;

export const labResultsHandlers: RequestHandler[] = [
    http.get(endPoint, async ({ request }) => {
        await delay();

        const url = new URL(request.url);

        return HttpResponse.json(mockLabResultsDB.getAll(url.searchParams));
    }),
    http.post<null, CreateLabResultData>(endPoint, async ({ request }) => {
        await delay();

        const data = await request.json();
        const created = mockLabResultsDB.create(data);

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
