import re
from decimal import Decimal, InvalidOperation

def validate_amount(value):
    s = str(value).strip()

    if not s:
        raise ValueError('Amount cannot be empty')

    negative = '-' in s or (s.startswith('(') and s.endswith(')'))

    cleaned = re.sub(r'[^\d.]', '', s)

    try:
        amount = Decimal(cleaned)
    except InvalidOperation:
        raise ValueError(f'Invalid amount: {value}')

    return -amount if negative else amount