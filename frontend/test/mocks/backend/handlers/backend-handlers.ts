import type { RequestHandler } from 'msw';
import { doctorsHandlers, patientsHandlers } from './api';
import { authHandlers, usersHandlers } from './auth';

export const backendHandlers: RequestHandler[] = [
    ...authHandlers,
    ...usersHandlers,
    ...patientsHandlers,
    ...doctorsHandlers,
];
