import os
import json
import urllib.request
import urllib.error
from django.conf import settings

# Path to store runtime telegram config if saved via UI
TELEGRAM_CONFIG_FILE = os.path.join(settings.BASE_DIR, 'telegram_config.json')


def get_telegram_config():
    """
    Lấy cấu hình Telegram Bot từ biến môi trường hoặc file runtime config
    """
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '').strip()
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '').strip()

    if (not token or not chat_id) and os.path.exists(TELEGRAM_CONFIG_FILE):
        try:
            with open(TELEGRAM_CONFIG_FILE, 'r', encoding='utf-8') as f:
                saved = json.load(f)
                if not token:
                    token = saved.get('bot_token', '').strip()
                if not chat_id:
                    chat_id = saved.get('chat_id', '').strip()
        except Exception as e:
            print(f"[Telegram] Error reading config file: {e}")

    return {
        'bot_token': token,
        'chat_id': chat_id,
        'is_configured': bool(token and chat_id)
    }


def save_telegram_config(bot_token: str, chat_id: str):
    """
    Lưu cấu hình Telegram Bot từ giao diện Admin
    """
    config = {
        'bot_token': bot_token.strip(),
        'chat_id': chat_id.strip()
    }
    with open(TELEGRAM_CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    return config


def parse_telegram_error_response(http_code: int, raw_body: str) -> dict:
    """
    Chuyển đổi phản hồi lỗi JSON thô từ Telegram thành thông báo tiếng Việt thân thiện và dễ hiểu.
    """
    title = "Gửi thông báo thất bại"
    user_msg = f"Lỗi từ máy chủ Telegram (Mã {http_code})"
    hint = "Vui lòng kiểm tra lại cấu hình Bot Token và Chat ID."

    desc = ""
    try:
        parsed = json.loads(raw_body)
        desc = parsed.get("description", "")
    except Exception:
        desc = str(raw_body)

    desc_lower = desc.lower()

    if http_code == 404 or "not found" in desc_lower:
        title = "Bot Token không tồn tại"
        user_msg = "Mã Bot Token không tìm thấy trên hệ sinh thái Telegram."
        hint = "Vui lòng kiểm tra lại mã Token copy từ @BotFather (Token hợp lệ có dạng: 123456789:AAH...)."
    elif "chat not found" in desc_lower:
        title = "Không tìm thấy Chat ID"
        user_msg = "Telegram không tìm thấy cuộc trò chuyện với Chat ID này."
        hint = "Bạn cần mở Telegram, tìm tên Bot vừa tạo và bấm nút 'Bắt đầu' (Start) để kích hoạt. Sau đó dùng @userinfobot kiểm tra lại Chat ID."
    elif http_code == 401 or "unauthorized" in desc_lower:
        title = "Bot Token không hợp lệ"
        user_msg = "Bot Token không có quyền truy cập hoặc đã bị thu hồi."
        hint = "Hãy mở chat với @BotFather và gõ /token để lấy lại mã Token mới."
    elif http_code == 403 or "blocked by the user" in desc_lower:
        title = "Bot đang bị chặn"
        user_msg = "Bạn đang chặn (block) Bot này trên Telegram."
        hint = "Vui lòng mở cuộc trò chuyện với Bot và bấm 'Bỏ chặn' (Unblock) để nhận thông báo đơn hàng."
    elif "bad request" in desc_lower:
        title = "Thông tin không hợp lệ"
        user_msg = f"Telegram báo lỗi: {desc}"
        hint = "Kiểm tra lại định dạng Chat ID (ID cá nhân là dãy số, ID nhóm bắt đầu bằng -100)."
    elif desc:
        user_msg = desc

    return {
        'title': title,
        'message': user_msg,
        'hint': hint,
        'raw_error': desc
    }


def send_telegram_notification(message: str, custom_token: str = None, custom_chat_id: str = None):
    """
    Gửi tin nhắn thông báo đến Telegram Bot sử dụng urllib (không phụ thuộc thư viện ngoài).
    Trả về dict: {'success': bool, 'title': str, 'message': str, 'hint': str|None, 'error': str|None}
    """
    cfg = get_telegram_config()
    token = (custom_token or cfg.get('bot_token') or '').strip()
    chat_id = (custom_chat_id or cfg.get('chat_id') or '').strip()

    if not token or not chat_id:
        return {
            'success': False,
            'title': 'Chưa đủ thông tin',
            'message': 'Chưa cấu hình Telegram Bot Token hoặc Chat ID.',
            'hint': 'Vui lòng điền cả Bot Token và Chat ID trước khi gửi tin nhắn test.',
            'error': 'Chưa cấu hình Bot Token hoặc Chat ID'
        }

    # Kiểm tra nhanh định dạng Bot Token trước khi gửi
    # Token Telegram tiêu chuẩn luôn có dạng: <id_số>:<chuỗi_kí_tự_ngẫu_nhiên> (dài khoảng 40-50 ký tự)
    if ':' not in token or len(token) < 15 or not any(c.isdigit() for c in token.split(':')[0]):
        return {
            'success': False,
            'title': 'Định dạng Bot Token chưa đúng',
            'message': f'"{token}" không phải là định dạng Token chuẩn của Telegram.',
            'hint': 'Bot Token lấy từ @BotFather thường có dạng: 123456789:AAHk_xY8...(gồm dãy số, dấu hai chấm và mã bí mật).',
            'error': 'Định dạng Bot Token chưa đúng'
        }

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'HTML',
        'disable_web_page_preview': True
    }

    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            if res_json.get('ok'):
                return {
                    'success': True,
                    'title': 'Gửi thành công!',
                    'message': 'Gửi thông báo Telegram thành công!'
                }
            return {
                'success': False,
                'title': 'Telegram từ chối gửi tin',
                'message': str(res_json.get('description', 'Telegram API phản hồi lỗi')),
                'error': str(res_json.get('description', 'Telegram API phản hồi lỗi'))
            }
    except urllib.error.HTTPError as e:
        raw_msg = e.read().decode('utf-8') if e.fp else str(e)
        print(f"[Telegram Notification Error]: {e.code} - {raw_msg}")
        parsed_err = parse_telegram_error_response(e.code, raw_msg)
        return {
            'success': False,
            'title': parsed_err['title'],
            'message': parsed_err['message'],
            'hint': parsed_err['hint'],
            'error': parsed_err['message']
        }
    except urllib.error.URLError as e:
        print(f"[Telegram URLError]: {e}")
        return {
            'success': False,
            'title': 'Không có kết nối mạng',
            'message': 'Không thể kết nối đến máy chủ api.telegram.org.',
            'hint': 'Vui lòng kiểm tra lại kết nối mạng internet của máy chủ.',
            'error': 'Không thể kết nối tới api.telegram.org'
        }
    except Exception as e:
        print(f"[Telegram Notification Error]: {e}")
        return {
            'success': False,
            'title': 'Lỗi kết nối',
            'message': 'Không thể kết nối tới Telegram API.',
            'hint': 'Vui lòng kiểm tra đường truyền mạng hoặc thử lại sau vài giây.',
            'error': str(e)
        }
