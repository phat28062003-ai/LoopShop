import os
import re
import uuid
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from .models import Product, Video, VideoProductTag, Order, OrderItem, Report, Comment, Conversation, Message
from .serializers import (
    ProductSerializer,
    VideoSerializer,
    OrderCreateSerializer,
    OrderDetailSerializer,
    ReportSerializer,
    CommentSerializer,
    ConversationSerializer,
    MessageSerializer
)
from .telegram import send_telegram_notification, get_telegram_config, save_telegram_config


class VideoFeedViewSet(viewsets.ModelViewSet):
    """
    API cung cấp Feed video ngắn (chỉ lấy video đã duyệt và không bị ẩn)
    và quản lý video cho Creator / Admin.
    """
    queryset = Video.objects.all().order_by('-created_at')
    serializer_class = VideoSerializer

    def get_queryset(self):
        qs = Video.objects.all().order_by('-created_at')
        is_admin_mode = self.request.query_params.get('admin', 'false').lower() == 'true'
        if not is_admin_mode:
            qs = qs.filter(is_approved=True, is_hidden=False)

        category = self.request.query_params.get('category', '').strip()
        if category and category != 'all':
            qs = qs.filter(Q(category=category) | Q(products__category=category)).distinct()

        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(uploader_name__icontains=search) |
                Q(products__title__icontains=search)
            ).distinct()

        return qs

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        video = self.get_object()
        video.likes_count += 1
        video.save(update_fields=['likes_count'])
        return Response({'likes_count': video.likes_count, 'status': 'liked'})

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Tăng số lượt chia sẻ của video"""
        video = self.get_object()
        video.shares_count += 1
        video.save(update_fields=['shares_count'])
        return Response({'shares_count': video.shares_count, 'status': 'shared'})

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

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_file(self, request):
        """
        Tải video trực tiếp từ điện thoại hoặc máy tính lên server/media
        """
        video_file = request.FILES.get('video')
        if not video_file:
            return Response({'error': 'Vui lòng chọn file video hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo tên file ngẫu nhiên an toàn
        ext = os.path.splitext(video_file.name)[1].lower() or '.mp4'
        filename = f"videos/{uuid.uuid4().hex}{ext}"
        saved_path = default_storage.save(filename, ContentFile(video_file.read()))
        file_url = f"{settings.MEDIA_URL}{saved_path}"

        # Trả về full URL
        full_url = request.build_absolute_uri(file_url)
        return Response({
            'video_url': full_url,
            'relative_url': file_url,
            'filename': video_file.name,
            'size': video_file.size,
            'message': 'Tải video lên thành công!'
        })


class CommentViewSet(viewsets.ModelViewSet):
    """
    API bình luận dưới video ngắn
    """
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer

    def get_queryset(self):
        qs = Comment.objects.all().order_by('-created_at')
        video_id = self.request.query_params.get('video')
        if video_id:
            qs = qs.filter(video_id=video_id)
        return qs

    def perform_create(self, serializer):
        comment = serializer.save()
        # Cập nhật số lượng bình luận của video
        video = comment.video
        video.comments_count = video.comments.count()
        video.save(update_fields=['comments_count'])

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comment = self.get_object()
        comment.likes_count += 1
        comment.save(update_fields=['likes_count'])
        return Response({'likes_count': comment.likes_count})


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ProductSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderDetailSerializer

    def perform_create(self, serializer):
        order = serializer.save()
        # Gửi thông báo Telegram tức thì cho Seller / Phát
        items_summary = "\n".join([
            f"  • {item.quantity}x {item.product_title} ({item.price:,.0f}đ)"
            for item in order.items.all()
        ])
        msg = (
            f"🛒 <b>ĐƠN HÀNG MỚI #{order.order_code}</b>\n\n"
            f"👤 <b>Khách hàng:</b> {order.customer_name}\n"
            f"📞 <b>SĐT:</b> <code>{order.customer_phone}</code>\n"
            f"📍 <b>Địa chỉ:</b> {order.shipping_address}\n"
            f"💰 <b>Tổng tiền:</b> <b>{order.total_amount:,.0f} VND</b>\n"
            f"📦 <b>Sản phẩm:</b>\n{items_summary or '  • 1x Đơn hàng LoopShop'}\n"
            f"💳 <b>Thanh toán:</b> Chuyển khoản VietQR\n\n"
            f"⚡ <i>LoopShop đang đợi người mua chuyển khoản...</i>"
        )
        send_telegram_notification(msg)

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        order = self.get_object()
        order.is_paid = True
        order.status = 'confirmed'
        order.save(update_fields=['is_paid', 'status', 'updated_at'])

        msg = (
            f"🎉 <b>XÁC NHẬN THANH TOÁN THÀNH CÔNG!</b>\n\n"
            f"💵 <b>Mã đơn:</b> #{order.order_code}\n"
            f"💰 <b>Số tiền:</b> {order.total_amount:,.0f} VND\n"
            f"👤 <b>Khách hàng:</b> {order.customer_name} ({order.customer_phone})\n"
            f"✅ <b>Trạng thái:</b> Đã xác nhận & Sẵn sàng đóng gói!\n\n"
            f"🚀 <i>LoopShop VietQR Auto-Confirmed</i>"
        )
        send_telegram_notification(msg)

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

    @action(detail=False, methods=['get'])
    def track(self, request):
        """Khách hàng tra cứu danh sách đơn hàng theo số điện thoại"""
        phone = request.query_params.get('phone', '').strip()
        if not phone:
            return Response({'error': 'Vui lòng cung cấp số điện thoại'}, status=status.HTTP_400_BAD_REQUEST)
        orders = Order.objects.filter(customer_phone=phone).order_by('-created_at')
        return Response(OrderDetailSerializer(orders, many=True).data)


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


@api_view(['POST'])
def vietqr_webhook(request):
    """
    Webhook tự động nhận thông báo biến động số dư VietQR (Napas247 / SePay / Casso)
    Khi người mua chuyển khoản đúng cú pháp "DON HANG <MÃ_ĐƠN>", server tự động
    chuyển trạng thái đơn sang 'confirmed' và 'is_paid = True' trong vòng 3 giây!
    """
    data = request.data
    content = str(data.get('content', '') or data.get('description', '') or data.get('referenceCode', ''))
    transfer_amount = data.get('transferAmount') or data.get('amount', 0)

    # Tìm mã đơn hàng dạng PH-XXXXXXXX trong nội dung chuyển khoản
    match = re.search(r'PH-[A-Za-z0-9]+', content, re.IGNORECASE)
    if not match:
        return Response({
            'success': False,
            'message': 'Không tìm thấy mã đơn hàng PH-XXXX trong nội dung chuyển khoản',
            'raw_content': content
        }, status=status.HTTP_200_OK)

    order_code = match.group(0).upper()
    try:
        order = Order.objects.get(order_code=order_code)
        order.is_paid = True
        order.status = 'confirmed'
        order.save(update_fields=['is_paid', 'status', 'updated_at'])

        msg = (
            f"⚡ <b>TING TING! TỰ ĐỘNG KHỚP LỆNH VIETQR</b>\n\n"
            f"💵 <b>Đơn hàng:</b> #{order.order_code}\n"
            f"💰 <b>Số tiền nhận:</b> {order.total_amount:,.0f} VND\n"
            f"👤 <b>Khách hàng:</b> {order.customer_name}\n"
            f"🏦 <b>Nội dung CK:</b> <code>{content}</code>\n"
            f"✅ Hệ thống đã tự động kích hoạt đơn hàng trong 3 giây!"
        )
        send_telegram_notification(msg)

        return Response({
            'success': True,
            'order_code': order.order_code,
            'status': 'confirmed',
            'message': f'Đơn hàng {order.order_code} đã được tự động kích hoạt thanh toán thành công!'
        })
    except Order.DoesNotExist:
        return Response({
            'success': False,
            'message': f'Mã đơn hàng {order_code} không tồn tại trên hệ thống'
        }, status=status.HTTP_200_OK)


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



class ConversationViewSet(viewsets.ModelViewSet):
    """
    Quản lý các cuộc trò chuyện riêng 1-1 giữa các thành viên trong cộng đồng
    """
    queryset = Conversation.objects.all().order_by('-updated_at')
    serializer_class = ConversationSerializer

    def get_queryset(self):
        qs = Conversation.objects.all().order_by('-updated_at')
        user = self.request.query_params.get('user')
        if user:
            user_qs = qs.filter(Q(participant_1__iexact=user) | Q(participant_2__iexact=user))
            # Nếu người dùng có cuộc trò chuyện riêng thì hiển thị; nếu chưa có thì hiển thị toàn bộ cuộc trò chuyện mẫu để xem và tương tác
            if user_qs.exists():
                return user_qs
        return qs

    @action(detail=False, methods=['post'])
    def start_or_get(self, request):
        user1 = request.data.get('user1', '').strip()
        user2 = request.data.get('user2', '').strip()
        p1_avatar = request.data.get('p1_avatar', '')
        p2_avatar = request.data.get('p2_avatar', '')

        if not user1 or not user2:
            return Response({'error': 'Thiếu thông tin người tham gia'}, status=status.HTTP_400_BAD_REQUEST)

        # Tìm cuộc trò chuyện hiện có
        conv = Conversation.objects.filter(
            (Q(participant_1__iexact=user1) & Q(participant_2__iexact=user2)) |
            (Q(participant_1__iexact=user2) & Q(participant_2__iexact=user1))
        ).first()

        if not conv:
            conv = Conversation.objects.create(
                participant_1=user1,
                participant_2=user2,
                p1_avatar=p1_avatar or f"https://api.dicebear.com/7.x/bottts/svg?seed={user1}",
                p2_avatar=p2_avatar or f"https://api.dicebear.com/7.x/bottts/svg?seed={user2}",
                last_message="Bắt đầu cuộc trò chuyện"
            )

        return Response(ConversationSerializer(conv).data)


class MessageViewSet(viewsets.ModelViewSet):
    """
    Quản lý tin nhắn trong phòng Chat Cộng Đồng và Tin nhắn 1-1
    """
    queryset = Message.objects.all().order_by('created_at')
    serializer_class = MessageSerializer

    def get_queryset(self):
        community = self.request.query_params.get('community', 'false').lower() == 'true'
        conversation_id = self.request.query_params.get('conversation')
        if community:
            return Message.objects.filter(is_community_room=True).order_by('created_at')
        if conversation_id:
            return Message.objects.filter(conversation_id=conversation_id).order_by('created_at')
        return Message.objects.all().order_by('created_at')

    def perform_create(self, serializer):
        msg = serializer.save()
        if msg.conversation:
            conv = msg.conversation
            conv.last_message = msg.content[:100]
            conv.save(update_fields=['last_message', 'updated_at'])


@api_view(['GET', 'POST'])
def telegram_config_view(request):
    """
    Xem và lưu cấu hình Telegram Bot từ màn hình Admin
    """
    if request.method == 'POST':
        bot_token = request.data.get('bot_token', '').strip()
        chat_id = request.data.get('chat_id', '').strip()
        saved = save_telegram_config(bot_token, chat_id)
        return Response({
            'success': True,
            'message': 'Đã lưu cấu hình Telegram Bot thành công!',
            'is_configured': bool(bot_token and chat_id),
            'chat_id': chat_id
        })

    cfg = get_telegram_config()
    token = cfg.get('bot_token', '')
    masked_token = f"{token[:6]}...{token[-4:]}" if len(token) > 10 else ('Đã lưu token' if token else '')
    return Response({
        'is_configured': cfg.get('is_configured', False),
        'bot_token_masked': masked_token,
        'chat_id': cfg.get('chat_id', '')
    })


@api_view(['POST'])
def test_telegram_notification_view(request):
    """
    Gửi tin nhắn thử nghiệm tới Telegram
    """
    bot_token = request.data.get('bot_token')
    chat_id = request.data.get('chat_id')
    custom_message = request.data.get('message')

    msg = custom_message or (
        "🔔 <b>THÔNG BÁO THỬ NGHIỆM TỪ LOOPSHOP!</b>\n\n"
        "Chào Phát! Telegram Bot đã được liên kết thành công với LoopShop 🚀\n"
        "Kể từ bây giờ, mỗi khi có khách đặt hàng mới hoặc thanh toán qua VietQR, "
        "bạn sẽ nhận được tin nhắn và chuông 'ting-ting' tức thì trên điện thoại!"
    )
    res = send_telegram_notification(msg, custom_token=bot_token, custom_chat_id=chat_id)
    return Response(res)
