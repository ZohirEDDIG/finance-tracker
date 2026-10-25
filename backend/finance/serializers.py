from rest_framework import serializers
from .models import Category, Transaction

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'kind', 'created_at']
        read_only_fields = ['id', 'created_at']

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id',
            'category',
            'category_name',
            'amount',
            'kind',
            'date',
            'description',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'Amount must be greater than 0.'
            )
        return value

    def validate_category(self, value):
        user = self.context['request'].user

        if value.user != user:
            raise serializers.ValidationError(
                'You cannot use another user\'s category.'
            )
        return value

    def validate(self, data):
        category = data.get(
            'category',
            getattr(self.instance, 'category', None)
        )
        kind = data.get(
            'kind',
            getattr(self.instance, 'kind', None)
        )

        if category and kind and category.kind != kind:
            raise serializers.ValidationError({
                'kind': 'Transaction kind must match category kind.'
            })

        return data