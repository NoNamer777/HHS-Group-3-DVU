import type { ChangeEvent } from 'react';
import './searchinput.css';

type SearchInputProps = {
    column: string;
    value: string;
    onChange: (column: string, value: string) => void;
    placeholder?: string;
};

export default function SearchInput({
    column,
    value,
    onChange,
    placeholder,
}: SearchInputProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(column, e.target.value);
    };

    return (
        <input
            type="text"
            value={value}
            placeholder={placeholder ?? `Zoek op ${column}`}
            onChange={handleChange}
            className="diapedis-search-input"
        />
    );
}
