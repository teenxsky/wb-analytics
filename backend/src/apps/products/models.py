from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=512)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=12, decimal_places=2)
    rating = models.FloatField()
    reviews_count = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
