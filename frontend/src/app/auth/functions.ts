import { StorageKeys, storageService } from '../shared';
import { User } from './models.ts';

export function isAuthenticated() {
    return Boolean(storageService.getItem(StorageKeys.ACCESS_TOKEN));
}

export function getAuthenticatedUser() {
    if (!isAuthenticated()) return null;
    return storageService.getItem(StorageKeys.ACCESS_TOKEN) as User;
}
