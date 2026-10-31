from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import CategoryViewSet, TransactionViewSet
from finance.analytics_views import (
    SummaryView,
    MonthlyView,
    CategoryBreakdownView,
    TopExpensesView,
)


router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('transactions', TransactionViewSet, basename='transaction')

urlpatterns = router.urls + [
    path(
        'analytics/summary/',
         SummaryView.as_view(),
         name='analytics-summary',
    ),
    path(
        'analytics/monthly/',
         MonthlyView.as_view(),
         name='analytics-monthly',
    ),
    path(
        'analytics/by-category/',
         CategoryBreakdownView.as_view(),
         name='analytics-by-category',
    ),
    path(
        'analytics/top-expenses/',
         TopExpensesView.as_view(),
         name='analytics-top-expenses',
    ),

]