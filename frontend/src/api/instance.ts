import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

const instance = <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const instance = axios.create({
        baseURL: 'http://localhost:8000/api',
    });

    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('je env'); // Of hoe je ook de token ophaalt

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    return instance.request<T>(config);
};

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
    const promise = instance({ ...config }).then((res) => res?.data as T);

    return promise;
};
