export interface Summary {
    income: number;
    expense: number;
    net: number;
    savings_rate: number | null;
    transaction_count: number;
}

export interface MonthlyPoint {
    month: string;
    income: number;
    expense: number;
    net: number;
    expense_ma3: number | null;
}

export interface CategoryShare {
    category: string;
    amount: number;
    percentage: number;
}

export interface TopExpense {
    date: string;
    description: string;
    category: string;
    amount: number;
}
