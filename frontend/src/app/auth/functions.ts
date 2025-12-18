import { StorageKeys, StorageService } from '../shared';

export function isAuthenticated() {
    const storageService = StorageService.instance();
    return Boolean(storageService.getItem(StorageKeys.ACCESS_TOKEN));
}
