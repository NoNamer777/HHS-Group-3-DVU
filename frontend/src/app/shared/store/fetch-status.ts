export const FetchStatuses = {
    IDLE: 'idle',
    PENDING: 'pending',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
} as const;

export type FetchStatus = (typeof FetchStatuses)[keyof typeof FetchStatuses];
