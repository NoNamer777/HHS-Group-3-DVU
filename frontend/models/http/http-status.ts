export const HttpStatusCodes = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
} as const;

export type HttpStatusCode =
    (typeof HttpStatusCodes)[keyof typeof HttpStatusCodes];

export const HttpStatusNames = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',

    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
} as const;

export type HttpStatusName =
    (typeof HttpStatusNames)[keyof typeof HttpStatusNames];
