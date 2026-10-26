from django.db.models.deletion import ProtectedError
from rest_framework import viewsets, status
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer
from .filters import TransactionFilter
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from finance.services.csv_import import (import_transactions, CSVImportError)


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

    @action(detail=False, methods=['post'], url_path='import', parser_classes=[MultiPartParser])
    def import_csv(self, request):
        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return Response(
                {'detail': "Please upload a CSV file using the 'file' field."},
                status=status.HTTP_400_BAD_REQUEST
            )

        max_size = 2 * 1024 * 1024

        if uploaded_file.size > max_size:
            return Response(
                {'detail': 'File size must not exceed 2MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            report = import_transactions(
                user=request.user,
                file=uploaded_file,
            )
        except CSVImportError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_status = (
            status.HTTP_201_CREATED if report['imported'] > 0 else status.HTTP_200_OK
        )

        return Response(report, status=response_status)
