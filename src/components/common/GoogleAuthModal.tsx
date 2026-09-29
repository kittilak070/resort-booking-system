import React, { useState, useEffect, useRef } from 'react';
import { useResort } from '../../context/ResortContext';
import { 
  X, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, 
  ExternalLink, KeyRound, ChevronDown, ChevronUp, Copy, Check 
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle, language } = useResort();
  const isEn = language === 'en';

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Active Client ID state (persisted in localStorage or from env or default)
  const defaultClientId = '742834959109-fo0kevt5tjf3a1e3ig6fv7v57fd4hv67.apps.googleusercontent.com';
  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || defaultClientId;
  const [activeClientId, setActiveClientId] = useState<string>(() => {
    return localStorage.getItem('resort_google_client_id') || envClientId;
  });
  const [inputClientId, setInputClientId] = useState<string>(activeClientId);
  const [showClientIdInput, setShowClientIdInput] = useState<boolean>(!activeClientId);

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const originUrl = window.location.origin;

  // Initialize real Google Identity Services if client ID is set
  useEffect(() => {
    if (!isOpen || !activeClientId) return;

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: activeClientId,
          callback: async (response: any) => {
            if (response.credential) {
              setIsLoading(true);
              setErrorMsg(null);
              const result = await loginWithGoogle(response.credential);
              setIsLoading(false);
              if (result.success) {
                if (onSuccess) onSuccess();
                onClose();
              } else {
                setErrorMsg(result.error || 'Failed to authenticate with Google');
              }
            }
          }
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill'
          });
        }
      } catch (err: any) {
        console.warn('Google Identity initialization error:', err);
      }
    }
  }, [isOpen, activeClientId, loginWithGoogle, onClose, onSuccess]);

  if (!isOpen) return null;

  // Real Google OAuth Popup Login
  const handleGooglePopupLogin = () => {
    if (!activeClientId) {
      setErrorMsg(isEn ? 'Please set your Google Client ID first' : 'กรุณาระบุ Google Client ID ก่อนเข้าสู่ระบบ');
      setShowClientIdInput(true);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setErrorMsg(isEn ? 'Google Identity SDK is loading, please try again in a few seconds' : 'กำลังโหลด SDK ของ Google กรุณาลองใหม่อีกครั้งใน 2-3 วินาที');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            setIsLoading(false);
            setErrorMsg(`Google OAuth error: ${tokenResponse.error_description || tokenResponse.error}`);
            return;
          }

          if (tokenResponse?.access_token) {
            try {
              // Fetch user profile from official Google UserInfo endpoint
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });

              if (!userInfoRes.ok) {
                throw new Error('Failed to retrieve user profile from Google');
              }

              const profile = await userInfoRes.json();
              const res = await loginWithGoogle(undefined, {
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                googleId: profile.sub
              });

              setIsLoading(false);
              if (res.success) {
                if (onSuccess) onSuccess();
                onClose();
              } else {
                setErrorMsg(res.error || 'Login failed in D1 database');
              }
            } catch (fetchErr: any) {
              setIsLoading(false);
              setErrorMsg(fetchErr.message || 'Failed to fetch user data');
            }
          } else {
            setIsLoading(false);
          }
        }
      });

      tokenClient.requestAccessToken();
    } catch (popupErr: any) {
      setIsLoading(false);
      setErrorMsg(popupErr.message || 'Google Popup failed to open');
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    if (!cleanId) {
      setErrorMsg('กรุณากรอก Client ID');
      return;
    }
    setActiveClientId(cleanId);
    localStorage.setItem('resort_google_client_id', cleanId);
    setShowClientIdInput(false);
    setErrorMsg(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // 1-Click Fast Accounts for immediate testing & demonstration
  const demoAccounts = [
    {
      roleName: isEn ? 'General Manager & Owner' : 'เจ้าของ / ผู้จัดการทั่วไป',
      roleBadge: 'MANAGER (Admin)',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      email: '674295027@parichat.skru.ac.th',
      name: 'Kittilak (Resort GM)',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      description: isEn ? 'Full management, dynamic pricing, reports & D1 users' : 'สิทธิ์สูงสุด บริหารราคา รายงาน และฐานข้อมูล D1'
    },
    {
      roleName: isEn ? 'Front Desk Reception' : 'พนักงานต้อนรับฟร้อนท์',
      roleBadge: 'FRONT_DESK',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      email: 'frontdesk.somchai@resort-haven.com',
      name: 'Somchai Prasert',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      description: isEn ? 'Check-in, Check-out, Walk-in & Minibar billing' : 'เช็คอิน, เช็คเอาท์, วอล์กอิน และบิลมินิบาร์'
    },
    {
      roleName: isEn ? 'Housekeeping Supervisor' : 'หัวหน้าแม่บ้าน',
      roleBadge: 'HOUSEKEEPER',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      email: 'clean.malee@resort-haven.com',
      name: 'Malee Sukjai',
      picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      description: isEn ? 'Mobile room inspection, cleaning status & repairs' : 'ตรวจห้องพัก อัปเดตสถานะทำความสะอาด แจ้งซ่อม'
    },
    {
      roleName: isEn ? 'Resort Guest Member' : 'ลูกค้าผู้เข้าพัก (สมาชิก)',
      roleBadge: 'GUEST',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      email: 'thanaporn.guest@gmail.com',
      name: 'Thanaporn Wongsuwan',
      picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      description: isEn ? 'Booking villas, VIP promo discounts & reviews' : 'จองห้องพัก รับส่วนลดพิเศษ และดูประวัติการจอง'
    }
  ];

  const handleSelectDemoAccount = async (account: typeof demoAccounts[0]) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginWithGoogle(undefined, {
        email: account.email,
        name: account.name,
        picture: account.picture,
        googleId: `goog_${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`
      });

      setIsLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || 'Login failed');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Login error');
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setErrorMsg(isEn ? 'Please enter a valid Google email address' : 'กรุณากรอกอีเมล Google ให้ถูกต้อง');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const displayName = customName.trim() || customEmail.split('@')[0];
      const res = await loginWithGoogle(undefined, {
        email: customEmail.trim(),
        name: displayName,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d9488&color=fff`,
        googleId: `goog_${Date.now()}`
      });

      setIsLoading(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || 'Login failed');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Login error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2.5 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{isEn ? 'Google Account Login' : 'เข้าสู่ระบบด้วย Google'}</span>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  D1 Cloudflare
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isEn 
                  ? 'Sign in via Google OAuth popup & sync to D1 database' 
                  : 'ยืนยันตัวตนผ่าน Google OAuth และบันทึกลง Cloudflare D1'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: REAL GOOGLE POPUP LOGIN */}
          <div className="p-4 bg-gradient-to-br from-teal-50/50 via-white to-blue-50/40 rounded-2xl border border-teal-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {isEn ? 'Official Google OAuth Login' : 'ล็อกอินด้วย Google Account จริง'}
              </span>
              <button
                onClick={() => setShowClientIdInput(!showClientIdInput)}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>{activeClientId ? 'ตั้งค่า Client ID' : 'ระบุ Client ID'}</span>
              </button>
            </div>

            {/* Big Google Popup Button */}
            <button
              onClick={handleGooglePopupLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-all hover:shadow-md group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'กำลังติดต่อ Google...' : 'เปิดหน้าต่างเลือกบัญชี Google (Popup)'}</span>
            </button>

            {/* Google Identity Services Rendered Button Container */}
            {activeClientId && (
              <div className="flex justify-center pt-1">
                <div ref={googleBtnRef}></div>
              </div>
            )}

            {/* Client ID Setting Form (if expanded or not set) */}
            {showClientIdInput && (
              <form onSubmit={handleSaveClientId} className="pt-2 border-t border-teal-100 space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Google OAuth 2.0 Client ID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="xxxxxx.apps.googleusercontent.com"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    บันทึก
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {activeClientId ? '✓ Client ID กำลังใช้งานอยู่' : 'ใส่ Client ID จาก Google Cloud Console เพื่อเปิดใช้งานหน้าต่าง Google'}
                </p>
              </form>
            )}

            {/* How to get Client ID accordion */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center justify-between w-full font-medium"
              >
                <span>วิธีขอ Google Client ID ฟรี (ใช้เวลา 2 นาที)</span>
                {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showGuide && (
                <div className="mt-2.5 p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2">
                  <p>1. เข้าไปที่ <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-teal-600 underline font-semibold inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></p>
                  <p>2. คลิก <strong>+ CREATE CREDENTIALS</strong> &gt; <strong>OAuth client ID</strong> (เลือกชนิด Web application)</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">3. ช่อง Authorized JavaScript origins ใส่:</p>
                    <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-200 font-mono text-[10px]">
                      <span className="truncate">{originUrl}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(originUrl, 'origin')}
                        className="text-teal-600 hover:text-teal-800 p-1"
                        title="คัดลอก"
                      >
                        {copiedText === 'origin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">4. ช่อง Authorized redirect URIs ใส่:</p>
                    <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-200 font-mono text-[10px]">
                      <span className="truncate">{originUrl}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(originUrl, 'redirect')}
                        className="text-teal-600 hover:text-teal-800 p-1"
                        title="คัดลอก"
                      >
                        {copiedText === 'redirect' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p>5. คัดลอก <strong>Client ID</strong> มาวางในช่องด้านบน หรือแจ้งในแชทนี้ได้เลยครับ</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: 1-CLICK FAST ACCOUNTS FOR IMMEDIATE TESTING */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {isEn ? 'Or Test with 1-Click Fast Profiles' : 'หรือทดสอบด่วนด้วยโปรไฟล์ตัวอย่าง'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isEn ? 'Instant D1 Sync' : 'ซิงค์ D1 ทันที'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {demoAccounts.map((acc, index) => (
                <button
                  key={acc.email}
                  disabled={isLoading}
                  onClick={() => handleSelectDemoAccount(acc)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 group ${
                    index === 0
                      ? 'bg-gradient-to-r from-purple-50/60 to-white border-purple-200/80 hover:border-purple-300 hover:shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/20 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={acc.picture} 
                      alt={acc.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {acc.name}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${acc.badgeColor} shrink-0`}>
                          {acc.roleBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-mono">
                        {acc.email}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {acc.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 p-1.5 text-slate-400 group-hover:text-teal-600 transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Custom Google Email */}
          <div className="pt-2 border-t border-slate-100">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-teal-700 hover:bg-slate-50 rounded-xl transition-colors text-center"
              >
                {isEn ? '+ Sign in with a custom Google email' : '+ ทดสอบเข้าสู่ระบบด้วยอีเมล Google อื่นๆ'}
              </button>
            ) : (
              <form onSubmit={handleCustomLogin} className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {isEn ? 'Custom Google Account' : 'ระบุอีเมล Google สำหรับทดสอบ'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    {isEn ? 'Cancel' : 'ยกเลิก'}
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder={isEn ? 'e.g. user@gmail.com' : 'เช่น user@gmail.com หรือ @parichat.skru.ac.th'}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={isEn ? 'Your Full Name (Optional)' : 'ชื่อ-นามสกุล (ไม่บังคับ)'}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <span>{isEn ? 'Authenticating...' : 'กำลังตรวจสอบ...'}</span>
                  ) : (
                    <span>{isEn ? 'Sign In & Save to D1' : 'เข้าสู่ระบบและบันทึกข้อมูล D1'}</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* D1 & Security Notice */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-start gap-2.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-700">
                {isEn ? 'Cloudflare D1 Edge Authentication' : 'ความปลอดภัยและการบันทึกข้อมูล'}
              </p>
              <p className="mt-0.5 leading-relaxed">
                {isEn 
                  ? 'User accounts are securely saved to the Cloudflare D1 database (resort-db). Emails matching @parichat.skru.ac.th automatically receive MANAGER privileges.' 
                  : 'ข้อมูลผู้ใช้จะถูกบันทึกลงฐานข้อมูล Cloudflare D1 (ตาราง users) โดยอีเมล @parichat.skru.ac.th จะได้รับสิทธิ์ผู้จัดการ (MANAGER) โดยอัตโนมัติ'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
