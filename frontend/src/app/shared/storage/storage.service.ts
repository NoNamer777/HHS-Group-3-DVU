import { tryCatch } from '../try-catch.ts';
import type { StorageKey } from './storage-keys.ts';

export class StorageService {
    public static instance() {
        if (this._instance) return this._instance;
        this._instance = new StorageService();

        return this._instance;
    }
    private static _instance: StorageService;

    private readonly storage = localStorage;

    public getItem<T = unknown>(key: StorageKey) {
        const stored = this.storage.getItem(key);
        const { data: parsed, error } = tryCatch(() => JSON.parse(stored));

        if (error) {
            console.warn('Invalid JSON value stored. Removing stored value');
            this.removeItem(key);
            return null;
        }
        return parsed as T;
    }

    public setItem<T = unknown>(key: StorageKey, value: T) {
        this.storage.setItem(key, JSON.stringify(value));
    }

    public removeItem(key: StorageKey) {
        this.storage.removeItem(key);
    }

    public clear() {
        this.storage.clear();
    }
}
