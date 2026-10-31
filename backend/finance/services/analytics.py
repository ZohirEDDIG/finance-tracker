import pandas as pd
import numpy as np

COLUMNS = [
    'date',
    'amount',
    'kind',
    'category__name',
    'description'
]

def load_dataframe(queryset) -> pd.DataFrame:
    records = queryset.values(*COLUMNS)
    df = pd.DataFrame(records, columns=COLUMNS)

    if df.empty:
        return df

    df['amount'] = df['amount'].astype(float)
    df['date'] = pd.to_datetime(df['date'])

    return df

def clean(value):
    if value is None or value is pd.NaT or value is pd.NA:
        return None

    if isinstance(value, (float, np.floating)):
        if not np.isfinite(value):
            return None
        return round(float(value), 2)

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, pd.Period):
        return str(value)

    if isinstance(value, pd.Timestamp):
        return value.strftime('%Y-%m-%d')

    return value

def get_summary(queryset):
    df = load_dataframe(queryset)

    if df.empty:
        return {
            'income': 0.0,
            'expense': 0.0,
            'net': 0.0,
            'savings_rate': None,
            'transaction_count': 0
        }

    income = df.loc[df['kind'] == 'income', 'amount'].sum()
    expense = df.loc[df['kind'] == 'expense', 'amount'].sum()
    net = income - expense

    savings_rate = (
        (net / income ) * 100
        if income != 0
        else None
    )

    return {
        'income': clean(income),
        'expense': clean(expense),
        'net': clean(net),
        'savings_rate': clean(savings_rate),
        'transaction_count': int(len(df))
    }

def get_monthly(queryset):
    df = load_dataframe(queryset)

    if df.empty:
        return []

    df['month'] = df['date'].dt.to_period('M')

    monthly = df.pivot_table(
        index='month',
        columns='kind',
        values='amount',
        aggfunc='sum',
        fill_value=0,
    )

    monthly = monthly.reindex(
        columns=['income', 'expense'],
        fill_value=0
    )

    all_months = pd.period_range(
        start=monthly.index.min(),
        end=monthly.index.max(),
        freq='M',
    )

    monthly = monthly.reindex(all_months, fill_value=0)

    monthly['net'] = monthly['income'] - monthly['expense']

    monthly['expense_ma3'] = monthly['expense'].rolling(window=3).mean()

    result = []

    for month, row in monthly.iterrows():
        result.append({
            'month': str(month),
            'income': clean(row['income']),
            'expense': clean(row['expense']),
            'net': clean(row['net']),
            'expense_ma3': clean(row['expense_ma3']),
        })

    return result


def get_by_category(queryset, kind='expense'):
    df = load_dataframe(queryset)

    if df.empty:
        return []

    filtered = df.loc[df['kind'] == kind].copy()

    if filtered.empty:
        return []

    grouped = (
        filtered.groupby('category__name')['amount']
        .sum()
        .sort_values(ascending=False)
    )

    total = grouped.sum()

    result = []

    for category, amount in grouped.items():
        percentage = (amount / total * 100) if total else 0
        

        result.append({
            'category': category or 'Uncategorized',
            'amount': clean(amount),
            'percentage': round(float(percentage), 1),
        })

    return result

def get_top_expenses(queryset, limit = 5):
    df = load_dataframe(queryset)

    if df.empty:
        return []

    expenses = df.loc[df['kind'] == 'expense'].nlargest(
        limit,
        'amount',
    )

    result = []

    for _, row in expenses.iterrows():
        result.append({
            'date': row['date'].strftime('%Y-%m-%d'),
            'description': row['description'],
            'category': row['category__name'] or 'Uncategorized',
            'amount': clean(row['amount']),
        })

    return result