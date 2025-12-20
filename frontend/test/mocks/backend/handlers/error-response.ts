import { type HttpStatusCode, HttpStatusNames } from '@/models';
import { HttpResponse } from 'msw';

interface ErrorResponseParams {
    status: HttpStatusCode;
    message: string;
}

export function throwErrorResponse(params: ErrorResponseParams) {
    const { status, message } = params;

    const statusText = HttpStatusNames[status];

    return HttpResponse.json(
        {
            message: message,
            status: status,
            error: statusText,
            timestamp: new Date(),
        },
        {
            status: status,
            statusText: statusText,
            type: 'error',
        },
    );
}
