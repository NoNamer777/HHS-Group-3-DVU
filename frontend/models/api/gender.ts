export const Genders = {
    MALE: 'Man',
    FEMALE: 'Vrouw',
    OTHER: 'Anders',
} as const;

export type Gender = (typeof Genders)[keyof typeof Genders];

export function genderAttribute(value: unknown) {
    return (
        Object.values(Genders).find((gender) => gender === value) ??
        Genders.MALE
    );
}

export const GENDER_OPTIONS = [
    { value: Genders.MALE, label: 'Man' },
    { value: Genders.FEMALE, label: 'Vrouw' },
    { value: Genders.OTHER, label: 'Anders' },
] as const;
