import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Travel Lifestyle Blog • Wakawaka Doctor',
    description: 'Europe-focused university and scholarship application platform.',
    icons: {
        icon: '/browser-logo.jpg'
    }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
