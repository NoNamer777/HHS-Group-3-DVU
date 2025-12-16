import './table.css';

type DiapedisTableProps = {
    columns: string[]; // kolommen zoals: id, naam, datum
    data: Array<Record<string, unknown> | null>; // patient data
};

export default function DiapedisTable({ columns, data }: DiapedisTableProps) {
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
