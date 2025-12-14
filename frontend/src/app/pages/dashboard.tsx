import DiapedisTable from '../shared/components/table';
const columns = ['id', 'name', 'email']; // from backend

const data = [
    { id: 1, name: 'Alice', email: 'a@test.com' },
    { id: 2, name: 'Bob', email: 'b@test.com' },
];
export default function Dashboard() {
    return (
        <div>
            <h3 className="diapedis-header3">Patienten</h3>
            <DiapedisTable columns={columns} data={data} />
        </div>
    );
}
