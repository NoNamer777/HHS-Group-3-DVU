import { type SetupWorker, setupWorker } from 'msw/browser';
import { doctorHandlers, patientHandlers } from './handlers';

let worker: SetupWorker;

export function getWorker() {
    return worker;
}

export async function initializeWorker() {
    worker = setupWorker(...doctorHandlers, ...patientHandlers);

    await worker.start();
}

export function stopWorker() {
    worker.stop();
}

export function resetWorker() {
    worker.resetHandlers();
}
