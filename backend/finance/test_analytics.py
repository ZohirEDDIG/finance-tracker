from unittest import result

import pytest
from decimal import Decimal
from datetime import date
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from finance.models import Category, Transaction
from finance.services.analytics import (
    get_summary,
    get_monthly,
    get_by_category,
    get_top_expenses,
)


User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='user1',
        password='User@123?',
    )

@pytest.fixture
def another_user(db):
    return User.objects.create_user(
        username='user2',
        password='User@123?',
    )

@pytest.fixture
def client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

def create_transaction(user, kind, amount, transaction_date,
                       category_name, description='Test transaction'):

    category, _ = Category.objects.get_or_create(
        user=user,
        name=category_name,
        kind=kind
    )

    return Transaction.objects.create(
        user=user,
        kind=kind,
        category=category,
        amount=Decimal(str(amount)),
        date=transaction_date,
        description=description,
    )

@pytest.fixture
def sample_transactions(user):
    create_transaction(
        user, 'income', '1000.00',
        date(2026, 1, 5), 'Salary', 'January salary'
    )
    create_transaction(
        user, 'expense', '200.00',
        date(2026, 1, 10), 'Food', 'Groceries'
    )
    create_transaction(
        user, 'expense', '300.00',
        date(2026, 1, 15), 'Transport', 'Bus'
    )

    create_transaction(
        user, 'income', '2000.00',
        date(2026, 3, 5), 'Salary', 'March salary'
    )
    create_transaction(
        user, 'expense', '500.00',
        date(2026, 3, 10), 'Food', 'Shopping'
    )

@pytest.mark.django_db
def test_summary(sample_transactions, user):
    queryset = Transaction.objects.filter(user=user)

    result = get_summary(queryset)
    print(result)
    assert result == {
        'income': 3000.0,
        'expense': 1000.0,
        'net': 2000.0,
        'savings_rate': 66.67,
        'transaction_count': 5,
    }

@pytest.mark.django_db
def test_savings_rate_is_none_when_no_income(user):
    create_transaction(
        user, 'expense', '200.00',
        date(2026, 1, 10), 'Food',
    )

    result = get_summary(Transaction.objects.filter(user=user))

    assert result['income'] == 0.0
    assert result['savings_rate'] is None

@pytest.mark.django_db
def test_monthly_includes_gap_month(sample_transactions, user):
    queryset = Transaction.objects.filter(user=user)

    result = get_monthly(queryset)

    assert len(result) == 3
    
    assert result[0]['month'] == '2026-01'
    assert result[1]['month'] == '2026-02'
    assert result[2]['month'] == '2026-03'

@pytest.mark.django_db
def test_by_category_percentage(user):
    create_transaction(
        user, 'expense', '200.00',
        date(2026, 1, 10), 'Food',
    )

    create_transaction(
        user, 'expense', '300.00',
        date(2026, 1, 15), 'Transport',
    )

    result = get_by_category(Transaction.objects.filter(user=user))

    assert result == [
        {
            'category': 'Transport',
            'amount': 300.0,
            'percentage': 60.0,
        },
        {
            'category': 'Food',
            'amount': 200.0,
            'percentage': 40.0,
        },
    ]

@pytest.mark.django_db
def test_top_expenses_order_and_limit(user):
    create_transaction(
        user, 'expense', '100.00',
        date(2026, 1, 1), 'Food', 'Small expense'
    )
    create_transaction(
        user, 'expense', '500.00',
        date(2026, 1, 2), 'Rent', 'Rent'
    )
    create_transaction(
        user, 'expense', '300.00',
        date(2026, 1, 3), 'Shopping', 'Shopping'
    )

    result = get_top_expenses(Transaction.objects.filter(user=user), limit=2)

    assert len(result) == 2
    assert result[0]['amount'] == 500.0
    assert result[1]['amount'] == 300.0

@pytest.mark.django_db
def test_empty_user_returns_zero_or_empty_results(user):
    queryset = Transaction.objects.filter(user=user)

    assert get_summary(queryset) == {
        'income': 0.0,
        'expense': 0.0,
        'net': 0.0,
        'savings_rate': None,
        'transaction_count': 0,
    }

    assert get_monthly(queryset) == []
    assert get_by_category(queryset) == []
    assert get_top_expenses(queryset) == []

@pytest.mark.django_db
def test_summary_api(client, sample_transactions):
    response = client.get('/api/analytics/summary/')

    assert response.status_code == 200
    assert response['Content-Type'].startswith('application/json')

    data = response.json()

    assert data['income'] == 3000.0
    assert data['expense'] == 1000.0
    assert data['net'] == 2000.0

@pytest.mark.django_db
def test_analytics_user_isolation(client, user, another_user):
    create_transaction(
        user, 'income', '1000.00',
        date(2026, 1, 5), 'Salary'
    )

    create_transaction(
        another_user, 'income', '9000.00',
        date(2026, 1, 5), 'Salary'
    )

    response = client.get('/api/analytics/summary/')

    assert response.status_code == 200

    data = response.json()

    assert data['income'] == 1000.0
    assert data['transaction_count'] == 1

@pytest.mark.django_db
def test_empty_user_analytics_api(client):
    response = client.get('/api/analytics/summary/')

    assert response.status_code == 200

    data = response.json()

    assert data['income'] == 0.0
    assert data['expense'] == 0.0
    assert data['transaction_count'] == 0

@pytest.mark.django_db
def test_monthly_api_returns_json(client, sample_transactions):
    response = client.get('/api/analytics/monthly/')

    assert response.status_code == 200
    assert response['Content-Type'].startswith('application/json')

    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 3
    assert data[1]['month'] == '2026-02'
