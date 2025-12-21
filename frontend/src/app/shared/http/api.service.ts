import { RequestService } from './request.service';

export class ApiService {
    private readonly requestService = new RequestService();

    private readonly baseUrl = 'http://localhost:8000/api';

    public async get(endPoint: string) {
        return await this.requestService.get(`${this.baseUrl}${endPoint}`);
    }

    public async post<RequestData = unknown>(
        endPoint: string,
        data: RequestData,
    ) {
        return await this.requestService.post(
            `${this.baseUrl}${endPoint}`,
            data,
        );
    }

    public async put<RequestData = unknown>(
        endPoint: string,
        data: RequestData,
    ) {
        return await this.requestService.put(
            `${this.baseUrl}${endPoint}`,
            data,
        );
    }

    public async delete(endPoint: string) {
        return await this.requestService.delete(`${this.baseUrl}${endPoint}`);
    }
}
