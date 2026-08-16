export default function ApplicationPage() {
    return (
        <main className="container">
            <h1>Application workspace</h1>
            <div className="card">
                <h3>Application overview</h3>
                <div className="grid grid-3">
                    <div><strong>University</strong><p>University of Manchester</p></div>
                    <div><strong>Program</strong><p>MSc Data Science</p></div>
                    <div><strong>Country</strong><p>United Kingdom</p></div>
                    <div><strong>Intake</strong><p>September 2027</p></div>
                    <div><strong>Deadline</strong><p>15 Dec 2026</p></div>
                    <div><strong>Status</strong><p>Payment pending</p></div>
                </div>
            </div>

            <div className="card mt">
                <h3>Payment requirement</h3>
                <p>£100 application/service fee must be paid and verified server-side before the application form is unlocked.</p>
                <button>Pay via Paystack</button>
            </div>

            <div className="card mt">
                <h3>Application sections</h3>
                <ul>
                    <li>Personal information</li>
                    <li>Contact information</li>
                    <li>Passport</li>
                    <li>Education</li>
                    <li>English test</li>
                    <li>Work experience</li>
                    <li>Personal statement</li>
                    <li>References</li>
                    <li>Documents</li>
                    <li>Review</li>
                    <li>Submission</li>
                </ul>
            </div>
        </main>
    );
}
