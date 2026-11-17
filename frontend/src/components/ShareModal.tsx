import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ExternalLink
} from 'lucide-react';
import type { VideoItem } from '../types';
import { api } from '../services/api';

interface ShareModalProps {
  isOpen: boolean;
  video: VideoItem | null;
  onClose: () => void;
  onShared?: (videoId: number, newCount: number) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  video,
  onClose,
  onShared
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  if (!isOpen || !video) return null;

  // Generate shareable link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://loopshop.onrender.com';
  const shareUrl = `${origin}/?video=${video.id}`;

  const trackShare = async () => {
    try {
      const res = await api.shareVideo(video.id);
      if (onShared) {
        onShared(video.id, res.shares_count);
      }
    } catch (err) {
      console.warn('Could not record share count:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShare();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      trackShare();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Xem video trên LoopShop: ${video.title}`,
          text: video.description || `Khám phá các sản phẩm hot trên LoopShop!`,
          url: shareUrl,
        });
        trackShare();
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleFacebookShare = () => {
    trackShare();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleZaloShare = () => {
    trackShare();
    // Zalo web share dialog
    const zaloUrl = `https://sp.zalo.me/share_inline?link=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(video.title)}`;
    window.open(zaloUrl, '_blank', 'noopener,noreferrer,width=600,height=550');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Chia sẻ video</h3>
              <p className="text-xs text-neutral-400">Lan tỏa sản phẩm tới bạn bè</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Card Brief */}
        <div className="flex items-center space-x-3 bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/50">
          <div className="w-14 h-18 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700">
            {video.thumbnail_url ? (
              <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-rose-900 text-xs font-bold">
                Loop
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-neutral-100 line-clamp-1">{video.title}</h4>
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{video.description || 'Khám phá video mua sắm hot trên LoopShop!'}</p>
            <span className="inline-block mt-1 text-[11px] text-rose-400 font-medium">@{video.uploader_name}</span>
          </div>
        </div>

        {/* Share Channels Grid */}
        <div className="grid grid-cols-4 gap-3 py-1 text-center">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all transform group-active:scale-95 shadow-md ${
              copied ? 'bg-emerald-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}>
              {copied ? <Check className="w-6 h-6 animate-bounce" /> : <Copy className="w-6 h-6" />}
            </div>
            <span className={`text-[11px] mt-1.5 font-medium ${copied ? 'text-emerald-400 font-bold' : 'text-neutral-300'}`}>
              {copied ? 'Đã chép!' : 'Chép link'}
            </span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/30 flex items-center justify-center transition-all transform group-active:scale-95 shadow-md">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span className="text-[11px] mt-1.5 text-neutral-300 font-medium">Facebook</span>
          </button>

          {/* Zalo */}
          <button
            onClick={handleZaloShare}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#0068FF]/20 hover:bg-[#0068FF]/30 text-[#0068FF] border border-[#0068FF]/30 flex items-center justify-center transition-all transform group-active:scale-95 shadow-md font-bold text-sm">
              Zalo
            </div>
            <span className="text-[11px] mt-1.5 text-neutral-300 font-medium">Zalo</span>
          </button>

          {/* QR Code toggle */}
          <button
            onClick={() => setShowQr(!showQr)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all transform group-active:scale-95 shadow-md ${
              showQr ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}>
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-[11px] mt-1.5 text-neutral-300 font-medium">Mã QR</span>
          </button>
        </div>

        {/* QR Code Expand Section */}
        {showQr && (
          <div className="p-4 bg-neutral-800/80 rounded-2xl border border-neutral-700/60 flex flex-col items-center space-y-3 animate-fade-in">
            <p className="text-xs text-neutral-300 text-center">Quét mã QR bằng điện thoại để mở video ngay</p>
            <div className="p-2.5 bg-white rounded-xl shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`}
                alt="QR Code"
                className="w-40 h-40"
              />
            </div>
            <span className="text-[10px] text-neutral-400">Link: {shareUrl}</span>
          </div>
        )}

        {/* Native Web Share API (if available on mobile device) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-98"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Mở menu chia sẻ hệ thống</span>
          </button>
        )}

        {/* Copy Link Direct Row */}
        <div className="flex items-center space-x-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-neutral-400 px-2 py-1 outline-none truncate select-all"
          />
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
              copied ? 'bg-emerald-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Chép</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
