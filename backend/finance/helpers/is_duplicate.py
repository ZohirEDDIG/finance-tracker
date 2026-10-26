from ..models import Transaction

def is_duplicate(user, date, description, amount):
    return Transaction.objects.filter(
        user=user,
        date=date,
        description__iexact=description,
        amount=amount
    ).exists()