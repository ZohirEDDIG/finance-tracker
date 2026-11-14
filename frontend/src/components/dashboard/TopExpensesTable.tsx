import type { TopExpense } from '@/types';
import { formatMoney } from '@/lib/format';

interface TopExpensesTableProps {
    data: TopExpense[];
    loading: boolean;
}

export default function TopExpensesTable({
    data,
    loading,
}: TopExpensesTableProps) {
    return (
        <section className='overflow-hidden rounded-xl border border-hero-fg bg-hero-bg'>
            <div className='border-b border-hero-fg p-5'>
                <h2 className='text-lg font-semibold'>Top expenses</h2>
            </div>

            {loading ? (
                <div className='space-y-4 p-5'>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className='h-8 animate-pulse rounded bg-hero-fg'
                        />
                    ))}
                </div>
            ) : data.length === 0 ? (
                <p className='p-8 text-center text-sm text-gray-500'>
                    No expenses found.
                </p>
            ) : (
                <div className='overflow-x-auto'>
                    <table className='w-full text-left text-sm'>
                        <thead className='bg-hero-bg text-gray-500'>
                            <tr>
                                <th className='px-5 py-3 font-medium'>Date</th>
                                <th className='px-5 py-3 font-medium'>
                                    Description
                                </th>
                                <th className='px-5 py-3 font-medium'>
                                    Category
                                </th>
                                <th className='px-5 py-3 text-right font-medium'>
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody className='divide-y divide-hero-fg'>
                            {data.map((expense, index) => (
                                <tr key={`${expense.date}-${index}`}>
                                    <td className='whitespace-nowrap px-5 py-4'>
                                        {expense.date}
                                    </td>
                                    <td className='min-w-40 px-5 py-4'>
                                        {expense.description || '—'}
                                    </td>
                                    <td className='px-5 py-4'>
                                        {expense.category}
                                    </td>
                                    <td className='whitespace-nowrap px-5 py-4 text-right font-semibold text-red-600'>
                                        {formatMoney(expense.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
