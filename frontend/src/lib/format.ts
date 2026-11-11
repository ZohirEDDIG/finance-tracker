export function formatMoney(value: number): string {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
    }).format(value);
}

export function formatMonth(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);

    const date = new Date(year, monthNumber - 1);

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function formatPercent(value: number | null): string {
    if (value === null) {
        return '—';
    }

    return `${value.toFixed(2)}%`;
}
