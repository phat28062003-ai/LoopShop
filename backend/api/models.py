import uuid
from django.db import models

CATEGORY_CHOICES = [
    ('all', 'Tất cả'),
    ('tech', 'Công nghệ ⚡'),
    ('fashion', 'Thời trang 👕'),
    ('lifestyle', 'Đời sống 🏠'),
    ('food', 'Ẩm thực 🍔'),
    ('beauty', 'Làm đẹp 💄'),
]


class Product(models.Model):
    seller_name = models.CharField(max_length=100, default='Phát Official Store')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='tech')
    price = models.DecimalField(max_digits=12, decimal_places=0)  # VND
    original_price = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True, help_text="Giá vốn nhập / Giá sỉ Dropship (VND)")
    commission_rate = models.FloatField(default=15.0, help_text="% Hoa hồng Affiliate dự kiến")
    affiliate_url = models.CharField(max_length=500, blank=True, default='', help_text="Link gốc TikTok Shop / Shopee Affiliate")
    is_dropship = models.BooleanField(default=True, help_text="Mô hình Dropship/Affiliate không ôm hàng")
    image_url = models.CharField(max_length=500)
    stock = models.PositiveIntegerField(default=100)
    rating = models.FloatField(default=4.9)
    sold_count = models.PositiveIntegerField(default=150)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.price:,.0f} VND"


class Video(models.Model):
    uploader_name = models.CharField(max_length=100, default='phat_creator')
    uploader_avatar = models.CharField(max_length=500, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='tech')
    video_url = models.CharField(max_length=500)
    thumbnail_url = models.CharField(max_length=500, blank=True)
    likes_count = models.PositiveIntegerField(default=120)
    comments_count = models.PositiveIntegerField(default=24)
    shares_count = models.PositiveIntegerField(default=15)
    is_approved = models.BooleanField(default=True)
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    products = models.ManyToManyField(Product, through='VideoProductTag', related_name='videos', blank=True)

    def __str__(self):
        return f"{self.title} (by {self.uploader_name})"


class VideoProductTag(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='tags')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='video_tags')
    timestamp = models.FloatField(default=0.0, help_text="Thời điểm xuất hiện trên video (giây)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tag: {self.product.title} in {self.video.title}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ chuyển khoản'),
        ('confirmed', 'Đã xác nhận & Thanh toán'),
        ('preparing', 'Đang đóng gói hàng'),
        ('shipping', 'Đang vận chuyển'),
        ('completed', 'Đã hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]

    order_code = models.CharField(max_length=32, unique=True)
    customer_name = models.CharField(max_length=120)
    customer_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=0)
    original_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    voucher_code = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, default='vietqr')
    payment_code = models.CharField(max_length=32)
    is_paid = models.BooleanField(default=False)

    # VietQR banking details for this store (VietinBank - LU TIEN PHAT - 93287556868)
    bank_id = models.CharField(max_length=30, default='ICB')
    account_no = models.CharField(max_length=30, default='93287556868')
    account_name = models.CharField(max_length=120, default='LU TIEN PHAT')
    vietqr_url = models.CharField(max_length=500, blank=True)

    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def generate_vietqr_url(self):
        """
        Sinh URL VietQR theo chuẩn Napas247:
        https://img.vietqr.io/image/<BANK>-<ACC>-compact2.png?amount=<AMOUNT>&addInfo=<MEMO>&accountName=<NAME>
        """
        memo = f"DON HANG {self.order_code}"
        return f"https://img.vietqr.io/image/{self.bank_id}-{self.account_no}-compact2.png?amount={int(self.total_amount)}&addInfo={memo}&accountName={self.account_name}"

    def save(self, *args, **kwargs):
        if not self.order_code:
            self.order_code = f"PH-{uuid.uuid4().hex[:8].upper()}"
        if not self.payment_code:
            self.payment_code = self.order_code
        if not self.original_amount:
            self.original_amount = self.total_amount
        if not self.vietqr_url:
            self.vietqr_url = self.generate_vietqr_url()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_code} - {self.total_amount:,.0f} VND - {self.status}"


class Voucher(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('fixed', 'Số tiền cố định (VNĐ)'),
        ('percent', 'Phần trăm (%)'),
    ]

    code = models.CharField(max_length=32, unique=True)
    title = models.CharField(max_length=150)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default='fixed')
    discount_value = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    min_order_value = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    max_discount_value = models.DecimalField(max_digits=12, decimal_places=0, default=0, help_text="Áp dụng cho giảm theo %")
    is_active = models.BooleanField(default=True)
    used_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_discount(self, order_amount):
        """
        Tính số tiền giảm dựa trên giá trị đơn hàng
        """
        order_amount_int = int(order_amount)
        min_order_int = int(self.min_order_value)
        if order_amount_int < min_order_int:
            return 0
        if self.discount_type == 'fixed':
            return min(int(self.discount_value), order_amount_int)
        elif self.discount_type == 'percent':
            raw = (order_amount_int * int(self.discount_value)) // 100
            max_disc = int(self.max_discount_value)
            if max_disc > 0:
                raw = min(raw, max_disc)
            return min(raw, order_amount_int)
        return 0

    def __str__(self):
        return f"Voucher {self.code} - {self.title}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=0)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.product_title} in {self.order.order_code}"


class Report(models.Model):
    REASON_CHOICES = [
        ('copyright', 'Vi phạm bản quyền'),
        ('scam', 'Lừa đảo / Hàng giả kém chất lượng'),
        ('inappropriate', 'Nội dung phản cảm / Không phù hợp'),
        ('other', 'Lý do khác'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Chờ xem xét'),
        ('resolved', 'Đã xử lý (Đã ẩn video)'),
        ('dismissed', 'Bỏ qua (Video hợp lệ)'),
    ]

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='reports')
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report #{self.id} on Video #{self.video.id}: {self.reason}"


class Comment(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    user_name = models.CharField(max_length=100, default='Khách mua hàng')
    user_avatar = models.CharField(max_length=500, blank=True)
    content = models.TextField()
    likes_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user_name}: {self.content[:30]}"


class Conversation(models.Model):
    participant_1 = models.CharField(max_length=100)
    participant_2 = models.CharField(max_length=100)
    p1_avatar = models.CharField(max_length=500, blank=True)
    p2_avatar = models.CharField(max_length=500, blank=True)
    last_message = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat between {self.participant_1} and {self.participant_2}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    is_community_room = models.BooleanField(default=False)
    sender_name = models.CharField(max_length=100)
    sender_avatar = models.CharField(max_length=500, blank=True)
    recipient_name = models.CharField(max_length=100, blank=True)
    content = models.TextField()
    attached_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        dest = 'Community' if self.is_community_room else self.recipient_name
        return f"{self.sender_name} -> {dest}: {self.content[:30]}"
