import type { Summary } from '@/types';
import { formatMoney, formatPercent } from '@/lib/format';

interface SummaryCardsProps {
    summary: Summary | null;
    loading: boolean;
}

const cards = [
    { key: 'income', label: 'Income', color: 'text-green-600' },
    { key: 'expense', label: 'Expenses', color: 'text-red-600' },
] as const;

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
    if (loading) {
        return (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className='animate-pulse rounded-xl border border-hero-fg p-5'
                    >
                        <div className='h-4 w-24 rounded bg-gray-200' />
                        <div className='mt-4 h-8 w-32 rounded bg-gray-200' />
                    </div>
                ))}
            </div>
        );
    }

    if (!summary) return null;

    const netColor = summary.net >= 0 ? 'text-green-600' : 'text-red-600';

    const items = [
        ...cards.map((card) => ({
            label: card.label,
            value: formatMoney(summary[card.key]),
            color: card.color,
        })),
        {
            label: 'Net balance',
            value: formatMoney(summary.net),
            color: netColor,
        },
        {
            label: 'Savings rate',
            value: formatPercent(summary.savings_rate),
            color: 'text-blue-600',
        },
    ];

    return (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {items.map((item) => (
                <div
                    key={item.label}
                    className='rounded-xl border border-hero-fg bg-hero-bg p-5 shadow-sm'
                >
                    <p className='text-sm text-gray-500'>{item.label}</p>
                    <p className={`mt-3 text-2xl font-bold ${item.color}`}>
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
