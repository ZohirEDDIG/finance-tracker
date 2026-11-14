'use client';

import { useEffect, useState } from 'react';

interface DateRangeFilterProps {
    dateFrom: string;
    dateTo: string;
    onChange: (range: { dateFrom: string; dateTo: string }) => void;
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function DateRangeFilter({
    dateFrom,
    dateTo,
    onChange,
}: DateRangeFilterProps) {
    const [from, setFrom] = useState(dateFrom);
    const [to, setTo] = useState(dateTo);
    const [error, setError] = useState('');

    useEffect(() => {
        setFrom(dateFrom);
        setTo(dateTo);
    }, [dateFrom, dateTo]);

    function updateRange(nextFrom: string, nextTo: string) {
        setFrom(nextFrom);
        setTo(nextTo);

        if (nextFrom && nextTo && nextFrom > nextTo) {
            setError('The start date must be before or equal to the end date.');
            return;
        }

        setError('');
        onChange({ dateFrom: nextFrom, dateTo: nextTo });
    }

    function applyPreset(preset: string) {
        const today = new Date();
        const end = formatDate(today);

        if (preset === 'all') {
            updateRange('', '');
            return;
        }

        if (preset === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            updateRange(formatDate(start), end);
            return;
        }

        if (preset === '3months') {
            const start = new Date(
                today.getFullYear(),
                today.getMonth() - 2,
                1,
            );
            updateRange(formatDate(start), end);
            return;
        }

        if (preset === 'year') {
            const start = new Date(today.getFullYear(), 0, 1);
            updateRange(formatDate(start), end);
        }
    }

    function reset() {
        updateRange('', '');
    }

    return (
        <section className='rounded-xl border border-hero-fg bg-hero-bg p-4 shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <h2 className='font-semibold'>Date range</h2>

                <div className='flex flex-wrap gap-2'>
                    <button
                        onClick={() => applyPreset('month')}
                        className='border border-gray-600 p-2 rounded-md shadow-md transition hover:border-hero-fg'
                    >
                        This month
                    </button>
                    <button
                        onClick={() => applyPreset('3months')}
                        className='border border-gray-600 p-2 rounded-md shadow-md transition hover:border-hero-fg'
                    >
                        Last 3 months
                    </button>
                    <button
                        onClick={() => applyPreset('year')}
                        className='border border-gray-600 p-2 rounded-md shadow-md transition hover:border-hero-fg'
                    >
                        This year
                    </button>
                    <button
                        onClick={() => applyPreset('all')}
                        className='border border-gray-600 p-2 rounded-md shadow-md transition hover:border-hero-fg'
                    >
                        All time
                    </button>
                </div>
            </div>

            <div className='mt-4 flex flex-wrap items-end gap-3'>
                <label className='flex flex-col gap-1 text-sm'>
                    <span className='text-gray-500'>From</span>
                    <input
                        type='date'
                        value={from}
                        onChange={(e) => updateRange(e.target.value, to)}
                        className='border border-gray-600 p-2 rounded-md shadow-md transition hover:border-hero-fg'
                    />
                </label>

                <label className='flex flex-col gap-1 text-sm'>
                    <span className='text-gray-500'>To</span>
                    <input
                        type='date'
                        value={to}
                        onChange={(e) => updateRange(from, e.target.value)}
                        className='border border-gray-600 p-2 rounded-md shadow-md transition hover:border-hero-fg'
                    />
                </label>

                <button
                    onClick={reset}
                    className='border border-gray-600 p-2 rounded-md shadow-md transition hover:border-hero-fg'
                >
                    Reset
                </button>
            </div>

            {error && (
                <p className='mt-2 text-sm text-red-600' role='alert'>
                    {error}
                </p>
            )}
        </section>
    );
}
