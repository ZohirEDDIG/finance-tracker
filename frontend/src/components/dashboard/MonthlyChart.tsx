'use client';

import {
    ResponsiveContainer,
    ComposedChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    Line,
} from 'recharts';

import type { MonthlyPoint } from '@/types';
import { formatMoney, formatMonth } from '@/lib/format';

interface MonthlyChartProps {
    data: MonthlyPoint[];
    loading: boolean;
}

export default function MonthlyChart({ data, loading }: MonthlyChartProps) {
    if (loading) {
        return (
            <div className='h-80 animate-pulse rounded-xl bg-hero-bg ' />
        );
    }

    return (
        <section className='rounded-xl border border-hero-fg bg-hero-bg p-5'>
            <h2 className='mb-6 text-lg font-semibold'>Monthly overview</h2>

            {data.length === 0 ? (
                <p className='py-20 text-center text-sm text-gray-500'>
                    No monthly data available.
                </p>
            ) : (
                <div className='h-80 w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <ComposedChart data={data}>
                            <CartesianGrid
                                strokeDasharray='3 3'
                                vertical={false}
                            />

                            <XAxis
                                dataKey='month'
                                tickFormatter={formatMonth}
                                tick={{ fontSize: 12 }}
                            />

                            <YAxis
                                tickFormatter={(value) => `${value}`}
                                tick={{ fontSize: 12 }}
                            />

                            <Tooltip
                                labelFormatter={(label) =>
                                    formatMonth(String(label))
                                }
                                formatter={(value) =>
                                    formatMoney(Number(value ?? 0))
                                }
                                contentStyle={{
                                    backgroundColor: '#1b102b',
                                    border: '1px solid #374151',
                                    borderRadius: '12px',
                                }}
                            />

                            <Legend />

                            <Bar
                                dataKey='income'
                                name='Income'
                                fill='#16a34a'
                                radius={[4, 4, 0, 0]}
                                barSize={15}
                            />

                            <Bar
                                dataKey='expense'
                                name='Expenses'
                                fill='#dc2626'
                                radius={[4, 4, 0, 0]}
                                barSize={45}
                            />

                            <Line
                                type='monotone'
                                dataKey='expense_ma3'
                                name='3-month expense average'
                                stroke='#2563eb'
                                strokeWidth={2}
                                dot={false}
                                connectNulls={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}
