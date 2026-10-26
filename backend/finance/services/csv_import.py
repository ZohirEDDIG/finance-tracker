import pandas as pd
from django.db import transaction as db_transaction
from finance.models import Transaction
from ..validators.validate_amount import validate_amount
from ..helpers.is_duplicate import is_duplicate
from ..helpers.get_category import get_category


class CSVImportError(Exception):
    pass

def import_transactions(user, file):


    try:
        df = pd.read_csv(file, dtype=str)

    except pd.errors.EmptyDataError:
        raise CSVImportError('The CSV file is empty.')

    except pd.errors.ParserError:
        raise CSVImportError('Could not read the CSV file.')

    if df.empty and len(df.columns) == 0:
        raise CSVImportError('The CSV file has no columns.')

    df.columns = df.columns.str.strip().str.lower()

    required_columns = {'date', 'description', 'amount'}
    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise CSVImportError(
            'Missing required columns: '
            + ', '.join(sorted(missing_columns))
        )


    df['_row'] = range(2, len(df) + 2)

    df = df.dropna(
        subset=['date', 'description', 'amount'],
        how='all',
    )

    report = {
        'imported': 0,
        'skipped_duplicates': 0,
        'errors': [],
    }

    pending_transactions = []
    seen = set()

    for _, row in df.iterrows():
        row_number = int(row['_row'])
        
        raw_date = row['date']
        raw_description = row['description']
        raw_amount = row['amount']

        if (
            pd.isna(raw_date)
            and pd.isna(raw_description)
            and pd.isna(raw_amount)
        ):
            continue

        description = (
            str(row['description']).strip()
            if pd.notna(row['description'])
            else ''
        )
        
        if not description:
            report['errors'].append({
                'row': row_number,
                'reason': 'Description cannot be empty.',
            })
            continue

        try:
            amount = validate_amount(raw_amount)
        except ValueError:
            report['errors'].append({
                'row': row_number,
                'reason': 'Invalid amount.',
            })

        if amount == 0:
            report['errors'].append({
                'row': row_number,
                'reason': 'Amount cannot be 0.',
            })
            continue

        kind = 'income' if amount > 0 else 'expense'
        amount = abs(amount)

        if pd.isna(raw_date) or not str(raw_date).strip():
            report['errors'].append({
                'row': row_number,
                'reason': 'Date cannot be empty.',
            })
            continue

        parsed_date = pd.to_datetime(raw_date, errors='coerce', dayfirst=True)

        if pd.isna(parsed_date):
            report['errors'].append({
                'row': row_number,
                'reason': 'Invalid date.',
            })
            continue

        date = parsed_date

        raw_category = row.get('category', '')
        category_name = (
            str(raw_category).strip()
            if pd.notna(raw_category)
            else ''
        )

        normalized_description = description.casefold()

        key = (
            date,
            normalized_description,
            amount,
        )

        if key in seen:
            report['skipped_duplicates'] += 1
            continue

        seen.add(key)

        if is_duplicate(user, date, description, amount):
            report['skipped_duplicates'] += 1
            continue
        
        pending_transactions.append({
            'date': date,
            'description': description,
            'amount': amount,
            'kind': kind,
            'category_name': category_name,
            'row': row_number,
        })

    try:
         with db_transaction.atomic():
             transactions_to_create = []

             category_cache = {}

             for item in pending_transactions:
                category_name = item['category_name']

                cache_key = (
                    category_name.casefold(),
                    item['kind']
                )

                if cache_key not in category_cache:
                    category_cache[cache_key] = get_category(
                        user,
                        category_name,
                        item['kind'],
                    )

                transactions_to_create.append(
                    Transaction(
                        user=user,
                        category=category_cache[cache_key],
                        date=item['date'],
                        description=item['description'],
                        amount=item['amount'],
                        kind=item['kind'],
                    )
                )

             Transaction.objects.bulk_create(transactions_to_create)

             report['imported'] = len(transactions_to_create)

    except Exception:
        report['imported'] = 0
        report['errors'].append({
            'row': 1,
            'reason': (
                'Import failed while saving transactions. '
                'No transactions were imported.'
            ),
        })
    return report










