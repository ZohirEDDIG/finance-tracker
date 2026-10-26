from urllib import response

import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Transaction

IMPORT_URL = '/api/transactions/import/'
TRANSACTIONS_URL = '/api/transactions/'

@pytest.fixture
def user(db):
    User = get_user_model()
    return User.objects.create_user(
        username='testuser',
        password='Test@123',
    )

@pytest.fixture
def another_user(db):
    User = get_user_model()
    return User.objects.create_user(
        username='testuser2',
        password='Test@123',
    )

@pytest.fixture
def client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

def make_csv(content, filename='test.csv'):
    return SimpleUploadedFile(
        filename,
        content.encode('utf-8'),
        content_type='text/csv',
    )

@pytest.mark.django_db
def test_valid_csv_imports_transactions(client, user):
    file = make_csv(
        'date,description,amount\n'
        '2026-01-05,Coffee,-3.50\n'
        '2026-01-06,Salary,1500.00\n'
    )

    response = client.post(
        IMPORT_URL,
        { 'file': file },
        format='multipart',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['imported'] == 2
    assert response.data['skipped_duplicates'] == 0
    assert response.data['errors'] == []
    assert Transaction.objects.filter(user=user).count() == 2

@pytest.mark.django_db
def test_amount_sign_determines_transaction_kind(client, user):
    file = make_csv(
        'date,description,amount\n'
        '2026-01-05,Coffee,-3.50\n'
        '2026-01-06,Salary,1500.00\n'
    )

    response = client.post(
        IMPORT_URL,
        { 'file': file },
        format='multipart',
    )

    assert response.status_code == status.HTTP_201_CREATED

    expense = Transaction.objects.get(
        user=user,
        description='Coffee',
    )

    income = Transaction.objects.get(
        user=user,
        description='Salary',
    )

    assert expense.kind == 'expense'
    assert expense.amount == '3.50' or expense.amount == 3.50

    assert income.kind == 'income'
    assert income.amount == '1500.00' or income.amount == 1500.00

@pytest.mark.django_db
def test_invalid_data_reported_without_crashing(client, user):
    file = make_csv(
        'date,description,amount\n'
        'not-a-date,Coffee,-3.50\n'
        '2026-01-06,Salary,1500.00\n'
    )

    response = client.post(
        IMPORT_URL,
        { 'file': file },
        format='multipart',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['imported'] == 1
    assert len(response.data['errors']) == 1
    assert response.data['errors'][0]['row'] == 2
    assert response.data['errors'][0]['reason'] == 'Invalid date.'

@pytest.mark.django_db
def test_importing_same_file_twice_skips_duplicates(client, user):
    csv_content = (
        'date,description,amount\n'
        '2026-01-05,Coffee,-3.50\n'
    )

    first_response = client.post(
        IMPORT_URL,
        { 'file': make_csv(csv_content) },
        format='multipart',
    )

    second_response = client.post(
        IMPORT_URL,
        { 'file': make_csv(csv_content) },
        format='multipart',
    )

    assert first_response.status_code == status.HTTP_201_CREATED
    assert first_response.data['imported'] == 1

    assert second_response.status_code == status.HTTP_200_OK
    assert second_response.data['imported'] == 0
    assert second_response.data['skipped_duplicates'] == 1

    assert Transaction.objects.filter(user=user).count() == 1

@pytest.mark.django_db
def test_missing_columns_returns_400(client, user):
    file = make_csv(
        'date,description\n'
        '2026-01-05,Coffee\n'
    )

    response = client.post(
        IMPORT_URL,
        { 'file': file },
        format='multipart',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'detail' in response.data

@pytest.mark.django_db
def test_non_csv_file_returns_400(client):
    file = make_csv(
        'This is not a CSV transaction file.',
        filename='test.txt',
    )

    response = client.post(
        IMPORT_URL,
        { 'file': file },
        format='multipart',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'detail' in response.data

@pytest.mark.django_db
def test_transactions_belong_to_the_correct_user(client, user, another_user):
    file = make_csv(
        'date,description,amount\n'
        '2026-01-05,Coffee,-3.50\n'
    )

    response = client.post(
        IMPORT_URL,
        {'file': file},
        format='multipart',
    )

    assert response.status_code == status.HTTP_201_CREATED

    transaction = Transaction.objects.get(description='Coffee')

    assert transaction.user == user
    assert Transaction.objects.filter(user=another_user).count() == 0

    client.force_authenticate(user=another_user)

    list_response = client.get(TRANSACTIONS_URL)

    assert list_response.status_code == status.HTTP_200_OK
    assert list_response.data['results'] == []