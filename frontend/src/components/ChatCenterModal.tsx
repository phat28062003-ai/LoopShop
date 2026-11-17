import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Users, 
  MessageSquare, 
  ArrowLeft, 
  User, 
  Loader2, 
  Tag
} from 'lucide-react';
import type { Message, Conversation, Product } from '../types';
import { api } from '../services/api';

interface ChatCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetUser?: string | null;
  initialAttachedProduct?: Product | null;
  onViewProduct?: (product: Product) => void;
}

export const ChatCenterModal: React.FC<ChatCenterModalProps> = ({
  isOpen,
  onClose,
  initialTargetUser,
  initialAttachedProduct,
  onViewProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'community' | 'direct'>('community');
  
  // Current user nickname stored in localStorage
  const [myUsername, setMyUsername] = useState<string>(() => {
    return localStorage.getItem('loopshop_user_nickname') || `Thành viên #${Math.floor(100 + Math.random() * 900)}`;
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editNameInput, setEditNameInput] = useState<string>('');

  // Community Chat State
  const [communityMessages, setCommunityMessages] = useState<Message[]>([]);
  const [newCommunityText, setNewCommunityText] = useState('');

  // 1-on-1 Direct Chat State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [directMessages, setDirectMessages] = useState<Message[]>([]);
  const [newDirectText, setNewDirectText] = useState('');
  const [targetUserSearch, setTargetUserSearch] = useState('');

  // Product attachment state
  const [attachedProduct, setAttachedProduct] = useState<Product | null>(initialAttachedProduct || null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync attached product when prop changes
  useEffect(() => {
    if (initialAttachedProduct) {
      setAttachedProduct(initialAttachedProduct);
    }
  }, [initialAttachedProduct]);

  // Handle opening directly with a target user (e.g. from video creator)
  useEffect(() => {
    if (isOpen && initialTargetUser) {
      setActiveTab('direct');
      openOrCreateConversation(initialTargetUser);
    }
  }, [isOpen, initialTargetUser]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [communityMessages, directMessages, activeConversation]);

  // Load Community Messages
  const fetchCommunity = async () => {
    try {
      const data = await api.getCommunityMessages();
      setCommunityMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load 1-on-1 Conversations
  const fetchConversations = async () => {
    try {
      const data = await api.getConversations(myUsername);
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load Messages for Active Conversation
  const fetchActiveDirectMessages = async (convId: number) => {
    try {
      const data = await api.getConversationMessages(convId);
      setDirectMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Polling every 3.5s when modal is open
  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'community') {
      fetchCommunity();
    } else {
      fetchConversations();
      if (activeConversation) {
        fetchActiveDirectMessages(activeConversation.id);
      }
    }

    const interval = setInterval(() => {
      if (activeTab === 'community') {
        fetchCommunity();
      } else if (activeConversation) {
        fetchActiveDirectMessages(activeConversation.id);
      } else {
        fetchConversations();
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, activeConversation, myUsername]);

  const openOrCreateConversation = async (targetUser: string) => {
    try {
      setIsLoading(true);
      const conv = await api.startOrGetConversation({
        user1: myUsername,
        user2: targetUser,
      });
      setActiveConversation(conv);
      await fetchActiveDirectMessages(conv.id);
    } catch (err) {
      console.error(err);
      alert('Không thể mở cuộc trò chuyện');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCommunityMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityText.trim()) return;

    try {
      setIsSending(true);
      const msg = await api.sendMessage({
        is_community_room: true,
        sender_name: myUsername,
        sender_avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${myUsername}`,
        content: newCommunityText.trim(),
        attached_product_id: attachedProduct ? attachedProduct.id : null,
      });
      setCommunityMessages((prev) => [...prev, msg]);
      setNewCommunityText('');
      setAttachedProduct(null);
    } catch (err) {
      console.error(err);
      alert('Không thể gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectText.trim() || !activeConversation) return;

    const recipient = activeConversation.participant_1.toLowerCase() === myUsername.toLowerCase()
      ? activeConversation.participant_2
      : activeConversation.participant_1;

    try {
      setIsSending(true);
      const msg = await api.sendMessage({
        conversation: activeConversation.id,
        is_community_room: false,
        sender_name: myUsername,
        sender_avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${myUsername}`,
        recipient_name: recipient,
        content: newDirectText.trim(),
        attached_product_id: attachedProduct ? attachedProduct.id : null,
      });
      setDirectMessages((prev) => [...prev, msg]);
      setNewDirectText('');
      setAttachedProduct(null);
    } catch (err) {
      console.error(err);
      alert('Không thể gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  const saveNickname = () => {
    if (editNameInput.trim()) {
      setMyUsername(editNameInput.trim());
      localStorage.setItem('loopshop_user_nickname', editNameInput.trim());
    }
    setIsEditingName(false);
  };

  if (!isOpen) return null;

  const otherParticipant = activeConversation
    ? activeConversation.participant_1.toLowerCase() === myUsername.toLowerCase()
      ? activeConversation.participant_2
      : activeConversation.participant_1
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-neutral-900 text-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col h-[85vh] max-h-[720px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-800 bg-neutral-900/95 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            {activeConversation && activeTab === 'direct' ? (
              <button
                onClick={() => setActiveConversation(null)}
                className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="Quay lại danh sách"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
            )}

            <div className="min-w-0">
              {activeConversation && activeTab === 'direct' ? (
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-white truncate">
                    @{otherParticipant}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
              ) : (
                <h3 className="font-bold text-xs text-white truncate">
                  Trung Tâm Tin Nhắn LoopShop
                </h3>
              )}

              {/* Editable User Identity */}
              <div className="flex items-center space-x-1 text-[11px] text-neutral-400">
                <span>Bạn: </span>
                {isEditingName ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={editNameInput}
                      onChange={(e) => setEditNameInput(e.target.value)}
                      placeholder="Nhập tên bạn..."
                      className="bg-neutral-800 text-white text-[11px] px-1.5 py-0.5 rounded border border-neutral-700 w-28 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={saveNickname}
                      className="text-orange-400 text-[10px] font-bold hover:underline"
                    >
                      Lưu
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => {
                      setEditNameInput(myUsername);
                      setIsEditingName(true);
                    }}
                    className="text-orange-400 font-semibold cursor-pointer hover:underline flex items-center space-x-0.5"
                    title="Bấm để đổi tên hiển thị của bạn"
                  >
                    <span>{myUsername}</span>
                    <span className="text-[10px] text-neutral-500">✏️</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs (Cộng đồng vs Tin nhắn riêng) */}
        {!activeConversation && (
          <div className="p-2 border-b border-neutral-800 bg-neutral-950/60 flex space-x-2">
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'community'
                  ? 'bg-orange-500 text-black font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Phòng Chat Cộng Đồng</span>
            </button>

            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'direct'
                  ? 'bg-orange-500 text-black font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Tin Nhắn Riêng (1-1)</span>
              {conversations.length > 0 && (
                <span className="bg-neutral-800 text-white text-[10px] px-1.5 rounded-full">
                  {conversations.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* TAB 1: PHÒNG CHAT CỘNG ĐỒNG */}
        {activeTab === 'community' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Community Notice */}
            <div className="bg-amber-950/20 border-b border-amber-800/30 px-3 py-1.5 text-[11px] text-amber-300 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Phòng trò chuyện chung cho tất cả thành viên trong cộng đồng LoopShop.</span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {communityMessages.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 text-xs">
                  Chưa có tin nhắn nào trong phòng cộng đồng. Hãy gửi tin nhắn đầu tiên!
                </div>
              ) : (
                communityMessages.map((msg) => {
                  const isMe = msg.sender_name.toLowerCase() === myUsername.toLowerCase();
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <img
                        src={msg.sender_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender_name}`}
                        alt={msg.sender_name}
                        className="w-7 h-7 rounded-full bg-neutral-800 flex-shrink-0"
                      />

                      <div className={`max-w-[78%] space-y-1 ${isMe ? 'items-end' : ''}`}>
                        <div className={`flex items-center space-x-1.5 text-[10px] ${isMe ? 'justify-end' : ''}`}>
                          <span className="font-semibold text-neutral-400">
                            {isMe ? 'Bạn' : msg.sender_name}
                          </span>
                          <span className="text-neutral-600">
                            {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Attached Product Preview Card if present */}
                        {msg.attached_product && (
                          <div 
                            onClick={() => onViewProduct && onViewProduct(msg.attached_product!)}
                            className="p-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center space-x-2.5 cursor-pointer hover:border-orange-500/50 transition-colors"
                          >
                            <img
                              src={msg.attached_product.image_url}
                              alt={msg.attached_product.title}
                              className="w-10 h-10 rounded-lg object-cover bg-neutral-900"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-white truncate">
                                {msg.attached_product.title}
                              </p>
                              <span className="text-xs font-bold text-orange-400">
                                {Number(msg.attached_product.price).toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                          </div>
                        )}

                        <div
                          className={`p-2.5 rounded-2xl text-xs leading-relaxed break-words ${
                            isMe
                              ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-tr-none'
                              : 'bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached Product Bar before sending */}
            {attachedProduct && (
              <div className="p-2 bg-neutral-800/90 border-t border-neutral-700 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <Tag className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <span className="text-neutral-300 truncate">
                    Đính kèm: <strong>{attachedProduct.title}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setAttachedProduct(null)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Community Input Bar */}
            <form onSubmit={handleSendCommunityMessage} className="p-3 border-t border-neutral-800 bg-neutral-900/95 flex items-center space-x-2">
              <input
                type="text"
                required
                placeholder="Nhắn tin với cộng đồng..."
                value={newCommunityText}
                onChange={(e) => setNewCommunityText(e.target.value)}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={isSending || !newCommunityText.trim()}
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-black font-bold transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: TIN NHẮN RIÊNG 1-1 */}
        {activeTab === 'direct' && (
          <div className="flex-1 flex flex-col min-h-0">
            {!activeConversation ? (
              // Conversation List
              <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3">
                {/* Search / Start new chat */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Nhập tên thành viên (ví dụ: phat_review)..."
                    value={targetUserSearch}
                    onChange={(e) => setTargetUserSearch(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => {
                      if (targetUserSearch.trim()) {
                        openOrCreateConversation(targetUserSearch.trim());
                      }
                    }}
                    disabled={!targetUserSearch.trim()}
                    className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-black font-bold text-xs rounded-xl transition-all"
                  >
                    Nhắn tin
                  </button>
                </div>

                {/* Popular Accounts Quick Starters */}
                <div className="flex items-center space-x-2 text-[11px] overflow-x-auto no-scrollbar py-1">
                  <span className="text-neutral-500 flex-shrink-0">Gợi ý:</span>
                  {['phat_review', 'phat_creator', 'phat_outfits'].map((user) => (
                    <button
                      key={user}
                      onClick={() => openOrCreateConversation(user)}
                      className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-orange-300 border border-neutral-700 flex-shrink-0 transition-colors"
                    >
                      @{user}
                    </button>
                  ))}
                </div>

                {/* Conversation List Items */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {isLoading ? (
                    <div className="py-16 text-center text-neutral-500 text-xs flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                      <p>Đang tải cuộc trò chuyện...</p>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="py-16 text-center text-neutral-500 text-xs space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-neutral-700" />
                      <p>Chưa có cuộc trò chuyện riêng nào.</p>
                      <span className="text-[11px] text-neutral-600">
                        Bấm vào tên bất kỳ tác giả video nào để bắt đầu trò chuyện!
                      </span>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const otherName = conv.participant_1.toLowerCase() === myUsername.toLowerCase()
                        ? conv.participant_2
                        : conv.participant_1;
                      const otherAvatar = conv.participant_1.toLowerCase() === myUsername.toLowerCase()
                        ? conv.p2_avatar
                        : conv.p1_avatar;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setActiveConversation(conv);
                            fetchActiveDirectMessages(conv.id);
                          }}
                          className="flex items-center space-x-3 p-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 cursor-pointer transition-colors"
                        >
                          <img
                            src={otherAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${otherName}`}
                            alt={otherName}
                            className="w-11 h-11 rounded-full bg-neutral-800 object-cover flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-white truncate">
                                @{otherName}
                              </h4>
                              <span className="text-[10px] text-neutral-500">
                                {new Date(conv.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className="text-xs text-neutral-400 truncate mt-0.5">
                              {conv.last_message || 'Bắt đầu cuộc trò chuyện'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // Inside Active 1-on-1 Conversation
              <div className="flex-1 flex flex-col min-h-0">
                {/* Direct Messages Feed */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                  {directMessages.length === 0 ? (
                    <div className="py-16 text-center text-neutral-500 text-xs">
                      Chưa có tin nhắn nào giữa bạn và @{otherParticipant}. Hãy gửi lời chào!
                    </div>
                  ) : (
                    directMessages.map((msg) => {
                      const isMe = msg.sender_name.toLowerCase() === myUsername.toLowerCase();
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
                        >
                          <img
                            src={msg.sender_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender_name}`}
                            alt={msg.sender_name}
                            className="w-7 h-7 rounded-full bg-neutral-800 flex-shrink-0"
                          />

                          <div className={`max-w-[78%] space-y-1 ${isMe ? 'items-end' : ''}`}>
                            {/* Attached Product Preview Card */}
                            {msg.attached_product && (
                              <div 
                                onClick={() => onViewProduct && onViewProduct(msg.attached_product!)}
                                className="p-2 rounded-xl bg-neutral-800/90 border border-neutral-700/80 flex items-center space-x-2.5 cursor-pointer hover:border-orange-500/50 transition-colors"
                              >
                                <img
                                  src={msg.attached_product.image_url}
                                  alt={msg.attached_product.title}
                                  className="w-10 h-10 rounded-lg object-cover bg-neutral-900"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-medium text-white truncate">
                                    {msg.attached_product.title}
                                  </p>
                                  <span className="text-xs font-bold text-orange-400">
                                    {Number(msg.attached_product.price).toLocaleString('vi-VN')}₫
                                  </span>
                                </div>
                              </div>
                            )}

                            <div
                              className={`p-2.5 rounded-2xl text-xs leading-relaxed break-words ${
                                isMe
                                  ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-tr-none'
                                  : 'bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-tl-none'
                              }`}
                            >
                              {msg.content}
                            </div>

                            <span className={`text-[10px] text-neutral-500 block ${isMe ? 'text-right' : ''}`}>
                              {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Attached Product Bar */}
                {attachedProduct && (
                  <div className="p-2 bg-neutral-800/90 border-t border-neutral-700 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <Tag className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <span className="text-neutral-300 truncate">
                        Hỏi về: <strong>{attachedProduct.title}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setAttachedProduct(null)}
                      className="text-neutral-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Direct Message Input Bar */}
                <form onSubmit={handleSendDirectMessage} className="p-3 border-t border-neutral-800 bg-neutral-900/95 flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    placeholder={`Nhắn tin cho @${otherParticipant}...`}
                    value={newDirectText}
                    onChange={(e) => setNewDirectText(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newDirectText.trim()}
                    className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-black font-bold transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
