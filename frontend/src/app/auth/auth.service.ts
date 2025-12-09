import { RequestService } from '../shared';
import { LoginData } from './models';

export class AuthService {
    private readonly requestService = new RequestService();

    private readonly baseUrl = 'http://localhost:8000/auth';

    public async login(data: LoginData) {
        const response = await this.requestService.post(
            `${this.baseUrl}/login`,
            data,
        );

        console.log({ response });
    }
}
