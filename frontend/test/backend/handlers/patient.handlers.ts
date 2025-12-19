import {
    BASE_URL,
    type CreatePatientData,
    HttpStatusCodes,
    HttpStatusNames,
    type Patient,
} from '@/models';
import { delay, http, HttpResponse, RequestHandler } from 'msw';
import { mockPatientsDB } from '../../db';
import { throwErrorResponse } from './error-response.ts';

const endPoint = `${BASE_URL}/patients`;

export const patientHandlers: RequestHandler[] = [
    http.get(endPoint, async () => {
        await delay();

        const patients = mockPatientsDB.getAll();
        return HttpResponse.json(patients);
    }),
    http.post<null, CreatePatientData>(endPoint, async ({ request }) => {
        await delay();

        const data = await request.json();
        const created = mockPatientsDB.create(data);

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
    http.get<{ patientId: string }>(
        `${endPoint}/:patientId`,
        async ({ params }) => {
            await delay();

            const { patientId } = params;
            const patient = mockPatientsDB.getById(patientId);

            if (!patient) {
                return throwErrorResponse({
                    status: HttpStatusCodes.NOT_FOUND,
                    message: `Patient with ID "${patientId}" was not found.`,
                });
            }
            return HttpResponse.json(patient);
        },
    ),
    http.put<{ patientId: string }, Patient>(
        `${endPoint}/:patientId`,
        async ({ params, request }) => {
            await delay();

            const { patientId } = params;
            const data = await request.json();

            if (patientId !== data.id) {
                return throwErrorResponse({
                    status: HttpStatusCodes.FORBIDDEN,
                    message: `Could not update Patient with ID "${patientId}". - Reason: Invalid ID "${data.id}" in request body.`,
                });
            }
            const patient = mockPatientsDB.update(data);

            if (!patient) {
                return throwErrorResponse({
                    status: HttpStatusCodes.NOT_FOUND,
                    message: `Could not update Patient with ID "${patientId}". - Reason: Patient was not found.`,
                });
            }
            return HttpResponse.json(patient);
        },
    ),
    http.delete<{ patientId: string }>(
        `${endPoint}/:patientId`,
        async ({ params }) => {
            await delay();

            const { patientId } = params;
            const status = HttpStatusCodes.NO_CONTENT;
            const removed = mockPatientsDB.remove(patientId as string);

            if (!removed) {
                return throwErrorResponse({
                    status: HttpStatusCodes.NOT_FOUND,
                    message: `Could not remove Patient with ID "${patientId}". - Reason: Patient was not found.`,
                });
            }
            return new HttpResponse(undefined, {
                status: status,
                statusText: HttpStatusNames[status],
            });
        },
    ),
];
