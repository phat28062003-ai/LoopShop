from django.contrib import admin
from .models import Product, Video, VideoProductTag, Order, OrderItem, Report


class VideoProductTagInline(admin.TabularInline):
    model = VideoProductTag
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'stock', 'rating', 'sold_count', 'seller_name', 'is_active')
    list_filter = ('is_active', 'seller_name')
    search_fields = ('title', 'seller_name')


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'uploader_name', 'likes_count', 'is_approved', 'is_hidden', 'created_at')
    list_filter = ('is_approved', 'is_hidden')
    search_fields = ('title', 'uploader_name')
    inlines = [VideoProductTagInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_title', 'price', 'quantity')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_code', 'customer_name', 'customer_phone', 'total_amount', 'status', 'is_paid', 'created_at')
    list_filter = ('status', 'is_paid')
    search_fields = ('order_code', 'customer_name', 'customer_phone')
    inlines = [OrderItemInline]


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'video', 'reason', 'status', 'created_at')
    list_filter = ('status', 'reason')
