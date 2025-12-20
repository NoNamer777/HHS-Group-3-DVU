import { BASE_URL, HttpStatusCodes } from '@/models';
import { delay, http, HttpResponse, RequestHandler } from 'msw';
import { mockDoctorsDB } from '../../../db';
import { throwErrorResponse } from '../error-response.ts';

const endPoint = `${BASE_URL}/api/doctors`;

export const doctorsHandlers: RequestHandler[] = [
    http.get(endPoint, async () => {
        await delay();

        return HttpResponse.json(mockDoctorsDB.getAll());
    }),
    http.get<{ doctorId: string }>(
        `${endPoint}:doctorId`,
        async ({ params }) => {
            await delay();

            const { doctorId } = params;
            const doctor = mockDoctorsDB.getById(doctorId);

            if (!doctor) {
                return throwErrorResponse({
                    status: HttpStatusCodes.NOT_FOUND,
                    message: `Doctor with ID "${doctorId}" was not found`,
                });
            }
            return HttpResponse.json(doctor);
        },
    ),
];
