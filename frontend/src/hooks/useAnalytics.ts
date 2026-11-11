'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';

import type { Summary, MonthlyPoint, CategoryShare, TopExpense } from '@/types';

interface AnalyticsFilters {
    dateFrom?: string;
    dateTo?: string;
}

interface AnalyticsState {
    summary: Summary | null;
    monthly: MonthlyPoint[];
    categories: CategoryShare[];
    topExpenses: TopExpense[];
    loading: boolean;
    error: string | null;
}

interface AnalyticsResponse {
    summary: Summary;
    monthly: MonthlyPoint[];
    categories: CategoryShare[];
    topExpenses: TopExpense[];
}

export function useAnalytics({ dateFrom, dateTo }: AnalyticsFilters = {}) {
    const [data, setData] = useState<AnalyticsState>({
        summary: null,
        monthly: [],
        categories: [],
        topExpenses: [],
        loading: true,
        error: null,
    });

    const fetchAnalytics = useCallback(async () => {
        const params: {
            date_from?: string;
            date_to?: string;
        } = {};

        if (dateFrom) {
            params.date_from = dateFrom;
        }

        if (dateTo) {
            params.date_to = dateTo;
        }

        const [summaryRes, monthlyRes, categoriesRes, topExpensesRes] =
            await Promise.all([
                api.get<Summary>('/analytics/summary/', { params }),
                api.get<MonthlyPoint[]>('/analytics/monthly/', { params }),
                api.get<CategoryShare[]>('/analytics/by-category/', {
                    params: { ...params, kind: 'expense' },
                }),
                api.get<TopExpense[]>('/analytics/top-expenses/', {
                    params: { ...params, limit: 5 },
                }),
            ]);

        return {
            summary: summaryRes.data,
            monthly: monthlyRes.data,
            categories: categoriesRes.data,
            topExpenses: topExpensesRes.data,
        };
    }, [dateFrom, dateTo]);

    const refetch = useCallback(async () => {
        setData((previous) => ({
            ...previous,
            loading: true,
            error: null,
        }));

        try {
            const result = await fetchAnalytics();

            setData({
                ...result,
                loading: false,
                error: null,
            });
        } catch {
            setData((previous) => ({
                ...previous,
                loading: false,
                error: 'Failed to load analytics. Please try again.',
            }));
        }
    }, [fetchAnalytics]);

    useEffect(() => {
        let cancelled = false;

        async function loadAnalytics() {
            setData((previous) => ({
                ...previous,
                loading: true,
                error: null,
            }));

            try {
                const result = await fetchAnalytics();

                if (!cancelled) {
                    setData({
                        ...result,
                        loading: false,
                        error: null,
                    });
                }
            } catch {
                if (!cancelled) {
                    setData((previous) => ({
                        ...previous,
                        loading: false,
                        error: 'Failed to load analytics. Please try again.',
                    }));
                }
            }
        }

        loadAnalytics();

        return () => {
            cancelled = true;
        };
    }, [fetchAnalytics]);

    return {
        ...data,
        refetch,
    };
}
