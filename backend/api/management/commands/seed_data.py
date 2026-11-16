from django.core.management.base import BaseCommand
from api.models import Product, Video, VideoProductTag, Order, OrderItem, Report


class Command(BaseCommand):
    help = 'Nạp dữ liệu mẫu cho Video Commerce (Sản phẩm, Video dọc, Đơn hàng, Báo cáo)'

    def handle(self, *args, **options):
        self.stdout.write('Đang khởi tạo dữ liệu mẫu...')

        # Xóa dữ liệu cũ nếu có
        VideoProductTag.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Report.objects.all().delete()
        Video.objects.all().delete()
        Product.objects.all().delete()

        # 1. Tạo Sản phẩm
        p1 = Product.objects.create(
            seller_name='Phát Audio Store',
            title='Tai nghe không dây chống ồn TWS Pro Max (Bluetooth 5.3)',
            description='Âm bass cực căng, khử ồn chủ động ANC 35dB, pin trâu 30h kèm hộp sạc. Bảo hành 12 tháng 1 đổi 1.',
            price=399000,
            original_price=650000,
            image_url='https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
            stock=85,
            rating=4.9,
            sold_count=430,
        )

        p2 = Product.objects.create(
            seller_name='Streetwear by Phát',
            title='Áo thun Oversize Unisex Cotton 100% 250gsm Local Brand',
            description='Form rộng chuẩn Hàn Quốc, chất vải cotton 2 chiều dày dặn không bai dão, hình in lụa cao cấp sắc nét.',
            price=189000,
            original_price=290000,
            image_url='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
            stock=120,
            rating=4.8,
            sold_count=612,
        )

        p3 = Product.objects.create(
            seller_name='Phát Tech Gadgets',
            title='Bàn phím cơ không dây Custom 75% RGB Hotswap Red Switch',
            description='Gõ êm ái, kết nối 3 chế độ (Bluetooth / 2.4Ghz / Type-C), keycap PBT doubleshot bền màu không bóng.',
            price=850000,
            original_price=1200000,
            image_url='https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
            stock=45,
            rating=5.0,
            sold_count=180,
        )

        p4 = Product.objects.create(
            seller_name='Phát Daily Lifestyle',
            title='Bình giữ nhiệt Inox 304 cao cấp 800ml hiển thị nhiệt độ LED',
            description='Giữ nhiệt nóng/lạnh lên đến 24 giờ. Nắp đậy hiển thị nhiệt độ thông minh, có khay lọc trà inox.',
            price=149000,
            original_price=220000,
            image_url='https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
            stock=200,
            rating=4.9,
            sold_count=890,
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Đã tạo 4 sản phẩm mẫu.'))

        # 2. Tạo Video dọc & Gắn thẻ Sản phẩm
        v1 = Video.objects.create(
            uploader_name='phat_review',
            uploader_avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            title='Đập hộp tai nghe TWS ANC giá dưới 400k mà âm bass quá uy lực 🔥',
            description='Test trực tiếp khả năng chống ồn và pin trâu 30 tiếng. Bấm vào giỏ hàng góc trái video để săn deal nha!',
            video_url='https://assets.mixkit.co/videos/preview/mixkit-young-woman-skater-showing-her-balance-41618-large.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
            likes_count=1420,
            comments_count=89,
            shares_count=45,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v1, product=p1, timestamp=0.0)

        v2 = Video.objects.create(
            uploader_name='phat_outfits',
            uploader_avatar='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
            title='Phối đồ mùa hè cùng áo thun Oversize cotton 100% cực mát 👕✨',
            description='Chất vải 250gsm đứng form dã man, mặc đi học hay đi chơi đều đỉnh. Đang có mã freeship trong video!',
            video_url='https://assets.mixkit.co/videos/preview/mixkit-model-posing-with-a-modern-look-41614-large.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
            likes_count=2850,
            comments_count=142,
            shares_count=98,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v2, product=p2, timestamp=0.0)

        v3 = Video.objects.create(
            uploader_name='setup_with_phat',
            uploader_avatar='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
            title='Âm thanh gõ phím cơ Red switch custom này có làm bạn nghiện? ⌨️🎧',
            description='Sound test bàn phím cơ không dây layout 75% gọn gàng cho góc làm việc tối giản.',
            video_url='https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-43288-large.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
            likes_count=5210,
            comments_count=310,
            shares_count=215,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v3, product=p3, timestamp=0.0)

        v4 = Video.objects.create(
            uploader_name='daily_phat',
            uploader_avatar='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
            title='Bình nước thông minh hiển thị nhiệt độ chuẩn không cần chỉnh 💧',
            description='Giữ đá lạnh cả ngày dài, thiết kế tối giản mang đi học, đi làm hay tập gym đều tiện.',
            video_url='https://assets.mixkit.co/videos/preview/mixkit-girl-taking-photos-with-a-retro-camera-41620-large.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
            likes_count=980,
            comments_count=56,
            shares_count=31,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v4, product=p4, timestamp=0.0)

        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 4 video dọc kèm gắn thẻ sản phẩm.'))

        # 3. Tạo Đơn hàng mẫu
        order1 = Order.objects.create(
            customer_name='Trần Minh Tuấn',
            customer_phone='0987654321',
            shipping_address='123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            total_amount=399000,
            status='confirmed',
            is_paid=True,
            bank_id='MB',
            account_no='0901234567',
            account_name='NGUYEN TAN PHAT',
            note='Giao giờ hành chính giúp em ạ'
        )
        OrderItem.objects.create(
            order=order1, product=p1, product_title=p1.title, price=p1.price, quantity=1
        )

        order2 = Order.objects.create(
            customer_name='Lê Hoàng Nam',
            customer_phone='0912345678',
            shipping_address='45 Lê Lợi, Quận Hải Châu, TP. Đà Nẵng',
            total_amount=1039000,
            status='pending',
            is_paid=False,
            bank_id='MB',
            account_no='0901234567',
            account_name='NGUYEN TAN PHAT',
            note='Đóng gói cẩn thận giúp shop'
        )
        OrderItem.objects.create(
            order=order2, product=p2, product_title=p2.title, price=p2.price, quantity=1
        )
        OrderItem.objects.create(
            order=order2, product=p3, product_title=p3.title, price=p3.price, quantity=1
        )

        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 2 đơn hàng mẫu (1 đã thanh toán, 1 chờ thanh toán).'))

        # 4. Tạo Báo cáo vi phạm mẫu cho Admin test kiểm duyệt
        Report.objects.create(
            video=v4,
            reason='copyright',
            details='Video dùng nhạc nền không có bản quyền thương mại.',
            status='pending'
        )
        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 1 báo cáo vi phạm mẫu để test Admin moderation.'))
        self.stdout.write(self.style.SUCCESS('Hoàn tất nạp dữ liệu mẫu!'))
