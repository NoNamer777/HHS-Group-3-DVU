import { parse, StorageKeys, storageService } from '../shared';
import { User } from './models.ts';

export function isAuthenticated() {
    return Boolean(storageService.getItem(StorageKeys.ACCESS_TOKEN));
}

export function getAuthenticatedUser() {
    if (!isAuthenticated()) return null;
    const storedValue = storageService.getItem(StorageKeys.ACCESS_TOKEN);

    return parse<User>(User, storedValue);
}
