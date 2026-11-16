import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import type { VideoItem } from '../types';
import { api } from '../services/api';

interface ReportModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ video, isOpen, onClose }) => {
  const [reason, setReason] = useState<string>('copyright');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen || !video) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.submitReport({
        video: video.id,
        reason: reason,
        details: details,
      });
      setIsDone(true);
    } catch (err) {
      console.error(err);
      alert('Không thể gửi báo cáo, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsDone(false);
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-sm bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-neutral-100">
              Báo cáo vi phạm nội dung
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {isDone ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white">Đã gửi báo cáo thành công</h4>
              <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                Đội ngũ Quản trị viên (Admin Phát) sẽ kiểm duyệt và xử lý video này trong thời gian sớm nhất để bảo đảm an toàn cộng đồng.
              </p>
              <button
                onClick={handleResetAndClose}
                className="mt-2 px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Video: <strong>{video.title}</strong> (@{video.uploader_name})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Lý do vi phạm:
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'copyright', label: 'Vi phạm bản quyền âm thanh / hình ảnh' },
                    { id: 'scam', label: 'Lừa đảo / Hàng giả kém chất lượng' },
                    { id: 'inappropriate', label: 'Nội dung phản cảm / Không phù hợp' },
                    { id: 'other', label: 'Lý do khác' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        reason === item.id
                          ? 'bg-amber-500/10 border-amber-500/60 text-amber-200'
                          : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={item.id}
                        checked={reason === item.id}
                        onChange={() => setReason(item.id)}
                        className="text-amber-500 focus:ring-0"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Mô tả chi tiết (tùy chọn):
                </label>
                <textarea
                  rows={3}
                  placeholder="Cung cấp thêm thông tin vi phạm..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi báo cáo vi phạm</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
