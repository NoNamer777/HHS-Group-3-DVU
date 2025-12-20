import { BASE_URL } from '@/models';
import { delay, http, HttpResponse, RequestHandler } from 'msw';
import { mockDoctorsDB } from '../../../db';

const endPoint = `${BASE_URL}/api/doctors`;

export const doctorsHandlers: RequestHandler[] = [
    http.get(endPoint, async () => {
        await delay();

        return HttpResponse.json(mockDoctorsDB.getAll());
    }),
];
