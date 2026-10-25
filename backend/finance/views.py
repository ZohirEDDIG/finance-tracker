from typing import Any

from django.db.models.deletion import ProtectedError
from rest_framework import viewsets, status
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response

from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer
from .filters import TransactionFilter


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    'detail': 'This category has transactions and cannot be deleted.'
                },
                status=status.HTTP_409_CONFLICT
            )

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = TransactionFilter
    search_fields = ['description', 'category_name']
    ordering_fields = ['date', 'amount']

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        ).select_related('category')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)