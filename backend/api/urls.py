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
    admin_dashboard_stats
)

router = DefaultRouter()
router.register(r'videos', VideoFeedViewSet, basename='video')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('payment/webhook/', vietqr_webhook, name='vietqr-webhook'),
    path('admin/stats/', admin_dashboard_stats, name='admin-stats'),
    path('', include(router.urls)),
]
