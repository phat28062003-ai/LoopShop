from django.core.management.base import BaseCommand
from api.models import (
    Product, 
    Video, 
    VideoProductTag, 
    Order, 
    OrderItem, 
    Report, 
    Comment, 
    Conversation, 
    Message,
    Voucher
)


class Command(BaseCommand):
    help = 'Nạp dữ liệu mẫu phong phú cho LoopShop: 8 sản phẩm, 8 video các thể loại, 5 đơn hàng, bình luận, tin nhắn 1-1 và chat cộng đồng'

    def handle(self, *args, **options):
        self.stdout.write('Đang khởi tạo toàn bộ dữ liệu mẫu phong phú...')

        # Xóa dữ liệu cũ nếu có
        Voucher.objects.all().delete()
        Message.objects.all().delete()
        Conversation.objects.all().delete()
        Comment.objects.all().delete()
        VideoProductTag.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Report.objects.all().delete()
        Video.objects.all().delete()
        Product.objects.all().delete()

        # -------------------------------------------------------------
        # 1. TẠO 8 SẢN PHẨM MẪU (Tech, Fashion, Lifestyle, Food, Beauty)
        # -------------------------------------------------------------
        p1 = Product.objects.create(
            seller_name='Phát Audio Official',
            title='Tai nghe không dây chống ồn TWS Pro Max (Bluetooth 5.3)',
            description='Âm bass cực căng, khử ồn chủ động ANC 35dB, pin trâu 30h kèm hộp sạc. Bảo hành 12 tháng 1 đổi 1.',
            category='tech',
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
            category='fashion',
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
            category='tech',
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
            category='lifestyle',
            price=149000,
            original_price=220000,
            image_url='https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
            stock=200,
            rating=4.9,
            sold_count=890,
        )

        p5 = Product.objects.create(
            seller_name='Phát Tech Gadgets',
            title='Củ sạc nhanh GaN 65W 3 cổng siêu nhỏ gọn (2C + 1A) PD 3.0',
            description='Công nghệ GaN III sạc siêu mát cho cả MacBook, iPad, iPhone và Samsung cùng lúc. Tiết kiệm 50% thời gian sạc.',
            category='tech',
            price=290000,
            original_price=420000,
            image_url='https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
            stock=95,
            rating=4.9,
            sold_count=320,
        )

        p6 = Product.objects.create(
            seller_name='Streetwear by Phát',
            title='Túi đeo chéo Canvas phong cách Vintage Retro Hàn Quốc',
            description='Chất vải canvas dày chống trầy xước, nhiều ngăn tiện lợi chứa vừa iPad mini, điện thoại, ví tiền và sổ tay.',
            category='fashion',
            price=135000,
            original_price=210000,
            image_url='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
            stock=150,
            rating=4.7,
            sold_count=510,
        )

        p7 = Product.objects.create(
            seller_name='Bếp Nhà Phát',
            title='Khô gà lá chanh thượng hạng giòn cay thơm nức 500g',
            description='Làm từ 100% ức gà tươi, tẩm ướp đậm đà cay cay ngọt ngọt, sấy giòn rụm thơm lừng lá chanh tươi. Vừa ăn vừa cày phim cực dính.',
            category='food',
            price=89000,
            original_price=130000,
            image_url='https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
            stock=300,
            rating=4.9,
            sold_count=1450,
        )

        p8 = Product.objects.create(
            seller_name='Phát Beauty & Skincare',
            title='Son dưỡng môi thảo mộc đổi màu dưỡng ẩm mềm mọng 24h',
            description='Chiết xuất bơ hạt mỡ và dầu dừa nguyên chất, dưỡng ẩm sâu chống nứt nẻ, lên màu ửng hồng tự nhiên như môi em bé.',
            category='beauty',
            price=99000,
            original_price=160000,
            image_url='https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
            stock=180,
            rating=4.8,
            sold_count=780,
        )

        p9 = Product.objects.create(
            seller_name='Phát Smart Devices',
            title='Đồng hồ thông minh Smartwatch AMOLED chống nước 5ATM',
            description='Màn hình tràn viền AMOLED 1.43 inch sắc nét, đo nhịp tim & SpO2 liên tục, theo dõi 100+ bài tập, pin 14 ngày.',
            category='tech',
            price=690000,
            original_price=990000,
            image_url='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
            stock=65,
            rating=4.9,
            sold_count=340,
        )

        p10 = Product.objects.create(
            seller_name='Streetwear by Phát',
            title='Kính râm phi công chống tia UV400 phân cực polarized',
            description='Gọng titan siêu nhẹ mạ tĩnh điện chống gỉ, tròng kính phân cực chống lóa khi lái xe và đi biển, bảo vệ mắt 100%.',
            category='fashion',
            price=179000,
            original_price=290000,
            image_url='https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
            stock=110,
            rating=4.8,
            sold_count=420,
        )

        p11 = Product.objects.create(
            seller_name='Streetwear by Phát',
            title='Giày Sneaker Unisex đế êm Air Cushion chống trượt',
            description='Đế cao su lưu hóa đệm khí siêu êm, thân giày vải dệt thoáng khí không hôi chân, phối màu năng động phong cách.',
            category='fashion',
            price=349000,
            original_price=550000,
            image_url='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
            stock=90,
            rating=4.9,
            sold_count=580,
        )

        p12 = Product.objects.create(
            seller_name='Phát Audio Official',
            title='Loa Bluetooth di động Mini Bass trầm công suất 15W',
            description='Âm thanh 360 độ sống động, màng loa thụ động kép cho âm trầm uy lực, chống nước IPX7 thoải mái mang đi du lịch.',
            category='tech',
            price=279000,
            original_price=420000,
            image_url='https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
            stock=75,
            rating=4.8,
            sold_count=310,
        )

        p13 = Product.objects.create(
            seller_name='Phát Daily Lifestyle',
            title='Đèn bàn học chống cận thị LED 3 chế độ sáng bảo vệ mắt',
            description='Chỉ số hoàn màu Ra>95 tiệm cận ánh sáng tự nhiên, không nhấp nháy, có cổng sạc USB và hẹn giờ tắt tự động.',
            category='lifestyle',
            price=185000,
            original_price=280000,
            image_url='https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
            stock=130,
            rating=4.9,
            sold_count=640,
        )

        p14 = Product.objects.create(
            seller_name='Bếp Nhà Phát',
            title='Nồi cơm điện mini đa năng 1.2L lòng gốm ceramic',
            description='Nấu cơm dẻo thơm, hầm canh, nấu cháo, hấp bánh. Lòng nồi phủ gốm chống dính cao cấp không chứa chất độc hại.',
            category='lifestyle',
            price=360000,
            original_price=520000,
            image_url='https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=600&auto=format&fit=crop&q=80',
            stock=60,
            rating=4.7,
            sold_count=230,
        )

        p15 = Product.objects.create(
            seller_name='Bếp Nhà Phát',
            title='Trà hoa cúc mật ong sấy thăng hoa thanh nhiệt hộp 250g',
            description='Hoa cúc kim cúc tươi kết hợp mật ong hoa rừng nguyên chất, giúp an thần ngủ ngon, thanh lọc cơ thể và đẹp da.',
            category='food',
            price=95000,
            original_price=140000,
            image_url='https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
            stock=240,
            rating=4.9,
            sold_count=920,
        )

        p16 = Product.objects.create(
            seller_name='Bếp Nhà Phát',
            title='Bánh que rong biển phô mai giòn rụm bịch lớn 300g',
            description='Lớp vỏ bánh giòn tan bọc phô mai béo ngậy và rong biển sấy thơm ngon, món ăn vặt quốc dân phù hợp mọi lứa tuổi.',
            category='food',
            price=55000,
            original_price=80000,
            image_url='https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
            stock=400,
            rating=4.8,
            sold_count=1850,
        )

        p17 = Product.objects.create(
            seller_name='Phát Beauty & Skincare',
            title='Kem chống nắng nâng tone kiềm dầu SPF50+ PA++++ 50ml',
            description='Bảo vệ da toàn diện khỏi tia UVA/UVB và ánh sáng xanh, nâng 1-2 tone tự nhiên mịn lì không bóng nhờn suốt 8 giờ.',
            category='beauty',
            price=189000,
            original_price=280000,
            image_url='https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
            stock=160,
            rating=4.9,
            sold_count=720,
        )

        p18 = Product.objects.create(
            seller_name='Phát Beauty & Skincare',
            title='Serum Vitamin C 15% mờ thâm sáng da ngừa lão hóa 30ml',
            description='Dẫn xuất Vitamin C thế hệ mới dịu nhẹ không kích ứng, giảm thâm mụn chỉ sau 14 ngày, dưỡng da sáng mịn căng bóng.',
            category='beauty',
            price=219000,
            original_price=350000,
            image_url='https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
            stock=140,
            rating=4.9,
            sold_count=860,
        )

        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 18 sản phẩm mẫu đầy đủ 5 danh mục.'))

        # -------------------------------------------------------------
        # 2. TẠO 8 VIDEO DỌC VÀ GẮN THẺ SẢN PHẨM
        # -------------------------------------------------------------
        v1 = Video.objects.create(
            uploader_name='phat_review',
            uploader_avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            title='Đập hộp tai nghe TWS ANC giá dưới 400k mà âm bass quá uy lực 🔥',
            description='Test trực tiếp khả năng chống ồn và pin trâu 30 tiếng. Bấm vào giỏ hàng góc trái video để săn deal nha!',
            category='tech',
            video_url='/videos/v1.mp4',
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
            category='fashion',
            video_url='/videos/v2.mp4',
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
            category='tech',
            video_url='/videos/v3.mp4',
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
            category='lifestyle',
            video_url='/videos/v4.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
            likes_count=980,
            comments_count=56,
            shares_count=31,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v4, product=p4, timestamp=0.0)

        v5 = Video.objects.create(
            uploader_name='phat_gadgets',
            uploader_avatar='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            title='Củ sạc GaN 65W nhỏ bằng quả trứng mà sạc được cả Laptop lẫn iPhone ⚡🔋',
            description='Từ ngày có em củ sạc 3 cổng này balo nhẹ hẳn, không cần vác theo đống củ sạc cồng kềnh nữa!',
            category='tech',
            video_url='/videos/v5.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
            likes_count=3410,
            comments_count=195,
            shares_count=120,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v5, product=p5, timestamp=0.0)

        v6 = Video.objects.create(
            uploader_name='phat_streetwear',
            uploader_avatar='https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
            title='Gợi ý túi đeo chéo đi học đi làm đựng vừa iPad giá chỉ hơn trăm cành 🎒✨',
            description='Form vintage retro lên đồ siêu cá tính, quai đeo êm ái không mỏi vai, chống thấm nhẹ.',
            category='fashion',
            video_url='/videos/v6.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
            likes_count=1890,
            comments_count=78,
            shares_count=64,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v6, product=p6, timestamp=0.0)

        v7 = Video.objects.create(
            uploader_name='bep_nha_phat',
            uploader_avatar='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
            title='Mukbang khô gà lá chanh giòn rụm cay cay xem phim cuốn không lối thoát 🍗🌶️',
            description='Gà ta tươi xé sợi sấy giòn thơm lừng mùi lá chanh, đóng hũ kín bảo quản 6 tháng thoải mái.',
            category='food',
            video_url='/videos/v7.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
            likes_count=4230,
            comments_count=264,
            shares_count=180,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v7, product=p7, timestamp=0.0)

        v8 = Video.objects.create(
            uploader_name='phat_beauty',
            uploader_avatar='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
            title='Bí kíp môi hồng căng mọng tự nhiên đi học không bị giám thị phát hiện 💄🌸',
            description='Son dưỡng đổi màu thảo mộc dưỡng ẩm siêu tốt, không bóng nhờn, môi khô nứt nẻ thoa 1 đêm là mềm mịn ngay.',
            category='beauty',
            video_url='/videos/v8.mp4',
            thumbnail_url='https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
            likes_count=6120,
            comments_count=430,
            shares_count=320,
            is_approved=True,
            is_hidden=False,
        )
        VideoProductTag.objects.create(video=v8, product=p8, timestamp=0.0)

        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 8 video dọc gắn sản phẩm theo các danh mục.'))

        # -------------------------------------------------------------
        # 3. TẠO CÁC BÌNH LUẬN MẪU DƯỚI VIDEO
        # -------------------------------------------------------------
        Comment.objects.create(
            video=v1,
            user_name='Trần Minh Tuấn',
            user_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=Tuan',
            content='Bass đập chắc nịch luôn shop ơi! Đeo chạy bộ không sợ rơi rớt, 10 điểm!',
            likes_count=24
        )
        Comment.objects.create(
            video=v1,
            user_name='Ngọc Hân',
            user_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=Han',
            content='Có chống nước đi mưa nhẹ được không shop?',
            likes_count=5
        )
        Comment.objects.create(
            video=v2,
            user_name='Hải Đăng',
            user_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=Dang',
            content='1m75 nặng 68kg mang size XL vừa không ạ?',
            likes_count=12
        )
        Comment.objects.create(
            video=v3,
            user_name='Quang Huy Tech',
            user_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=Huy',
            content='Red switch gõ êm thật sự, âm thanh creamy nghe đã tai!',
            likes_count=38
        )
        Comment.objects.create(
            video=v7,
            user_name='Mai Phương',
            user_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=Phuong',
            content='Khô gà ăn giòn cay cay ngon dã man, vừa đặt thêm 2 hũ nữa tặng bạn!',
            likes_count=19
        )
        Comment.objects.create(
            video=v8,
            user_name='Thùy Linh',
            user_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=Linh',
            content='Màu son tự nhiên lắm, môi mình hay bị khô mà bôi em này cả ngày mềm mượt.',
            likes_count=31
        )

        self.stdout.write(self.style.SUCCESS('✓ Đã tạo bình luận mẫu cho các video.'))

        # -------------------------------------------------------------
        # 4. TẠO 5 ĐƠN HÀNG MẪU ĐA DẠNG TRẠNG THÁI
        # -------------------------------------------------------------
        # Đơn 1: Đã hoàn thành
        order1 = Order.objects.create(
            customer_name='Trần Minh Tuấn',
            customer_phone='0987654321',
            shipping_address='123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            total_amount=399000,
            status='completed',
            is_paid=True,
            bank_id='ICB',
            account_no='93287556868',
            account_name='LU TIEN PHAT',
            note='Giao giờ hành chính giúp em ạ'
        )
        OrderItem.objects.create(
            order=order1, product=p1, product_title=p1.title, price=p1.price, quantity=1
        )

        # Đơn 2: Đã thanh toán & xác nhận
        order2 = Order.objects.create(
            customer_name='Lê Hoàng Nam',
            customer_phone='0912345678',
            shipping_address='45 Lê Lợi, Quận Hải Châu, TP. Đà Nẵng',
            total_amount=1039000,
            status='confirmed',
            is_paid=True,
            bank_id='ICB',
            account_no='93287556868',
            account_name='LU TIEN PHAT',
            note='Đóng gói cẩn thận giúp shop nhé'
        )
        OrderItem.objects.create(
            order=order2, product=p2, product_title=p2.title, price=p2.price, quantity=1
        )
        OrderItem.objects.create(
            order=order2, product=p3, product_title=p3.title, price=p3.price, quantity=1
        )

        # Đơn 3: Đang giao hàng
        order3 = Order.objects.create(
            customer_name='Nguyễn Thị Mai',
            customer_phone='0933221100',
            shipping_address='78 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
            total_amount=224000,
            status='shipping',
            is_paid=True,
            bank_id='ICB',
            account_no='93287556868',
            account_name='LU TIEN PHAT',
            note='Gọi trước khi giao 15 phút'
        )
        OrderItem.objects.create(
            order=order3, product=p6, product_title=p6.title, price=p6.price, quantity=1
        )
        OrderItem.objects.create(
            order=order3, product=p7, product_title=p7.title, price=p7.price, quantity=1
        )

        # Đơn 4: Chờ chuyển khoản VietQR
        order4 = Order.objects.create(
            customer_name='Đặng Quốc Bảo',
            customer_phone='0908889999',
            shipping_address='15 Lê Duẩn, Quận Hải Châu, TP. Đà Nẵng',
            total_amount=290000,
            status='pending',
            is_paid=False,
            bank_id='ICB',
            account_no='93287556868',
            account_name='LU TIEN PHAT',
            note='Chuyển khoản VietQR qua app ngân hàng'
        )
        OrderItem.objects.create(
            order=order4, product=p5, product_title=p5.title, price=p5.price, quantity=1
        )

        # Đơn 5: Chờ thanh toán
        order5 = Order.objects.create(
            customer_name='Vũ Thùy Linh',
            customer_phone='0977112233',
            shipping_address='88 Hai Bà Trưng, Phường 6, Quận 3, TP. Hồ Chí Minh',
            total_amount=248000,
            status='pending',
            is_paid=False,
            bank_id='ICB',
            account_no='93287556868',
            account_name='LU TIEN PHAT',
            note='Màu son dưỡng hồng đào nhé shop'
        )
        OrderItem.objects.create(
            order=order5, product=p4, product_title=p4.title, price=p4.price, quantity=1
        )
        OrderItem.objects.create(
            order=order5, product=p8, product_title=p8.title, price=p8.price, quantity=1
        )

        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 5 đơn hàng mẫu (Đã giao, Đang giao, Đã xác nhận, Chờ thanh toán).'))

        # -------------------------------------------------------------
        # 5. TẠO CÁC CUỘC TRÒ CHUYỆN 1-1 VÀ TIN NHẮN MẪU
        # -------------------------------------------------------------
        # Cuộc trò chuyện 1: Khách hàng Mai với Phát Official Store
        conv1 = Conversation.objects.create(
            participant_1='Mai_Thanh_Shopaholic',
            participant_2='Phát Official Store',
            p1_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=MaiThanh',
            p2_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=PhatStore',
            last_message='Dạ vậy mình đặt 1 cái màu đen nha, cảm ơn shop!'
        )
        Message.objects.create(
            conversation=conv1,
            is_community_room=False,
            sender_name='Mai_Thanh_Shopaholic',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=MaiThanh',
            recipient_name='Phát Official Store',
            content='Shop ơi áo thun Oversize mình cao 1m62 nặng 52kg thì mặc size nào vừa xinh ạ?',
            attached_product=p2
        )
        Message.objects.create(
            conversation=conv1,
            is_community_room=False,
            sender_name='Phát Official Store',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=PhatStore',
            recipient_name='Mai_Thanh_Shopaholic',
            content='Dạ chào Mai nhé! Bạn mặc size M là chuẩn form rộng giấu quần hoặc sơ vin cực xinh nha.'
        )
        Message.objects.create(
            conversation=conv1,
            is_community_room=False,
            sender_name='Mai_Thanh_Shopaholic',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=MaiThanh',
            recipient_name='Phát Official Store',
            content='Chất vải cotton 100% giặt máy có bị xù lông hay bai cổ áo không shop?'
        )
        Message.objects.create(
            conversation=conv1,
            is_community_room=False,
            sender_name='Phát Official Store',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=PhatStore',
            recipient_name='Mai_Thanh_Shopaholic',
            content='Vải cotton 2 chiều 250gsm đã xử lý chống co rút, cổ bo gân dày dặn không lo dão bạn cứ giặt máy vô tư nhé!'
        )
        Message.objects.create(
            conversation=conv1,
            is_community_room=False,
            sender_name='Mai_Thanh_Shopaholic',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=MaiThanh',
            recipient_name='Phát Official Store',
            content='Dạ vậy mình đặt 1 cái màu đen nha, cảm ơn shop!'
        )

        # Cuộc trò chuyện 2: Khách hàng Hoàng Tech với Phát Official Store
        conv2 = Conversation.objects.create(
            participant_1='Hoang_TechReview',
            participant_2='Phát Official Store',
            p1_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=HoangTech',
            p2_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=PhatStore',
            last_message='Có đầy đủ phụ kiện nhổ keycap và nhổ switch trong hộp luôn anh nhé!'
        )
        Message.objects.create(
            conversation=conv2,
            is_community_room=False,
            sender_name='Hoang_TechReview',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=HoangTech',
            recipient_name='Phát Official Store',
            content='Bàn phím cơ Custom 75% này có hotswap 5 pin thay switch tự do được không shop?',
            attached_product=p3
        )
        Message.objects.create(
            conversation=conv2,
            is_community_room=False,
            sender_name='Phát Official Store',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=PhatStore',
            recipient_name='Hoang_TechReview',
            content='Dạ socket hotswap TTC 5 pin cao cấp luôn anh nhé, tương thích cả switch 3 pin và 5 pin!'
        )
        Message.objects.create(
            conversation=conv2,
            is_community_room=False,
            sender_name='Phát Official Store',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=PhatStore',
            recipient_name='Hoang_TechReview',
            content='Có đầy đủ phụ kiện nhổ keycap và nhổ switch trong hộp luôn anh nhé!'
        )

        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 2 cuộc trò chuyện 1-1 kèm tin nhắn hỏi đáp sản phẩm.'))

        # -------------------------------------------------------------
        # 6. TẠO TIN NHẮN PHÒNG CHAT CỘNG ĐỒNG
        # -------------------------------------------------------------
        Message.objects.create(
            is_community_room=True,
            sender_name='Tuan_Gamer',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=TuanGamer',
            content='Mới nhận con bàn phím cơ từ shop Phát, gõ đầm tay cực kỳ anh em ạ ⌨️🔥'
        )
        Message.objects.create(
            is_community_room=True,
            sender_name='Linh_Fashion',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=LinhFashion',
            content='Áo thun oversize vải dày dặn lắm nha mn, xứng đáng tiền mua ✨'
        )
        Message.objects.create(
            is_community_room=True,
            sender_name='Quoc_Bao',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=QuocBao',
            content='VietQR quét mã thanh toán 3 giây xong app tự động báo xác nhận luôn, mượt xỉu!'
        )
        Message.objects.create(
            is_community_room=True,
            sender_name='Minh_Anh',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=MinhAnh',
            content='Hóng shop lên thêm deal đồ ăn vặt khô gà lá chanh hôm nay haha 🍗'
        )
        Message.objects.create(
            is_community_room=True,
            sender_name='Phát Official Store',
            sender_avatar='https://api.dicebear.com/7.x/bottts/svg?seed=PhatStore',
            content='Cảm ơn cả nhà đã ủng hộ LoopShop! Hôm nay có mã freeship và giảm 10% cho tất cả đơn chuyển khoản nha 🎉'
        )

        self.stdout.write(self.style.SUCCESS('✓ Đã tạo tin nhắn sôi động trong phòng Chat Cộng Đồng.'))

        # -------------------------------------------------------------
        # 7. TẠO 1 BÁO CÁO VI PHẠM ĐỂ TEST MODERATION
        # -------------------------------------------------------------
        Report.objects.create(
            video=v4,
            reason='copyright',
            details='Video dùng đoạn nhạc nền chưa có bản quyền thương mại.',
            status='pending'
        )
        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 1 báo cáo vi phạm mẫu cho Admin.'))
        # -------------------------------------------------------------
        # 8. TẠO 4 MÃ VOUCHER KHUYẾN MÃI THỰC TẾ
        # -------------------------------------------------------------
        Voucher.objects.create(
            code='PHATVIP',
            title='Mã VIP Kênh TikTok Phát',
            description='Giảm 30.000₫ cho đơn từ 200k khi xem từ kênh Phát',
            discount_type='fixed',
            discount_value=30000,
            min_order_value=200000,
            is_active=True,
            used_count=18
        )
        Voucher.objects.create(
            code='FREESHIP',
            title='Miễn Phí Vận Chuyển',
            description='Hỗ trợ 25.000₫ phí ship toàn quốc cho đơn từ 150k',
            discount_type='fixed',
            discount_value=25000,
            min_order_value=150000,
            is_active=True,
            used_count=42
        )
        Voucher.objects.create(
            code='TIKTOK50K',
            title='Siêu Deal TikTok 50K',
            description='Giảm sốc 50.000₫ cho đơn hàng từ 350k',
            discount_type='fixed',
            discount_value=50000,
            min_order_value=350000,
            is_active=True,
            used_count=9
        )
        Voucher.objects.create(
            code='CHAOBANMOI',
            title='Chào Bạn Mới',
            description='Giảm 20.000₫ cho khách hàng mới với đơn từ 100k',
            discount_type='fixed',
            discount_value=20000,
            min_order_value=100000,
            is_active=True,
            used_count=65
        )
        self.stdout.write(self.style.SUCCESS('✓ Đã tạo 4 mã voucher khuyến mãi sẵn sàng cho khách áp dụng.'))
        self.stdout.write(self.style.SUCCESS('🎉 Hoàn tất toàn bộ nạp dữ liệu mẫu LoopShop!'))
