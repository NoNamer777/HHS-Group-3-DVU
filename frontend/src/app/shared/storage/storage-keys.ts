export const StorageKeys = {
    ACCESS_TOKEN: 'access_token',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
