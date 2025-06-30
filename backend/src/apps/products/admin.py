from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import path

from apps.products.models import Product
from apps.products.services import WildberriesParser


class ParseWBForm(forms.Form):
    query = forms.CharField(label='Search query', max_length=255)
    pages = forms.IntegerField(label='Pages', min_value=1, initial=1)
    limit = forms.IntegerField(
        label='Max products',
        min_value=1,
        required=False,
        help_text='Maximum number of products to parse (optional)',
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'price',
        'discounted_price',
        'rating',
        'reviews_count',
        'created_at',
    )
    search_fields = ('name',)
    list_filter = ('rating', 'price', 'reviews_count')

    change_list_template = 'admin/products_changelist.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'parse_wb/',
                self.admin_site.admin_view(self.parse_wb_view),
                name='parse-wb-products',
            ),
        ]
        return custom_urls + urls

    def parse_wb_view(self, request):
        if request.method == 'POST':
            form = ParseWBForm(request.POST)
            if form.is_valid():
                query = form.cleaned_data['query']
                pages = form.cleaned_data['pages']
                limit = form.cleaned_data['limit']
                parser = WildberriesParser()
                total_saved = 0
                for page in range(1, pages + 1):
                    try:
                        products = parser.fetch(query, page=page)
                    except Exception:
                        continue
                    if not products:
                        break
                    for item in products:
                        product_data = parser.parse(item)
                        created = parser.save(product_data)
                        if created:
                            total_saved += 1
                        if limit and total_saved >= limit:
                            break
                    if limit and total_saved >= limit:
                        break
                self.message_user(
                    request,
                    f'Parsed and saved {total_saved} new products.',
                    messages.SUCCESS,
                )
                return redirect('..')
        else:
            form = ParseWBForm()
        return TemplateResponse(request, 'admin/parse_wb_form.html', {'form': form})
