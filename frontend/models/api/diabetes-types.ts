export const DiabetesTypes = {
    TYPE_1: 'Diabetes - type 1',
    TYPE_2: 'Diabetes - type 2',
    GESTATIONAL: 'Diabetes - zwangerschap',
    OTHER: 'Diabetes - anders',
} as const;

export type DiabetesType = (typeof DiabetesTypes)[keyof typeof DiabetesTypes];
