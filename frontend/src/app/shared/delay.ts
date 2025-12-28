export async function delay(delayTime: number) {
    await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), delayTime),
    );
}
