export const DiabetesTypes = {
    TYPE_1: 'Type 1',
    TYPE_2: 'Type 2',
    GESTATIONAL: 'Zwangerschap',
    OTHER: 'Anders',
} as const;

export type DiabetesType = (typeof DiabetesTypes)[keyof typeof DiabetesTypes];
