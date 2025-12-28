import { BASE_URL } from '@/models';
import { delay, http, HttpResponse, RequestHandler } from 'msw';
import { mockUsersDB } from '../../../db';

const endPoint = `${BASE_URL}/auth/users`;

export const usersHandlers: RequestHandler[] = [
    http.get(endPoint, async () => {
        await delay();

        return HttpResponse.json(mockUsersDB.getAll());
    }),
];
