from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from .models import Product, Video, VideoProductTag, Order, OrderItem, Report
from .serializers import (
    ProductSerializer,
    VideoSerializer,
    OrderCreateSerializer,
    OrderDetailSerializer,
    ReportSerializer
)


class VideoFeedViewSet(viewsets.ModelViewSet):
    """
    API cung cấp Feed video ngắn (chỉ lấy video đã duyệt và không bị ẩn)
    và quản lý video cho Creator / Admin.
    """
    queryset = Video.objects.all().order_by('-created_at')
    serializer_class = VideoSerializer

    def get_queryset(self):
        qs = Video.objects.all().order_by('-created_at')
        # Khi là public feed thì chỉ lấy video hợp lệ
        is_admin_mode = self.request.query_params.get('admin', 'false').lower() == 'true'
        if not is_admin_mode:
            qs = qs.filter(is_approved=True, is_hidden=False)
        return qs

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        video = self.get_object()
        video.likes_count += 1
        video.save(update_fields=['likes_count'])
        return Response({'likes_count': video.likes_count, 'status': 'liked'})

    @action(detail=True, methods=['post'])
    def toggle_hidden(self, request, pk=None):
        """Admin bật/tắt ẩn video ngay lập tức"""
        video = self.get_object()
        video.is_hidden = not video.is_hidden
        video.save(update_fields=['is_hidden'])
        return Response({
            'id': video.id,
            'is_hidden': video.is_hidden,
            'message': 'Đã ẩn video khỏi feed' if video.is_hidden else 'Đã bỏ ẩn video'
        })

    @action(detail=True, methods=['post'])
    def attach_product(self, request, pk=None):
        video = self.get_object()
        product_id = request.data.get('product_id')
        timestamp = request.data.get('timestamp', 0.0)
        try:
            product = Product.objects.get(id=product_id)
            tag, _ = VideoProductTag.objects.get_or_create(
                video=video, product=product, defaults={'timestamp': timestamp}
            )
            return Response(VideoSerializer(video).data)
        except Product.DoesNotExist:
            return Response({'error': 'Sản phẩm không tồn tại'}, status=status.HTTP_404_NOT_FOUND)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ProductSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderDetailSerializer

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        order = self.get_object()
        order.is_paid = True
        order.status = 'confirmed'
        order.save(update_fields=['is_paid', 'status', 'updated_at'])
        return Response({
            'status': 'confirmed',
            'is_paid': True,
            'message': f'Đơn hàng {order.order_code} đã được xác nhận thanh toán.'
        })

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save(update_fields=['status', 'updated_at'])
            return Response({'status': order.status, 'message': f'Trạng thái đổi thành {order.get_status_display()}'})
        return Response({'error': 'Trạng thái không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer

    @action(detail=True, methods=['post'])
    def resolve_and_hide(self, request, pk=None):
        """Admin xử lý report: Ẩn video ngay lập tức và đánh dấu report resolved"""
        report = self.get_object()
        report.status = 'resolved'
        report.save(update_fields=['status'])
        
        # Ẩn video ngay lập tức
        video = report.video
        video.is_hidden = True
        video.save(update_fields=['is_hidden'])
        
        return Response({
            'report_id': report.id,
            'video_id': video.id,
            'video_hidden': True,
            'message': 'Đã ẩn video vi phạm và hoàn tất xử lý báo cáo!'
        })

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        report = self.get_object()
        report.status = 'dismissed'
        report.save(update_fields=['status'])
        return Response({'report_id': report.id, 'status': 'dismissed', 'message': 'Đã bỏ qua báo cáo'})


@api_view(['GET'])
def admin_dashboard_stats(request):
    """
    Thống kê tổng quan cho Admin (Phát): Doanh thu, Đơn hàng, Lượt report, Video vi phạm
    """
    total_revenue = Order.objects.filter(is_paid=True).aggregate(total=Sum('total_amount'))['total'] or 0
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    confirmed_orders = Order.objects.filter(status='confirmed').count()
    
    total_videos = Video.objects.count()
    hidden_videos = Video.objects.filter(is_hidden=True).count()
    pending_reports = Report.objects.filter(status='pending').count()

    recent_orders = Order.objects.all().order_by('-created_at')[:5]
    recent_reports = Report.objects.filter(status='pending').order_by('-created_at')[:5]

    return Response({
        'revenue': {
            'total': total_revenue,
            'formatted': f"{total_revenue:,.0f} VND"
        },
        'orders': {
            'total': total_orders,
            'pending': pending_orders,
            'confirmed': confirmed_orders,
        },
        'videos': {
            'total': total_videos,
            'hidden': hidden_videos,
        },
        'reports': {
            'pending': pending_reports,
        },
        'recent_orders': OrderDetailSerializer(recent_orders, many=True).data,
        'recent_reports': ReportSerializer(recent_reports, many=True).data
    })
