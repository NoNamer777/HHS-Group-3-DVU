import type { HttpStatusCode, HttpStatusName } from '@/models';

export interface ErrorResponse {
    message: string;
    status: HttpStatusCode;
    error: HttpStatusName;
    timestamp: Date;
}
