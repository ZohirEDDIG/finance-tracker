import pytest
from datetime import date
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Category, Transaction

User = get_user_model()

@pytest.fixture()
def users(db):
    user_a = User.objects.create_user(
        username='user_a',
        password='Test@123?'
    )

    user_b = User.objects.create_user(
        username='user_b',
        password='Test@123?'
    )

    return user_a, user_b

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def category(users):
    user_a, _ = users
    return Category.objects.create(
        user=user_a,
        name='Food',
        kind='expense',
    )

@pytest.fixture
def transaction(users, category):
    user_a, _ = users
    return Transaction.objects.create(
        user=user_a,
        category=category,
        amount='100.00',
        kind='expense',
        date=date(2026, 2, 15),
        description='Groceries'
    )


@pytest.mark.django_db
def test_create_category(api_client, users):
    user_a, _ = users
    api_client.force_authenticate(user=user_a)

    response = api_client.post(
        reverse('category-list'),
        {'name': 'Salary', 'kind': 'income'},
        format='json'
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Category.objects.filter(
        user=user_a,
        name='Salary'
    ).exists()


def test_create_transaction(api_client, users, category):
    user_a, _ = users
    api_client.force_authenticate(user=user_a)

    response = api_client.post(
        reverse('transaction-list'),
        {
            'category':  category.id,
            'amount': '250.00',
            'kind': 'expense',
            'date': '2026-02-20',
            'description': 'Weekly groceries',

        },
        format='json'
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Transaction.objects.filter(
        user=user_a,
        amount=250.00,
    )


@pytest.mark.django_db
def test_negative_rejected(api_client, users, category):
    user_a, _ = users
    api_client.force_authenticate(user=user_a)

    response = api_client.post(
        reverse('transaction-list'),
        {
            'category': category.id,
            'amount': '-250.00',
            'kind': 'expense',
            'date': '2026-02-20',
            'description': 'Weekly groceries',

        },
        format='json'
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_user_isolation(api_client, users, transaction):
    user_a, user_b = users
    transaction_url = reverse(
        'transaction-detail',
        kwargs={'pk': transaction.id}
    )

    api_client.force_authenticate(user=user_b)

    response = api_client.get(reverse('transaction-list'))

    assert response.status_code == status.HTTP_200_OK
    assert response.data['results'] == []

    response = api_client.get(transaction_url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

    response = api_client.patch(
        transaction_url,
        {
            'description': 'Unauthorized edit'
        },
        format='json'
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

    response = api_client.delete(transaction_url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

    transaction.refresh_from_db()
    assert transaction.description == 'Groceries'


@pytest.mark.django_db
def test_cannot_use_another_user_castegory(api_client, users):
    user_a, user_b = users

    category_b = Category.objects.create(
        user=user_b,
        name='Private Food',
        kind='expense',
    )

    api_client.force_authenticate(user=user_a)

    response = api_client.post(
        reverse('transaction-list'),
        {
            'category': category_b.id,
            'amount': '50.00',
            'kind': 'expense',
            'date': '2026-02-20',
            'description': 'Test ownership',
        }
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_date_filter(api_client, users, category):
    user_a, _ = users

    Transaction.objects.create(
        user=user_a,
        category=category,
        amount='100.00',
        kind='expense',
        date=date(2026, 1, 10),
        description='January'
    )
    Transaction.objects.create(
        user=user_a,
        category=category,
        amount='200.00',
        kind='expense',
        date=date(2026, 2, 15),
        description='February'
    )
    Transaction.objects.create(
        user=user_a,
        category=category,
        amount='300.00',
        kind='expense',
        date=date(2026, 4, 5),
        description='April'
    )

    api_client.force_authenticate(user=user_a)

    response = api_client.get(
        reverse('transaction-list'),
        {
            'date_from': '2026-02-01',
            'date_to': '2026-03-31',
        }
    )

    assert response.status_code == status.HTTP_200_OK

    assert len(response.data['results']) == 1
    assert response.data['results'][0]['description'] == 'February'



@pytest.mark.django_db
def test_cannot_delete_category_with_transactions(api_client, users, category, transaction):
    user_a, _ = users
    api_client.force_authenticate(user=user_a)

    response = api_client.delete(
        reverse(
            'category-detail',
            kwargs={'pk': category.id}
        )
    )

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.data['detail'] == 'This category has transactions and cannot be deleted.'

    assert Category.objects.filter(pk=category.id).exists()









