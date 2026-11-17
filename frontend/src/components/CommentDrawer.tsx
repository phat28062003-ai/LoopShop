import React, { useState, useEffect } from 'react';
import { X, Send, Heart, MessageCircle, Loader2 } from 'lucide-react';
import type { Comment } from '../types';
import { api } from '../services/api';

interface CommentDrawerProps {
  videoId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  videoId,
  isOpen,
  onClose,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && videoId) {
      loadComments(videoId);
    }
  }, [isOpen, videoId]);

  const loadComments = async (vid: number) => {
    try {
      setIsLoading(true);
      const data = await api.getComments(vid);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !videoId) return;

    try {
      setIsSubmitting(true);
      const author = userName.trim() || 'Người xem LoopShop';
      const created = await api.postComment({
        video: videoId,
        content: newComment.trim(),
        user_name: author,
      });
      setComments([created, ...comments]);
      setNewComment('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error(err);
      alert('Không thể gửi bình luận, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      const res = await api.likeComment(commentId);
      setComments(comments.map(c => c.id === commentId ? { ...c, likes_count: res.likes_count } : c));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !videoId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-neutral-900 text-white rounded-t-3xl overflow-hidden shadow-2xl border-t border-neutral-800 flex flex-col h-[70vh] max-h-[600px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-xs text-neutral-200">
              {comments.length} bình luận
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-500 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <p className="text-xs">Đang tải bình luận...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-500 space-y-2">
              <MessageCircle className="w-10 h-10 text-neutral-700" />
              <p className="text-xs">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3 group">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700">
                  <img
                    src={comment.user_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user_name}`}
                    alt={comment.user_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-neutral-300">
                      {comment.user_name}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(comment.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-200 mt-0.5 leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>

                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="flex flex-col items-center text-neutral-500 hover:text-rose-500 transition-colors p-1"
                >
                  <Heart className={`w-3.5 h-3.5 ${comment.likes_count > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                  {comment.likes_count > 0 && (
                    <span className="text-[9px] mt-0.5">{comment.likes_count}</span>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-800 bg-neutral-900/95 space-y-2">
          <input
            type="text"
            placeholder="Tên của bạn (mặc định: Khách mua hàng)..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-neutral-800/60 border border-neutral-700/60 rounded-lg px-3 py-1.5 text-[11px] text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-orange-500"
          />

          <div className="flex items-center space-x-2">
            <input
              type="text"
              required
              placeholder="Thêm bình luận hoặc hỏi về sản phẩm..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-black font-bold transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
