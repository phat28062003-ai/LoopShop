from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VideoFeedViewSet,
    ProductViewSet,
    OrderViewSet,
    ReportViewSet,
    CommentViewSet,
    ConversationViewSet,
    MessageViewSet,
    vietqr_webhook,
    admin_dashboard_stats,
    admin_customers_crm,
    telegram_config_view,
    test_telegram_notification_view,
    VoucherViewSet,
    apply_voucher_view
)

router = DefaultRouter()
router.register(r'videos', VideoFeedViewSet, basename='video')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'vouchers', VoucherViewSet, basename='voucher')

urlpatterns = [
    path('vouchers/apply/', apply_voucher_view, name='voucher-apply'),
    path('payment/webhook/', vietqr_webhook, name='vietqr-webhook'),
    path('admin/stats/', admin_dashboard_stats, name='admin-stats'),
    path('admin/customers/', admin_customers_crm, name='admin-customers'),
    path('telegram/config/', telegram_config_view, name='telegram-config'),
    path('telegram/test/', test_telegram_notification_view, name='telegram-test'),
    path('', include(router.urls)),
]
