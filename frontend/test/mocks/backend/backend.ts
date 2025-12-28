import { type SetupWorker, setupWorker } from 'msw/browser';
import { resetMockDatabases } from '../db';
import { backendHandlers } from './handlers';

let worker: SetupWorker;

export function getWorker() {
    return worker;
}

export async function initializeWorker() {
    worker = setupWorker(...backendHandlers);

    await worker.start();
}

export function stopWorker() {
    worker.stop();
}

export function resetWorker() {
    worker.resetHandlers();
    resetMockDatabases();
}
