export type IdGenerator<T = string> = () => T;

export const uuidGenerator: IdGenerator = () => crypto.randomUUID();
