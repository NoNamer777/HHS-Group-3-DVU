export const RequestMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

export type RequestMethod = (typeof RequestMethods)[keyof typeof RequestMethods];
