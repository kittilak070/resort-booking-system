import React, { useState, useEffect } from 'react';
import { useResort } from '../../context/ResortContext';
import { X, ShieldCheck, AlertCircle, Lock } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requiredRoleName?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  requiredRoleName
}) => {
  const { loginWithGoogle, language } = useResort();
  const isEn = language === 'en';

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Default Google Client ID
  const activeClientId = '742834959109-fo0kevt5tjf3a1e3ig6fv7v57fd4hv67.apps.googleusercontent.com';

  // Initialize official Google Identity Services in background
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
      } catch (err: any) {
        console.warn('Google Identity initialization error:', err);
      }
    }
  }, [isOpen, activeClientId, loginWithGoogle, onClose, onSuccess]);

  if (!isOpen) return null;

  // Real Google OAuth Popup Login
  const handleGooglePopupLogin = () => {
    if (!window.google?.accounts?.oauth2) {
      setErrorMsg(isEn ? 'Google Identity SDK is loading, please try again in a few seconds' : 'กำลังโหลดระบบ Google กรุณาลองใหม่อีกครั้ง');
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
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMsg(`Google OAuth error: ${tokenResponse.error_description || tokenResponse.error}`);
            }
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
              setErrorMsg(fetchErr.message || 'Failed to fetch user data from Google');
            }
          } else {
            setIsLoading(false);
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (popupErr: any) {
      setIsLoading(false);
      setErrorMsg(popupErr.message || 'Google Popup failed to open');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-2.5 shrink-0">
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
                <span>{isEn ? 'Sign in with Google' : 'เข้าสู่ระบบด้วย Google'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {requiredRoleName ? (
                  <span className="text-teal-700 font-medium flex items-center gap-1 mt-0.5">
                    <Lock className="w-3 h-3" />
                    {isEn ? `Required for: ${requiredRoleName}` : `สำหรับเข้าสู่: ${requiredRoleName}`}
                  </span>
                ) : (
                  <span>The Haven Serene Resort & Villas</span>
                )}
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
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              {isEn ? 'Single Sign-On with your Google Account' : 'เข้าสู่ระบบด้วยบัญชี Google ของคุณ'}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {isEn 
                ? 'Sign in securely using Google OAuth 2.0. Resort managers and staff will be granted authorized access automatically.' 
                : 'ยืนยันตัวตนด้วย Google OAuth ปลอดภัยมาตรฐานสากล โดยระบบจะกำหนดสิทธิ์พนักงานหรือผู้จัดการให้โดยอัตโนมัติตามอีเมลที่ลงทะเบียน'}
            </p>
          </div>

          {/* Main Action: Native Google Sign-In Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGooglePopupLogin}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-sm rounded-2xl border-2 border-slate-200 shadow-sm hover:border-slate-300 flex items-center justify-center gap-3 transition-all hover:shadow-md cursor-pointer disabled:opacity-60"
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
              <span>{isLoading ? (isEn ? 'Connecting Google...' : 'กำลังเปิด Google...') : (isEn ? 'Sign in with Google' : 'เข้าสู่ระบบด้วย Google')}</span>
            </button>
          </div>

          {/* D1 Security Info */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-start gap-3 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold text-slate-800">
                {isEn ? 'Edge & Cloudflare D1 Protection' : 'ความปลอดภัยและการบันทึกข้อมูล'}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {isEn 
                  ? 'Your profile is authenticated via Google and securely saved to Cloudflare D1 (resort-db).' 
                  : 'ข้อมูลผู้ใช้งานจะถูกตรวจสอบผ่านเซิร์ฟเวอร์ Google และบันทึกลงฐานข้อมูล Cloudflare D1 (resort-db)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
