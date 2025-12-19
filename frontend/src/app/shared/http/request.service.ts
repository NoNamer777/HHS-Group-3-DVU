import { type RequestMethod, RequestMethods } from '@/models';

interface RequestParams<RequestData = unknown> {
    url: string;
    method: RequestMethod;
    data?: RequestData;
}

export class RequestService {
    public async get(url: string) {
        return await this.request({
            url: url,
            method: RequestMethods.GET,
        });
    }

    public async post<RequestData = unknown>(url: string, data: RequestData) {
        return await this.request({
            url: url,
            method: RequestMethods.POST,
            data: data,
        });
    }

    public async put<RequestData = unknown>(url: string, data: RequestData) {
        return await this.request({
            url: url,
            method: RequestMethods.PUT,
            data: data,
        });
    }

    public async delete(url: string) {
        return await this.request({
            url: url,
            method: RequestMethods.DELETE,
        });
    }

    private async request<RequestData = unknown>(
        params: RequestParams<RequestData>,
    ) {
        const { url, method, data } = params;

        return await fetch(url, {
            method: method,
            ...(data ? { body: JSON.stringify(data) } : {}),
        });
    }
}

export const requestService = new RequestService();
