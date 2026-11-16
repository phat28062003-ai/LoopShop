import React, { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, ShieldAlert, Volume2, VolumeX, ShoppingBag, Tag } from 'lucide-react';
import type { VideoItem, Product } from '../types';

interface VideoPlayerProps {
  video: VideoItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenProduct: (product: Product) => void;
  onOpenReport: (video: VideoItem) => void;
  onLike: (videoId: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onOpenProduct,
  onOpenReport,
  onLike,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(video.likes_count);
  const [showHeartAnim, setShowHeartAnim] = useState<boolean>(false);

  // Auto-play / pause based on active state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Browser autoplay restrictions: fallback to muted
            videoEl.muted = true;
            videoEl.play().catch(() => setIsPlaying(false));
          });
      }
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Handle tap to play/pause
  const handleTogglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  // Double tap to like
  const handleDoubleTap = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
      onLike(video.id);
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLiked) {
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
      onLike(video.id);
    } else {
      setHasLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    }
  };

  const taggedProduct = video.products && video.products.length > 0 ? video.products[0] : null;

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex items-center justify-center">
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.thumbnail_url}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        onClick={handleTogglePlay}
        onDoubleClick={handleDoubleTap}
      />

      {/* Floating Heart Animation on Double Tap */}
      {showHeartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-ping opacity-90" />
        </div>
      )}

      {/* Play/Pause overlay indicator when paused */}
      {!isPlaying && isActive && (
        <div 
          onClick={handleTogglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white pl-1 shadow-lg">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Top Controls: Sound & Safety indicator */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-white/90">An toàn & Đã kiểm duyệt</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all pointer-events-auto shadow-md"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* Right Sidebar Action Buttons (TikTok UX) */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-5 z-20">
        {/* Creator Avatar */}
        <div className="relative group">
          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 shadow-lg">
            <img
              src={video.uploader_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.uploader_name}`}
              alt={video.uploader_name}
              className="w-full h-full rounded-full object-cover bg-neutral-800"
            />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow">
            +
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="flex flex-col items-center text-white group"
        >
          <div className={`p-2.5 rounded-full backdrop-blur-md transition-all transform active:scale-125 ${
            hasLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-black/40 hover:bg-black/60 text-white'
          }`}>
            <Heart className={`w-7 h-7 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </div>
          <span className="text-xs font-semibold mt-1 drop-shadow-md">
            {likesCount > 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
          </span>
        </button>

        {/* Comment Button */}
        <div className="flex flex-col items-center text-white">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all text-white">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold mt-1 drop-shadow-md">
            {video.comments_count}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center text-white">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all text-white">
            <Share2 className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold mt-1 drop-shadow-md">
            {video.shares_count}
          </span>
        </div>

        {/* Report / Safety Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenReport(video);
          }}
          className="flex flex-col items-center text-white/80 hover:text-amber-400 group transition-colors"
          title="Báo cáo vi phạm video này"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-amber-500/20 transition-all">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-[10px] font-medium mt-1 text-amber-300 drop-shadow">
            Báo cáo
          </span>
        </button>
      </div>

      {/* Bottom Information & Shopee Video Product Overlay */}
      <div className="absolute left-3 right-16 bottom-5 z-20 flex flex-col space-y-3 pointer-events-none">
        {/* Shopee Video Product Floating Badge (Gắn thẻ sản phẩm) */}
        {taggedProduct && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenProduct(taggedProduct);
            }}
            className="pointer-events-auto self-start max-w-[85%] bg-gradient-to-r from-amber-500/90 via-orange-500/95 to-rose-600/90 backdrop-blur-md text-white p-2 rounded-xl shadow-2xl flex items-center space-x-2.5 cursor-pointer border border-white/20 hover:scale-[1.02] active:scale-95 transition-all animate-pulse-subtle"
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white">
              <img
                src={taggedProduct.image_url}
                alt={taggedProduct.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold px-1 rounded-bl">
                Hot
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3 text-amber-200 flex-shrink-0" />
                <p className="text-xs font-semibold text-white truncate">
                  {taggedProduct.title}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-sm font-extrabold text-amber-100">
                  {Number(taggedProduct.price).toLocaleString('vi-VN')}₫
                </span>
                {taggedProduct.original_price && (
                  <span className="text-[10px] text-white/70 line-through">
                    {Number(taggedProduct.original_price).toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white text-orange-600 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm flex-shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Mua</span>
            </div>
          </div>
        )}

        {/* Creator Info and Caption */}
        <div className="text-white drop-shadow-md pr-4 pointer-events-auto">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm hover:underline cursor-pointer">
              @{video.uploader_name}
            </span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded text-white font-medium">
              Tác giả
            </span>
          </div>

          <p className="text-xs text-white/95 mt-1 font-normal line-clamp-2 leading-relaxed">
            {video.title} {video.description && `— ${video.description}`}
          </p>

          <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-white/70">
            <span>🎵 Âm thanh gốc - @{video.uploader_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
