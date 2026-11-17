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


def send_telegram_notification(message: str, custom_token: str = None, custom_chat_id: str = None):
    """
    Gửi tin nhắn thông báo đến Telegram Bot sử dụng urllib (không phụ thuộc thư viện ngoài).
    Trả về dict: {'success': bool, 'message': str, 'error': str|None}
    """
    cfg = get_telegram_config()
    token = (custom_token or cfg.get('bot_token') or '').strip()
    chat_id = (custom_chat_id or cfg.get('chat_id') or '').strip()

    if not token or not chat_id:
        return {
            'success': False,
            'message': 'Chưa cấu hình Telegram Bot Token hoặc Chat ID',
            'error': 'Missing token or chat_id'
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
                return {'success': True, 'message': 'Gửi thông báo Telegram thành công!'}
            return {'success': False, 'message': 'Telegram API phản hồi lỗi', 'error': str(res_json)}
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode('utf-8') if e.fp else str(e)
        print(f"[Telegram Notification Error]: {e.code} - {error_msg}")
        return {'success': False, 'message': f'HTTP Error {e.code}', 'error': error_msg}
    except Exception as e:
        print(f"[Telegram Notification Error]: {e}")
        return {'success': False, 'message': 'Không thể kết nối tới Telegram API', 'error': str(e)}
