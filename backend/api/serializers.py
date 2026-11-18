from rest_framework import serializers
from .models import Product, Video, VideoProductTag, Order, OrderItem, Report, Comment, Conversation, Message, Voucher


class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = [
            'id', 'code', 'title', 'description', 'discount_type',
            'discount_value', 'min_order_value', 'max_discount_value',
            'is_active', 'used_count'
        ]


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'video', 'user_name', 'user_avatar', 'content', 'likes_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'likes_count']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'seller_name', 'title', 'description', 'category', 'price',
            'original_price', 'image_url', 'stock', 'rating', 'sold_count',
            'is_active', 'created_at'
        ]


class VideoProductTagSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = VideoProductTag
        fields = ['id', 'product', 'product_id', 'timestamp']


class VideoSerializer(serializers.ModelSerializer):
    tags = VideoProductTagSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Video
        fields = [
            'id', 'uploader_name', 'uploader_avatar', 'title', 'description',
            'category', 'video_url', 'thumbnail_url', 'likes_count', 'comments_count',
            'shares_count', 'is_approved', 'is_hidden', 'created_at',
            'tags', 'products'
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True, required=False
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'product_title', 'price', 'quantity']


class OrderCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_code', 'customer_name', 'customer_phone',
            'shipping_address', 'total_amount', 'original_amount', 'discount_amount',
            'voucher_code', 'status', 'payment_method',
            'payment_code', 'is_paid', 'bank_id', 'account_no', 'account_name',
            'vietqr_url', 'note', 'created_at', 'items'
        ]
        read_only_fields = ['order_code', 'payment_code', 'is_paid', 'vietqr_url', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            product_id = item_data.get('product_id')
            product = Product.objects.filter(id=product_id).first() if product_id else None
            OrderItem.objects.create(
                order=order,
                product=product,
                product_title=item_data.get('product_title', product.title if product else 'Sản phẩm'),
                price=item_data.get('price', product.price if product else 0),
                quantity=item_data.get('quantity', 1)
            )
        return order


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_code', 'customer_name', 'customer_phone',
            'shipping_address', 'total_amount', 'original_amount', 'discount_amount',
            'voucher_code', 'status', 'payment_method',
            'payment_code', 'is_paid', 'bank_id', 'account_no', 'account_name',
            'vietqr_url', 'note', 'created_at', 'updated_at', 'items'
        ]


class ReportSerializer(serializers.ModelSerializer):
    video_title = serializers.CharField(source='video.title', read_only=True)
    video_url = serializers.CharField(source='video.video_url', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'video', 'video_title', 'video_url', 'reason',
            'details', 'status', 'created_at'
        ]


class MessageSerializer(serializers.ModelSerializer):
    attached_product = ProductSerializer(read_only=True)
    attached_product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='attached_product', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'is_community_room', 'sender_name',
            'sender_avatar', 'recipient_name', 'content', 'attached_product',
            'attached_product_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'participant_1', 'participant_2', 'p1_avatar',
            'p2_avatar', 'last_message', 'updated_at', 'created_at',
            'messages_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_messages_count(self, obj):
        return obj.messages.count()
