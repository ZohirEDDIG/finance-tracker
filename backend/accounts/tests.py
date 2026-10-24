import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_register_user(api_client):
    response = api_client.post(
        reverse('register'), 
        {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Str0ng!Pass987'
        }, 
        format='json'
    )

    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_register_weak_password(api_client):
    response = api_client.post(
        reverse('register'), 
        {
            'username': 'weakuser',
            'email': 'weak@example.com',
            'password': '123'
        },
        format='json'
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_login_returns_tokens(api_client):
    from django.contrib.auth import get_user_model

    User = get_user_model()
    User.objects.create_user(
        username='loginuser',
        email='login@example.com',
        password='Str0ng!Pass987'
    )

    response = api_client.post(
        reverse('login'),
        {
            'username': 'loginuser',
            'password': 'Str0ng!Pass987'
        },
        format='json'
    )

    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data


@pytest.mark.django_db
def test_me_without_token(api_client):
    response = api_client.get(reverse('me'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_me_with_token(api_client):
    from django.contrib.auth import get_user_model

    User = get_user_model()
    User.objects.create_user(
        username='meuser',
        email='me@example.com',
        password='Str0ng!Pass987'
    )

    login_response = api_client.post(
        reverse('login'),
        {
            'username': 'meuser',
            'password': 'Str0ng!Pass987'
        },
        format='json'
    )

    access_token = login_response.data['access']

    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {access_token}"
    )

    response = api_client.get(reverse('me'))

    assert response.status_code == status.HTTP_200_OK
    assert response.data['username'] == 'meuser'
    assert response.data['email'] == 'me@example.com'