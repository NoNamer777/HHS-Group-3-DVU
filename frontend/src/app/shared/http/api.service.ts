import { requestService } from './request.service.ts';

export class ApiService {
    private readonly baseUrl =
        import.meta.env['VITE_BASE_URL'] || 'http://localhost:8000/api';

    public async get(endPoint: string) {
        return await requestService.get(`${this.baseUrl}${endPoint}`);
    }

    public async post<RequestData = unknown>(
        endPoint: string,
        data: RequestData,
    ) {
        return await requestService.post(`${this.baseUrl}${endPoint}`, data);
    }

    public async put<RequestData = unknown>(
        endPoint: string,
        data: RequestData,
    ) {
        return await requestService.put(`${this.baseUrl}${endPoint}`, data);
    }

    public async delete(endPoint: string) {
        return await requestService.delete(`${this.baseUrl}${endPoint}`);
    }
}

export const apiService = new ApiService();
