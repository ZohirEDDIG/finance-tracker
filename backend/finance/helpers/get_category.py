import pandas as pd
from ..models import Category


def get_category(user, name, kind):
    name = str(name).strip() if pd.notna(name) else ''

    if not name:
        name = (
            'Uncategorized Income'
            if kind == 'income'
            else 'Uncategorized Expense'
        )

    category = Category.objects.filter(
        user=user,
        name__iexact=name,
        kind=kind,
    ).first()

    if category:
        return category

    return Category.objects.create(
        user=user,
        name=name,
        kind=kind,
    )