import { useMemo, useState } from 'react';
import SearchInputComponent from '../shared/search-input/search-input.component.tsx';
import TableComponent from '../shared/table/table.component.tsx';
import './dashboard.page.css';

const columns = ['id', 'name', 'email'];

const data = [
    { id: 1, name: 'Alice', email: 'a@test.com' },
    { id: 2, name: 'Bob', email: 'b@test.com' },
    { id: 3, name: 'Pietje Bell', email: 'b@test.com' },
    { id: 4, name: 'Mosselman', email: 'b@test.com' },
    { id: 5, name: 'Arie', email: 'b@test.com' },
];

export default function DashboardPage() {
    const [filters, setFilters] = useState<Record<string, string>>({});

    const handleFilterChange = (column: string, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [column]: value,
        }));
    };

    const filteredData = useMemo(() => {
        return data.filter((row) =>
            columns.every((column) => {
                const filterValue = filters[column];
                if (!filterValue) return true;

                const cellValue = (row as Record<string, unknown>)[column];
                return String(cellValue)
                    .toLowerCase()
                    .includes(filterValue.toLowerCase());
            }),
        );
    }, [filters]);

    return (
        <div>
            <h3 className="diapedis-header3">Patienten</h3>

            {/* Search row aligned to table columns via giving both the diapedis-table-wrapper css*/}
            <div
                className="diapedis-table-wrapper diapedis-search-row"
                style={{
                    gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                }}
            >
                {columns.map((column) => (
                    <SearchInputComponent
                        key={column}
                        column={column}
                        value={filters[column] ?? ''}
                        onChange={handleFilterChange}
                    />
                ))}
            </div>

            <TableComponent columns={columns} data={filteredData} />
        </div>
    );
}
