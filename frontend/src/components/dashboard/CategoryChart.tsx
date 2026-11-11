'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

import type { CategoryShare } from '@/types';
import { formatMoney } from '@/lib/format';

interface CategoryChartProps {
    data: CategoryShare[];
    loading: boolean;
}

const COLORS = [
    '#6366f1',
    '#06b6d4',
    '#f59e0b',
    '#10b981',
    '#ec4899',
    '#8b5cf6',
    '#f97316',
    '#64748b',
];

export default function CategoryChart({ data, loading }: CategoryChartProps) {
    if (loading) {
        return (
            <div className='h-80 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800' />
        );
    }

    return (
        <section className='rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900'>
            <h2 className='mb-6 text-lg font-semibold'>Expenses by category</h2>

            {data.length === 0 ? (
                <p className='py-20 text-center text-sm text-gray-500'>
                    No category data available.
                </p>
            ) : (
                <div className='flex flex-col items-center gap-6 sm:flex-row'>
                    <div className='h-64 w-full sm:w-1/2'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey='amount'
                                    nameKey='category'
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={3}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={entry.category}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    formatter={(value) =>
                                        formatMoney(Number(value ?? 0))
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className='w-full space-y-3 sm:w-1/2'>
                        {data.map((item, index) => (
                            <div
                                key={item.category}
                                className='flex items-center justify-between gap-3 text-sm'
                            >
                                <div className='flex min-w-0 items-center gap-2'>
                                    <span
                                        className='h-3 w-3 shrink-0 rounded-full'
                                        style={{
                                            backgroundColor:
                                                COLORS[index % COLORS.length],
                                        }}
                                    />
                                    <span className='truncate'>
                                        {item.category}
                                    </span>
                                </div>

                                <div className='shrink-0 text-right'>
                                    <p className='font-medium'>
                                        {formatMoney(item.amount)}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                        {item.percentage}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
