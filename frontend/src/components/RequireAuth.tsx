'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [loading, user, router]);

    if (loading || !user) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div
                    role='status'
                    aria-label='Loading'
                    className='h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600'
                />
            </div>
        );
    }

    return <>{children}</>;
}
