'use client';

import { useState } from 'react';

import RequireAuth from '@/components/RequireAuth';
import DateRangeFilter from '@/components/dashboard/DateRangeFilter';
import SummaryCards from '@/components/dashboard/SummaryCards';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import CategoryChart from '@/components/dashboard/CategoryChart';
import TopExpensesTable from '@/components/dashboard/TopExpensesTable';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user, logout } = useAuth();

    const [dateRange, setDateRange] = useState({
        dateFrom: '',
        dateTo: '',
    });

    const {
        summary,
        monthly,
        categories,
        topExpenses,
        loading,
        error,
        refetch,
    } = useAnalytics(dateRange);

    return (
        <RequireAuth>
            <main className='min-h-screen space-y-6 bg-hero-bg p-4 text-gray-500 md:p-8'>
                <header className='flex flex-wrap items-center justify-between gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold'>Dashboard</h1>
                        <p className='text-sm text-gray-500'>
                            Welcome, {user?.username}
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className='rounded-lg border px-4 py-2 text-sm'
                    >
                        Logout
                    </button>
                </header>

                <DateRangeFilter
                    dateFrom={dateRange.dateFrom}
                    dateTo={dateRange.dateTo}
                    onChange={setDateRange}
                />

                {error && (
                    <div className='flex items-center justify-between rounded-lg bg-red-50 p-4 text-sm text-red-700'>
                        <p>{error}</p>
                        <button
                            onClick={refetch}
                            className='font-semibold underline'
                        >
                            Retry
                        </button>
                    </div>
                )}

                <SummaryCards summary={summary} loading={loading} />

                <MonthlyChart data={monthly} loading={loading} />

                <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
                    <CategoryChart data={categories} loading={loading} />
                    <TopExpensesTable data={topExpenses} loading={loading} />
                </div>
            </main>
        </RequireAuth>
    );
}
