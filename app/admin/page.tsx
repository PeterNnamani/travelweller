const metrics = [
    { label: 'Total students', value: '4,280' },
    { label: 'Applications', value: '1,620' },
    { label: 'Paid applications', value: '982' },
    { label: 'Pending payments', value: '39' },
    { label: 'Offers', value: '208' },
    { label: 'Revenue', value: '£98,200' }
];

export default function AdminPage() {
    return (
        <main className="container">
            <h1>Admin dashboard</h1>
            <div className="grid grid-3 mt">
                {metrics.map((metric) => (
                    <div className="card" key={metric.label}>
                        <div className="badge orange">Live</div>
                        <h3 style={{ marginTop: '12px' }}>{metric.value}</h3>
                        <p>{metric.label}</p>
                    </div>
                ))}
            </div>

            <div className="card mt">
                <h3>Administrative actions</h3>
                <ul>
                    <li>Add universities and scholarship opportunities</li>
                    <li>Edit deadlines and verify source data</li>
                    <li>Review applications and payment records</li>
                    <li>Track submission status and assign staff</li>
                </ul>
            </div>
        </main>
    );
}
