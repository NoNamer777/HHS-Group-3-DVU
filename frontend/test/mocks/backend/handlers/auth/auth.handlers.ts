import { BASE_URL } from '@/models';
import { delay, http, HttpResponse, RequestHandler } from 'msw';

const endPoint = `${BASE_URL}/auth`;

export const authHandlers: RequestHandler[] = [
    http.post(`${endPoint}/login`, async () => {
        await delay();

        return HttpResponse.json();
    }),
    http.post(`${endPoint}/logout`, async () => {
        await delay();

        return HttpResponse.json();
    }),
    http.post(`${endPoint}/token`, async () => {
        await delay();

        return HttpResponse.json();
    }),
];
