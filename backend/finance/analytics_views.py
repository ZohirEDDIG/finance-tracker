from rest_framework.views import APIView
from rest_framework.response import Response
from finance.models import Transaction
from finance.serializers import AnalyticsQuerySerializer
from finance.services.analytics import (
    get_summary,
    get_monthly,
    get_by_category,
    get_top_expenses,
)


class AnalyticsBaseView(APIView):
    def get_params(self, request):
        serializer = AnalyticsQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    def get_queryset(self, request, params):
        queryset = Transaction.objects.filter(user=request.user)

        date_from = params.get('date_from')
        date_to = params.get('date_to')

        if date_from:
            queryset = queryset.filter(date__gte=date_from)

        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        return queryset

class SummaryView(AnalyticsBaseView):
    def get(self, request):
        params = self.get_params(request)
        queryset = self.get_queryset(request, params)

        return Response(get_summary(queryset))

class MonthlyView(AnalyticsBaseView):
    def get(self, request):
        params = self.get_params(request)
        queryset = self.get_queryset(request, params)

        return Response(get_monthly(queryset))

class CategoryBreakdownView(AnalyticsBaseView):
    def get(self, request):
        params = self.get_params(request)
        queryset = self.get_queryset(request, params)

        data = get_by_category(
            queryset,
            kind=params['kind']
        )

        return Response(data)

class TopExpensesView(AnalyticsBaseView):
    def get(self, request):
        params = self.get_params(request)
        queryset = self.get_queryset(request, params)

        data = get_top_expenses(
            queryset,
            limit=params['limit']
        )

        return Response(data)