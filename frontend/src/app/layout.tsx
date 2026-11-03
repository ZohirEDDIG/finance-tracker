import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
    title: 'Finance Tracker',
    description: 'Manage your personal finances',
};


export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang='en' className={jetbrainsMono.className}>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
