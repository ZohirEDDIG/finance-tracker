from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Category(models.Model):

    class Kind(models.TextChoices):
        INCOME = 'income', 'Income'
        EXPENSE = 'expense', 'Expense'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    kind = models.CharField(
        max_length=10,
        choices=Kind.choices
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'name'],
                name='unique_category_name_per_user'
            )
        ]

    def __str__(self):
        return f'{self.name} ({self.kind})'


class Transaction(models.Model):

    class Kind(models.TextChoices):
        INCOME = 'income', 'Income'
        EXPENSE = 'expense', 'Expense'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    kind = models.CharField(
        max_length=10,
        choices=Kind.choices
    )
    date = models.DateField(db_index=True)
    description = models.CharField(
        max_length=255,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f'{self.date} - {self.kind} - {self.amount}'
