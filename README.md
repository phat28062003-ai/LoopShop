# VidCommerce - Nền Tảng Video Ngắn Kết Hợp Thương Mại Điện Tử (TikTok + Shopee Video)

Hệ thống ứng dụng tích hợp giữa **giải trí video dọc kiểu TikTok** và **mua sắm gắn thẻ sản phẩm kiểu Shopee Video**, hoạt động trên quy mô cộng đồng khép kín, an toàn tuyệt đối về pháp lý và hỗ trợ chuyển khoản ngân hàng thông minh qua chuẩn **VietQR (Napas247)** mà không tốn phí cổng thanh toán.

---

## 🚀 Cách Khởi Động Dự Án (1-Click)

Bạn có thể khởi động toàn bộ dự án cực kỳ đơn giản bằng các file batch có sẵn:

1. **Khởi động cả 2 cùng lúc**: Nhấp đúp vào file `run_all.bat`.
2. Hoặc khởi động riêng lẻ:
   - Backend Django: `run_backend.bat` (chạy tại `http://127.0.0.1:8000`)
   - Frontend React: `run_frontend.bat` (chạy tại `http://localhost:5173`)

### 🔑 Tài khoản Quản trị viên (Admin - Phát):
- **Tên đăng nhập**: `phat`
- **Mật khẩu**: `phat123456`
- **Trang quản trị Django**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 🌟 Các Tính Năng Đã Hoàn Thiện

### 1. Dành cho Người Xem & Người Mua (User / Buyer)
- **Feed video dọc (Vertical Video Feed)**:
  - Snap-scroll mượt mà theo trục dọc trên điện thoại và máy tính.
  - Tự động phát video đang xem (Auto-play), tự động tạm dừng video đã lướt qua.
  - Thao tác: Bấm để Play/Pause, chạm 2 lần liên tiếp (Double-tap) để thả tim kèm hiệu ứng bay tim, nút bật/tắt âm thanh (Mute/Unmute), đếm lượt like/bình luận/chia sẻ.
- **Gắn thẻ sản phẩm Shopee Video (Product Tagging Overlay)**:
  - Nút thẻ sản phẩm nổi bật nhấp nháy ở góc dưới bên trái video kèm hình ảnh thu nhỏ, tên sản phẩm và giá bán VND.
  - Chạm vào thẻ mở ngăn kéo chi tiết (Product Bottom Sheet Drawer) để xem đánh giá sao, số lượng đã bán, mô tả chi tiết, tùy chọn số lượng và nút "Thêm vào giỏ" / "Mua ngay".
- **Giỏ hàng & Thanh toán VietQR an toàn**:
  - Quản lý giỏ hàng trực quan: thêm, bớt, xóa sản phẩm, tính tổng tiền tự động.
  - Modal thanh toán tạo mã VietQR chuẩn Napas247 tương thích với tất cả app ngân hàng tại Việt Nam (MBBank, Vietcombank, Techcombank, ACB, BIDV,...).
  - Có sẵn nút bấm sao chép số tài khoản, số tiền và nội dung chuyển khoản nhanh chóng.
- **Báo cáo vi phạm an toàn (Safety First)**:
  - Nút lá chắn báo cáo (Report) trên từng video với 4 danh mục: Bản quyền, Hàng giả/Lừa đảo, Nội dung phản cảm, Khác.

### 2. Dành cho Người Bán (Seller Studio)
- **Đăng tải Video & Gắn sản phẩm**:
  - Nhập tiêu đề, mô tả, link video MP4 (hỗ trợ chọn nhanh các video mẫu có sẵn hoặc link Cloudinary).
  - Chọn sản phẩm từ danh mục cửa hàng để gắn trực tiếp lên video vừa đăng.
- **Quản lý đơn hàng**:
  - Xem danh sách đơn hàng của khách theo thời gian thực.
  - Kiểm tra trạng thái: Chờ chuyển khoản, Đã xác nhận, Đang vận chuyển, Hoàn thành.
  - Nút **"Xác nhận đã nhận tiền (VietQR)"** giúp người bán chốt đơn ngay khi nhận thông báo biến động số dư.

### 3. Dành cho Quản trị viên (Admin Dashboard - Phát)
- **Thống kê tổng quan**:
  - Doanh thu thực tế đã thu qua VietQR.
  - Tổng số đơn hàng và đơn chờ duyệt.
  - Số lượng video đang hoạt động vs video đang bị ẩn.
- **Kiểm duyệt vi phạm (1-Click Action)**:
  - Danh sách video bị người dùng report.
  - Nút **"Ẩn video ngay lập tức"** (soft ban) rút video khỏi feed người dùng ngay trong thời gian thực ($< 1$ giây) bảo vệ an toàn pháp lý.
  - Nút **"Bỏ qua"** nếu video hợp lệ.
- **Bật/Tắt trạng thái hiển thị của bất kỳ video nào** trong hệ thống.

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

- **Backend**: Python 3.12 + Django 6.1 + Django REST Framework + CORS Headers + SQLite (dev) / PostgreSQL (prod).
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons.
- **Thanh toán**: Dịch vụ VietQR Generator API (Napas247 chuẩn quốc gia, không tốn phí cổng thanh toán).
- **Mobile Web App**: Chuẩn PWA (Progressive Web App) với `manifest.json`, hỗ trợ "Thêm vào màn hình chính" (Add to Home Screen) trên cả iOS và Android.

---

## ☁️ Hướng Dẫn Triển Khai Thực Tế (Deployment Guide)

### 1. Backend lên PythonAnywhere (Miễn phí)
1. Tạo tài khoản miễn phí tại [pythonanywhere.com](https://www.pythonanywhere.com).
2. Vào tab **Consoles** -> mở Bash console -> clone repo hoặc upload thư mục `backend/`.
3. Tạo virtualenv và cài đặt:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.10 vidcommerce-env
   pip install django djangorestframework django-cors-headers pillow
   python manage.py migrate
   python manage.py seed_data
   ```
4. Vào tab **Web** -> Tạo ứng dụng WSGI -> Trỏ vào project `core` và cấu hình virtualenv `vidcommerce-env`.

### 2. Frontend lên Vercel (Miễn phí)
1. Đăng ký tài khoản tại [vercel.com](https://vercel.com).
2. Kết nối kho lưu trữ GitHub của bạn.
3. Chọn thư mục `frontend` làm Root Directory.
4. Framework Preset chọn: **Vite**.
5. Nhấn **Deploy** -> Vercel sẽ tự động cấp phát domain HTTPS miễn phí.
