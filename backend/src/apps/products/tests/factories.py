import random
from datetime import datetime, timedelta

import factory
from factory.declarations import LazyAttribute
from faker import Faker

from apps.products.models import Product

faker = Faker()


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    name = LazyAttribute(lambda _: faker.word().capitalize())
    price = LazyAttribute(lambda _: round(random.uniform(100, 10000), 2))
    discounted_price = LazyAttribute(
        lambda o: round(o.price * random.uniform(0.5, 0.99), 2)
    )
    rating = LazyAttribute(lambda _: round(random.uniform(1, 5), 2))
    reviews_count = LazyAttribute(lambda _: random.randint(0, 1000))
    created_at = LazyAttribute(
        lambda _: datetime.now() - timedelta(days=random.randint(0, 365))
    )
