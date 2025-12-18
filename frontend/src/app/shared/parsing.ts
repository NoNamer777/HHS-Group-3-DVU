import {
    type ClassConstructor,
    type ClassTransformOptions,
    plainToInstance,
} from 'class-transformer';

const transformOptions: ClassTransformOptions = {
    enableImplicitConversion: true,
};

export function parse<T, C extends ClassConstructor<T> = ClassConstructor<T>>(
    target: C,
    value: unknown,
): T {
    return plainToInstance(target, value, transformOptions) as T;
}
