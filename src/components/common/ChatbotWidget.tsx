import React, { useState, useRef, useEffect } from 'react';
import { useResort } from '../../context/ResortContext';
import { 
  Bot, Send, Sparkles, X, 
  RotateCcw, ExternalLink, PhoneCall, Tag, 
  Calendar, ChevronDown, Minimize2 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestions?: string[];
  action?: {
    type: 'VIEW_ROOMS' | 'APPLY_PROMO' | 'LOOKUP_BOOKING' | 'CALL_HOTLINE';
    label: string;
    data?: string;
  } | null;
}

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenMyBookings: () => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  isOpen,
  onToggle,
  onOpenMyBookings
}) => {
  const { language, currentUser } = useResort();
  const isEn = language === 'en';

  const defaultWelcomeMessage: ChatMessage = {
    id: 'welcome',
    sender: 'bot',
    text: isEn
      ? `👋 **Hello! Welcome to The Haven Serene Resort & Villas!**\n\nI am your AI Concierge on Cloudflare Edge. How may I assist your vacation today?\n\n• 🏡 **Room Rates & Amenities**\n• 🎁 **Promo Codes & Discounts**\n• ⏰ **Check-In / Out Policies**\n• 🍳 **Breakfast & Floating Breakfast**`
      : `👋 **สวัสดีครับ ยินดีต้อนรับสู่ The Haven Serene Resort & Villas!**\n\nผมคือผู้ช่วยอัจฉริยะ (AI Concierge) ยินดีตอบทุกข้อสงสัยและช่วยอำนวยความสะดวกเรื่องการจองห้องพักครับ:\n\n• 🏡 **ราคาห้องพักและประเภทเตียง**\n• 🎁 **โค้ดส่วนลดและโปรโมชั่น**\n• ⏰ **เวลาเช็คอิน 14:00 น. / เช็คเอาท์ 12:00 น.**\n• 🍳 **บุฟเฟต์อาหารเช้า & Floating Breakfast**`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: isEn
      ? ['Room rates & types', 'Current promotions', 'Check-in & Check-out time', 'Breakfast & Dining']
      : ['ราคาห้องพักมีแบบไหนบ้าง', 'มีโปรโมชั่นส่วนลดอะไรบ้าง', 'เวลาเช็คอิน เช็คเอาท์กี่โมง', 'อาหารเช้ามีบริการอะไรบ้าง']
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, messages]);

  // Update welcome message if language switches and no messages exchanged yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([defaultWelcomeMessage]);
    }
  }, [language]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const history = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          language: isEn ? 'en' : 'th',
          userName: currentUser?.name || undefined
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: data.reply || (isEn ? 'I could not process that request. Please try again.' : 'ไม่สามารถประมวลผลได้ กรุณาลองใหม่อีกครั้งครับ'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || [],
        action: data.action || null
      };

      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chatbot API request failed:', err);
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'bot',
        text: isEn
          ? '⚠️ Sorry, could not connect to the Concierge server. Please check your connection or contact our front desk at 039-555-888.'
          : '⚠️ ขออภัยครับ ไม่สามารถเชื่อมต่อกับระบบ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อแผนกต้อนรับได้ที่ 039-555-888 ครับ',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: isEn
          ? ['Room rates & types', 'Contact Front Desk']
          : ['ราคาห้องพักมีแบบไหนบ้าง', 'ขอเบอร์ติดต่อรีสอร์ท']
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([defaultWelcomeMessage]);
    setInputText('');
  };

  const handleActionClick = (action: ChatMessage['action']) => {
    if (!action) return;
    if (action.type === 'VIEW_ROOMS') {
      const roomSection = document.getElementById('room-cards-section');
      if (roomSection) {
        roomSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    } else if (action.type === 'LOOKUP_BOOKING') {
      onOpenMyBookings();
    } else if (action.type === 'CALL_HOTLINE') {
      window.location.href = action.data || 'tel:039555888';
    } else if (action.type === 'APPLY_PROMO') {
      const roomSection = document.getElementById('room-cards-section');
      if (roomSection) {
        roomSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Helper to format simple markdown (**bold**, bullet points, newlines)
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1 text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          // Process bold markers (**text**)
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="break-words">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-semibold text-slate-900">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {!isOpen && (
          <button
            onClick={onToggle}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-teal-700 via-teal-600 to-teal-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/40 cursor-pointer"
            aria-label={isEn ? 'Open AI Concierge Chat' : 'เปิดแชทผู้ช่วย AI'}
          >
            {/* Animated Pulsing Ring */}
            <span className="absolute -inset-1 rounded-full bg-teal-400 opacity-30 group-hover:opacity-60 animate-ping pointer-events-none" />
            
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>

            <span className="text-xs font-bold tracking-wide whitespace-nowrap">
              {isEn ? 'AI Concierge' : 'แชทกับผู้ช่วย AI'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
          </button>
        )}

        {/* Chatbot Window Container */}
        {isOpen && (
          <div
            className={`w-[92vw] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
              isMinimized ? 'h-14 shadow-lg' : 'h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-600 px-4 py-3 text-white flex items-center justify-between shadow-xs select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 text-teal-100" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm tracking-tight truncate flex items-center gap-1.5">
                    <span>The Haven AI Concierge</span>
                    <span className="text-[10px] bg-teal-500/40 px-1.5 py-0.2 rounded-full font-medium border border-teal-300/30">
                      Edge
                    </span>
                  </h3>
                  <p className="text-[10px] text-teal-100/90 flex items-center gap-1 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isEn ? 'Online • 24/7 Resort Assistant' : 'ออนไลน์ • พร้อมตอบคำถาม 24 ชม.'}</span>
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleResetChat}
                  className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title={isEn ? 'Clear Chat History' : 'ล้างประวัติการคุย'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title={isMinimized ? (isEn ? 'Expand' : 'ขยาย') : (isEn ? 'Minimize' : 'ย่อหน้าต่าง')}
                >
                  {isMinimized ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onToggle}
                  className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title={isEn ? 'Close' : 'ปิด'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body (Hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Messages Feed */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/70 text-slate-800">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[88%]">
                        {msg.sender === 'bot' && (
                          <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-2xl shadow-xs text-xs sm:text-sm ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                          }`}
                        >
                          {msg.sender === 'user' ? (
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          ) : (
                            renderFormattedText(msg.text)
                          )}

                          {/* Bot Message Action Button */}
                          {msg.action && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => handleActionClick(msg.action)}
                                className="w-full px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {msg.action.type === 'CALL_HOTLINE' && <PhoneCall className="w-3 h-3 text-teal-600" />}
                                {msg.action.type === 'APPLY_PROMO' && <Tag className="w-3 h-3 text-teal-600" />}
                                {msg.action.type === 'VIEW_ROOMS' && <ExternalLink className="w-3 h-3 text-teal-600" />}
                                {msg.action.type === 'LOOKUP_BOOKING' && <Calendar className="w-3 h-3 text-teal-600" />}
                                <span>{msg.action.label}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>

                      {/* Quick Suggestions (if attached to the latest bot message) */}
                      {msg.suggestions && msg.suggestions.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                          {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(suggestion)}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-full text-[11px] font-medium transition-all shadow-2xs hover:scale-102 active:scale-98 disabled:opacity-50 text-left"
                            >
                              💡 {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                      <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 animate-spin" />
                      </div>
                      <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {isEn ? 'Concierge is typing' : 'ผู้ช่วยกำลังพิมพ์'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" />
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isEn
                        ? 'Type your question (e.g. room rates, promos)...'
                        : 'พิมพ์คำถาม เช่น ราคาห้องพัก, โปรโมชั่น, เวลาเช็คอิน...'
                    }
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    title={isEn ? 'Send Message' : 'ส่งข้อความ'}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ChatbotWidget;
