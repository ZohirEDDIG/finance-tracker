'use client';

import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';

function DashboardContent() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <main className='min-h-screen bg-hero-bg px-4 py-10'>
            <div className='mx-auto max-w-4xl'>
                <header className='flex items-center justify-between gap-4'>
                    <h1 className='text-2xl font-bold text-gray-400'>
                        Finance Tracker
                    </h1>

                    <button
                        onClick={logout}
                         className='w-fit bg-purple-900 border-b-4 border-purple-600 text-white px-4 py-2.5 rounded-lg'
                    >
                        Logout
                    </button>
                </header>

                <section className='mt-8 rounded-2xl border-2 border-violet-700 p-8 shadow-sm'>
                    <h2 className='text-2xl font-semibold text-white'>
                        Welcome, {user.username}!
                    </h2>

                    <p className='mt-2 text-gray-600'>
                        You're logged in. Your financial dashboard will appear
                        here.
                    </p>
                </section>
            </div>
        </main>
    );
}

export default function DashboardPage() {
    return (
        <RequireAuth>
            <DashboardContent />
        </RequireAuth>
    );
}
