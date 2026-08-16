const opportunities = [
    {
        university: 'University of Manchester',
        program: 'MSc Data Science',
        country: 'United Kingdom',
        deadline: '2026-12-15',
        scholarship: 'Global Futures Scholarship'
    },
    {
        university: 'Technical University of Munich',
        program: 'MSc Computer Science',
        country: 'Germany',
        deadline: '2026-11-30',
        scholarship: 'DAAD Scholarship'
    }
];

export default function SearchPage() {
    return (
        <main className="container">
            <h1>Opportunity search</h1>
            <div className="card" style={{ marginTop: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px' }}>
                    <div>
                        <label className="label">Country</label>
                        <input className="input" placeholder="UK, Germany, EU" />
                    </div>
                    <div>
                        <label className="label">Degree</label>
                        <select className="select">
                            <option>Bachelor</option>
                            <option>Master</option>
                            <option>PhD</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Field</label>
                        <input className="input" placeholder="Engineering, Business" />
                    </div>
                    <button>Search</button>
                </div>
            </div>

            <table className="table mt" style={{ background: 'white' }}>
                <thead>
                    <tr>
                        <th>University</th>
                        <th>Program</th>
                        <th>Country</th>
                        <th>Deadline</th>
                        <th>Scholarship</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {opportunities.map((item) => (
                        <tr key={item.program}>
                            <td>{item.university}</td>
                            <td>{item.program}</td>
                            <td>{item.country}</td>
                            <td>{item.deadline}</td>
                            <td>{item.scholarship}</td>
                            <td><a href="/applications/1" className="button">Start Application</a></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
