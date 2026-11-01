import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Finance Tracker',
    description: 'Manage your personal finances',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang='en'>
            <body>{children}</body>
        </html>
    );
}
