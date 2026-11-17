import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin password or PIN for Phat
    if (password === 'phat123456' || password === '280603' || password === '123456') {
      setError(null);
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setError('Mật khẩu quản trị viên không chính xác!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-sm bg-neutral-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Xác Thực Quản Trị Viên</h3>
              <p className="text-[11px] text-neutral-400">Dành riêng cho Phát</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700/60 text-xs text-neutral-300 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Khu vực này được bảo mật. Nhập mật khẩu quản trị viên để mở khóa bảng điều khiển kiểm duyệt và kênh người bán.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Mật khẩu Quản trị viên
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                placeholder="Nhập mật khẩu (phat123456)..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/25 transition-all active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>Mở Khóa Quyền Quản Trị</span>
          </button>
        </form>
      </div>
    </div>
  );
};
