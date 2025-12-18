import './table.component.css';

type Patient = Record<string, unknown>;

interface TableProps {
    /** e.g., id, name, date */
    columns: string[];

    /** Patient data */
    data: Patient[];
}

export default function TableComponent({ columns, data }: TableProps) {
    return (
        <div className="diapedis-table-wrapper">
            <table className="diapedis-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="no-data">
                                Geen gegevens beschikbaar
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => (
                            <tr key={i}>
                                {columns.map((col) => (
                                    <td key={col}>{String(row[col] ?? '')}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
