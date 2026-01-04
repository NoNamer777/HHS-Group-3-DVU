import type { RequestHandler } from 'msw';
import { conversationsHandlers, doctorsHandlers, labResultsHandlers, patientsHandlers } from './api';
import { authHandlers, usersHandlers } from './auth';

export const backendHandlers: RequestHandler[] = [
    ...authHandlers,
    ...usersHandlers,

    ...doctorsHandlers,
    ...conversationsHandlers,
    ...labResultsHandlers,
    ...patientsHandlers,
];
