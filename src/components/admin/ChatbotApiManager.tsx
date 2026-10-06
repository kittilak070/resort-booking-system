import React, { useState, useEffect } from 'react';
import { useResort } from '../../context/ResortContext';
import { ChatbotFaq, ChatbotSettings } from '../../types';
import { 
  Bot, Key, Cpu, Send, Check, 
  RefreshCw, Copy, Code, HelpCircle, Plus, Trash2, Edit2, 
  ExternalLink, Eye, EyeOff, Zap, Sliders
} from 'lucide-react';

export const ChatbotApiManager: React.FC = () => {
  const { currentUser } = useResort();

  const [activeSubTab, setActiveSubTab] = useState<'CONFIG' | 'PLAYGROUND' | 'FAQS'>('CONFIG');

  // Settings State
  const [settings, setSettings] = useState<ChatbotSettings>({
    provider: 'cloudflare',
    model: '@cf/meta/llama-3.2-3b-instruct',
    temperature: 0.4,
    max_tokens: 500,
    enable_d1_grounding: true,
    system_prompt: '',
    gemini_api_key: '',
    openai_api_key: '',
    has_gemini_key: false,
    has_openai_key: false
  });
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Playground State
  const [testPrompt, setTestPrompt] = useState('สระว่ายน้ำเปิดปิดกี่โมง และมีบริการอะไรบ้าง');
  const [testingApi, setTestingApi] = useState(false);
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // FAQs CRUD State
  const [faqs, setFaqs] = useState<ChatbotFaq[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ChatbotFaq | null>(null);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqForm, setFaqForm] = useState({
    id: '',
    question_th: '',
    answer_th: '',
    question_en: '',
    answer_en: '',
    category: 'AMENITIES',
    is_active: true
  });
  const [savingFaq, setSavingFaq] = useState(false);
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);

  // Load Settings from D1
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/chat/settings', {
        headers: { 'X-Admin-Email': currentUser?.email || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          ...data,
          gemini_api_key: data.has_gemini_key ? '••••••••••••••••••••••••••••••••••••••••' : '',
          openai_api_key: data.has_openai_key ? '••••••••••••••••••••••••••••••••••••••••' : ''
        }));
      }
    } catch (err) {
      console.error('Failed to load chat settings:', err);
    }
  };

  // Load FAQs from D1
  const fetchFaqs = async () => {
    setLoadingFaqs(true);
    try {
      const res = await fetch('/api/chat/faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoadingFaqs(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchFaqs();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(null);

    const payload: any = {
      provider: settings.provider,
      model: settings.model,
      temperature: Number(settings.temperature),
      max_tokens: Number(settings.max_tokens),
      enable_d1_grounding: settings.enable_d1_grounding,
      system_prompt: settings.system_prompt
    };

    // Only send key if changed and not masked
    if (settings.gemini_api_key && !settings.gemini_api_key.includes('••••')) {
      payload.gemini_api_key = settings.gemini_api_key.trim();
    }
    if (settings.openai_api_key && !settings.openai_api_key.includes('••••')) {
      payload.openai_api_key = settings.openai_api_key.trim();
    }

    try {
      const res = await fetch('/api/chat/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': currentUser?.email || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSettingsSuccess('บันทึกการตั้งค่า Chatbot API ลง Cloudflare D1 สำเร็จเรียบร้อยแล้ว!');
        fetchSettings();
        setTimeout(() => setSettingsSuccess(null), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'บันทึกการตั้งค่าล้มเหลว');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSavingSettings(false);
    }
  };

  // Run Test in Playground
  const handleRunPlaygroundTest = async () => {
    if (!testPrompt.trim()) return;
    setTestingApi(true);
    setTestResponse(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testPrompt.trim(),
          language: 'th'
        })
      });

      const data = await res.json();
      setTestResponse({
        status: res.status,
        ok: res.ok,
        data
      });
    } catch (err: any) {
      setTestResponse({
        status: 500,
        ok: false,
        data: { error: err.message || 'Connection failed' }
      });
    } finally {
      setTestingApi(false);
    }
  };

  // FAQ Modal Handlers
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqForm({
      id: '',
      question_th: '',
      answer_th: '',
      question_en: '',
      answer_en: '',
      category: 'AMENITIES',
      is_active: true
    });
    setShowFaqModal(true);
  };

  const handleOpenEditFaq = (faq: ChatbotFaq) => {
    setEditingFaq(faq);
    setFaqForm({
      id: faq.id,
      question_th: faq.question_th,
      answer_th: faq.answer_th,
      question_en: faq.question_en || '',
      answer_en: faq.answer_en || '',
      category: faq.category || 'AMENITIES',
      is_active: Boolean(faq.is_active)
    });
    setShowFaqModal(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question_th.trim() || !faqForm.answer_th.trim()) {
      alert('กรุณากรอกคำถามและคำตอบภาษาไทย');
      return;
    }

    setSavingFaq(true);
    try {
      const isEdit = Boolean(editingFaq);
      const res = await fetch('/api/chat/faqs', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': currentUser?.email || ''
        },
        body: JSON.stringify({
          id: isEdit ? editingFaq?.id : undefined,
          question_th: faqForm.question_th.trim(),
          answer_th: faqForm.answer_th.trim(),
          question_en: faqForm.question_en.trim(),
          answer_en: faqForm.answer_en.trim(),
          category: faqForm.category,
          is_active: faqForm.is_active ? 1 : 0
        })
      });

      if (res.ok) {
        setShowFaqModal(false);
        fetchFaqs();
      } else {
        const err = await res.json();
        alert(err.error || 'บันทึก FAQ ล้มเหลว');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('ยืนยันที่จะลบคำถาม-คำตอบนี้ออกจากฐานความรู้ Chatbot หรือไม่?')) return;
    setDeletingFaqId(id);
    try {
      const res = await fetch(`/api/chat/faqs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Email': currentUser?.email || '' }
      });
      if (res.ok) {
        fetchFaqs();
      } else {
        const err = await res.json();
        alert(err.error || 'ไม่สามารถลบ FAQ ได้');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeletingFaqId(null);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-teal-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Bot className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Resort AI Concierge & Chatbot API Hub
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              API v2.0
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            ศูนย์กลางบริหารจัดการ AI Chatbot: กำหนดผู้ให้บริการ (Cloudflare Workers AI, Google Gemini, OpenAI), จัดการคลังความรู้ (FAQs), และทดสอบ API Playground แบบเรียลไทม์
          </p>
        </div>

        {/* Current Active Engine Badge */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0 backdrop-blur-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs">
            <div className="text-[10px] text-slate-400 font-medium">ผู้ให้บริการที่เปิดใช้งาน:</div>
            <div className="font-bold text-teal-300 capitalize flex items-center gap-1.5">
              <span>{settings.provider === 'cloudflare' ? '⚡ Cloudflare Workers AI' : settings.provider === 'gemini' ? '💎 Google Gemini API' : '🤖 OpenAI API'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('CONFIG')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'CONFIG'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>การตั้งค่าโมเดล & API Key</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PLAYGROUND')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'PLAYGROUND'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>API Playground & คู่มือนักพัฒนา</span>
        </button>

        <button
          onClick={() => setActiveSubTab('FAQS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'FAQS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>คลังความรู้โรงแรม & FAQs ({faqs.length})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: CONFIGURATION & API KEYS */}
      {/* ==================================================================== */}
      {activeSubTab === 'CONFIG' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {settingsSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          {/* Provider Selection Cards */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-600" />
                เลือกผู้ให้บริการ AI Model (AI Engine Provider)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกเครื่องยนต์ AI ที่ต้องการให้แชทบอทใช้ประมวลผลคำตอบให้กับลูกค้า
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Cloudflare Workers AI */}
              <div 
                onClick={() => setSettings(s => ({ ...s, provider: 'cloudflare', model: '@cf/meta/llama-3.2-3b-instruct' }))}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                  settings.provider === 'cloudflare'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {settings.provider === 'cloudflare' && (
                  <span className="absolute top-3 right-3 text-teal-600">
                    <Check className="w-5 h-5" />
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div className="font-bold text-sm text-slate-900">Cloudflare Workers AI</div>
                <div className="text-xs text-slate-500">
                  รันบน Edge โดยตรง ฟรี ไม่ต้องตั้งค่า API Key รองรับโมเดล Llama 3 8B ตอบสนองรวดเร็ว
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">
                  Default (Built-in)
                </span>
              </div>

              {/* Google Gemini API */}
              <div 
                onClick={() => setSettings(s => ({ ...s, provider: 'gemini', model: 'gemini-1.5-flash' }))}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                  settings.provider === 'gemini'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {settings.provider === 'gemini' && (
                  <span className="absolute top-3 right-3 text-teal-600">
                    <Check className="w-5 h-5" />
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  💎
                </div>
                <div className="font-bold text-sm text-slate-900">Google Gemini API</div>
                <div className="text-xs text-slate-500">
                  เข้าใจภาษาไทยได้อย่างเป็นธรรมชาติและแม่นยำสูง (Gemini 1.5 Flash / Pro) ต้องการ Google AI Studio Key
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                  settings.has_gemini_key ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {settings.has_gemini_key ? '✓ Key Configured' : '⚠ ต้องระบุ Key'}
                </span>
              </div>

              {/* OpenAI API */}
              <div 
                onClick={() => setSettings(s => ({ ...s, provider: 'openai', model: 'gpt-4o-mini' }))}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                  settings.provider === 'openai'
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {settings.provider === 'openai' && (
                  <span className="absolute top-3 right-3 text-teal-600">
                    <Check className="w-5 h-5" />
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  🤖
                </div>
                <div className="font-bold text-sm text-slate-900">OpenAI API</div>
                <div className="text-xs text-slate-500">
                  โมเดลระดับพรีเมียม GPT-4o และ GPT-4o-mini มีความสามารถสูง ต้องการ OpenAI API Key
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                  settings.has_openai_key ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {settings.has_openai_key ? '✓ Key Configured' : '⚠ ต้องระบุ Key'}
                </span>
              </div>

            </div>
          </div>

          {/* Model & API Keys Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-600" />
              การกำหนดค่าโมเดลและกุญแจความปลอดภัย (API Credentials)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Model Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ชื่อโมเดล (Model Identifier)</label>
                <input
                  type="text"
                  value={settings.model}
                  onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
                  placeholder={
                    settings.provider === 'gemini' ? 'gemini-1.5-flash' :
                    settings.provider === 'openai' ? 'gpt-4o-mini' :
                    '@cf/meta/llama-3.2-3b-instruct'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-teal-600"
                />
                <p className="text-[11px] text-slate-400">
                  เช่น `@cf/meta/llama-3.2-3b-instruct`, `gemini-1.5-flash`, `gpt-4o-mini`
                </p>
              </div>

              {/* Gemini API Key */}
              <div className={`space-y-1.5 ${settings.provider !== 'gemini' ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Google Gemini API Key</span>
                    {settings.has_gemini_key && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                        บันทึกแล้ว
                      </span>
                    )}
                  </label>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] text-teal-600 hover:underline flex items-center gap-1"
                  >
                    <span>รับ API Key ฟรี</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={settings.gemini_api_key}
                    onChange={e => setSettings(s => ({ ...s, gemini_api_key: e.target.value }))}
                    placeholder="AIzaSy..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-teal-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div className={`space-y-1.5 ${settings.provider !== 'openai' ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>OpenAI API Key</span>
                    {settings.has_openai_key && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                        บันทึกแล้ว
                      </span>
                    )}
                  </label>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] text-teal-600 hover:underline flex items-center gap-1"
                  >
                    <span>รับ API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showOpenAiKey ? 'text' : 'password'}
                    value={settings.openai_api_key}
                    onChange={e => setSettings(s => ({ ...s, openai_api_key: e.target.value }))}
                    placeholder="sk-proj-..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-teal-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showOpenAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dynamic D1 Grounding Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">D1 Live Knowledge Grounding</label>
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="groundingToggle"
                    checked={settings.enable_d1_grounding}
                    onChange={e => setSettings(s => ({ ...s, enable_d1_grounding: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                  />
                  <label htmlFor="groundingToggle" className="text-xs text-slate-700 font-semibold cursor-pointer">
                    ดึงราคาห้องพักจริง, โปรโมชั่นล่าสุด และ FAQs จาก D1 แบบเรียลไทม์
                  </label>
                </div>
              </div>

            </div>

            {/* Custom System Prompt */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">
                  คำสั่งตั้งต้นของ AI (Custom System Prompt)
                </label>
                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, system_prompt: '' }))}
                  className="text-[11px] text-teal-600 hover:underline"
                >
                  ใช้ค่ามาตรฐานของรีสอร์ท (Default Preset)
                </button>
              </div>
              <textarea
                rows={4}
                value={settings.system_prompt}
                onChange={e => setSettings(s => ({ ...s, system_prompt: e.target.value }))}
                placeholder="เว้นว่างไว้เพื่อใช้ค่ามาตรฐาน: You are Haven AI Concierge of The Haven Serene Resort & Villas..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-sans focus:outline-teal-600 leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{savingSettings ? 'กำลังบันทึกลง D1...' : 'บันทึกการตั้งค่า Chatbot API'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: PLAYGROUND & DEVELOPER GUIDE */}
      {/* ==================================================================== */}
      {activeSubTab === 'PLAYGROUND' && (
        <div className="space-y-6">
          
          {/* Playground Interactive Tester */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                ทดสอบยิง API (Interactive Chatbot API Tester)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                ส่งคำถามทดสอบไปยัง Endpoint `/api/chat` บน Cloudflare Worker เพื่อดูผลลัพธ์และวัดความเร็วการตอบสนอง
              </p>
            </div>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-semibold self-center mr-1">ตัวอย่าง:</span>
              {[
                'ราคาห้องพักมีแบบไหนบ้าง',
                'สระว่ายน้ำเปิดปิดกี่โมง',
                'มีโปรโมชั่นส่วนลดอะไรบ้าง',
                'มีบริการรถรับส่งสนามบินไหม',
                'เวลาเช็คอิน เช็คเอาท์กี่โมง'
              ].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTestPrompt(sample)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Prompt Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRunPlaygroundTest()}
                placeholder="พิมพ์คำถามทดสอบที่นี่..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-teal-600"
              />
              <button
                type="button"
                onClick={handleRunPlaygroundTest}
                disabled={testingApi || !testPrompt.trim()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                {testingApi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{testingApi ? 'กำลังส่ง...' : 'ทดสอบ API'}</span>
              </button>
            </div>

            {/* Test Response Display */}
            {testResponse && (
              <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      testResponse.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      HTTP {testResponse.status} {testResponse.ok ? 'OK' : 'Error'}
                    </span>
                    <span className="text-slate-500">
                      ผู้ให้บริการ: <strong>{testResponse.data?.provider || 'Unknown'}</strong> ({testResponse.data?.model || 'Model'})
                    </span>
                  </div>
                  <span className="font-mono text-slate-600 font-bold">
                    ⏱️ {testResponse.data?.latencyMs || 0} ms
                  </span>
                </div>

                {/* Formatted Text Preview */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {testResponse.data?.reply || JSON.stringify(testResponse.data, null, 2)}
                </div>

                {/* Raw JSON Accordion */}
                <details className="text-[11px] text-slate-600">
                  <summary className="cursor-pointer font-bold hover:text-teal-600">ดู Raw JSON Response</summary>
                  <pre className="mt-2 p-3 bg-slate-900 text-teal-300 rounded-xl overflow-x-auto font-mono text-[11px]">
                    {JSON.stringify(testResponse.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Developer Integration Code Snippets */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-teal-600" />
              ตัวอย่างโค้ดสำหรับเชื่อมต่อ (API Integration Examples)
            </h4>

            {/* cURL Example */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">cURL Request</span>
                <button
                  onClick={() => copyToClipboard(`curl -X POST https://resort-booking-system.674295027.workers.dev/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "ราคาห้องพักมีแบบไหนบ้าง", "language": "th"}'`, 'curl')}
                  className="text-teal-600 hover:text-teal-700 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedCode === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'curl' ? 'คัดลอกแล้ว' : 'คัดลอก cURL'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-teal-300 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed">
{`curl -X POST https://resort-booking-system.674295027.workers.dev/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "ราคาห้องพักมีแบบไหนบ้าง", "language": "th"}'`}
              </pre>
            </div>

            {/* JavaScript fetch() Example */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">JavaScript / TypeScript (Fetch API)</span>
                <button
                  onClick={() => copyToClipboard(`const response = await fetch('https://resort-booking-system.674295027.workers.dev/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'เวลาเช็คอิน เช็คเอาท์กี่โมง',
    language: 'th'
  })
});
const result = await response.json();
console.log(result.reply);`, 'js')}
                  className="text-teal-600 hover:text-teal-700 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedCode === 'js' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'js' ? 'คัดลอกแล้ว' : 'คัดลอก JS'}</span>
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-teal-300 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed">
{`const response = await fetch('https://resort-booking-system.674295027.workers.dev/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'เวลาเช็คอิน เช็คเอาท์กี่โมง',
    language: 'th'
  })
});
const result = await response.json();
console.log(result.reply);`}
              </pre>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 3: KNOWLEDGE BASE FAQS CRUD */}
      {/* ==================================================================== */}
      {activeSubTab === 'FAQS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                คลังความรู้คำถาม-คำตอบ (Chatbot Knowledge Base FAQs)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                เพิ่ม แก้ไข ลบ ข้อมูลคำตอบเฉพาะทางของโรงแรม เมื่อลูกค้าถามตรงกับคำถามเหล่านี้ AI จะนำไปตอบทันที
              </p>
            </div>

            <button
              onClick={handleOpenAddFaq}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มคำถาม-คำตอบใหม่</span>
            </button>
          </div>

          {/* FAQs List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingFaqs ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                <span>กำลังโหลดข้อมูล FAQs จาก D1...</span>
              </div>
            ) : faqs.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                ยังไม่มีข้อมูล FAQ ในระบบ กดปุ่ม "เพิ่มคำถาม-คำตอบใหม่" ด้านบนเพื่อเพิ่มข้อมูล
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {faqs.map(faq => (
                  <div key={faq.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                          {faq.category}
                        </span>
                        <h5 className="font-bold text-sm text-slate-900">
                          {faq.question_th}
                        </h5>
                        {faq.question_en && (
                          <span className="text-xs text-slate-400">
                            ({faq.question_en})
                          </span>
                        )}
                        {!faq.is_active && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            ปิดใช้งาน
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                        {faq.answer_th}
                      </p>
                      {faq.answer_en && (
                        <p className="text-[11px] text-slate-400 italic">
                          EN: {faq.answer_en}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEditFaq(faq)}
                        className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="แก้ไขคำถาม-คำตอบ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        disabled={deletingFaqId === faq.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="ลบคำถามนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* FAQ ADD / EDIT MODAL */}
      {/* ==================================================================== */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600" />
              <span>{editingFaq ? 'แก้ไขคำถาม-คำตอบ FAQ' : 'เพิ่มคำถาม-คำตอบ FAQ ใหม่'}</span>
            </h4>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">หมวดหมู่</label>
                <select
                  value={faqForm.category}
                  onChange={e => setFaqForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-teal-600"
                >
                  <option value="GENERAL">ทั่วไป (General)</option>
                  <option value="AMENITIES">สิ่งอำนวยความสะดวก & สระว่ายน้ำ (Amenities)</option>
                  <option value="SERVICE">บริการรับส่ง & Wi-Fi (Service)</option>
                  <option value="DINING">อาหารเช้า & ห้องอาหาร (Dining)</option>
                  <option value="POLICIES">นโยบายและการเข้าพัก (Policies)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">คำถามภาษาไทย *</label>
                <input
                  type="text"
                  required
                  value={faqForm.question_th}
                  onChange={e => setFaqForm(f => ({ ...f, question_th: e.target.value }))}
                  placeholder="เช่น สระว่ายน้ำเปิดปิดกี่โมง"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-teal-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">คำตอบภาษาไทย *</label>
                <textarea
                  required
                  rows={3}
                  value={faqForm.answer_th}
                  onChange={e => setFaqForm(f => ({ ...f, answer_th: e.target.value }))}
                  placeholder="เช่น สระว่ายน้ำส่วนกลางเปิดให้บริการ 07:00 - 21:00 น..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-teal-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">คำถามภาษาอังกฤษ (Optional)</label>
                <input
                  type="text"
                  value={faqForm.question_en}
                  onChange={e => setFaqForm(f => ({ ...f, question_en: e.target.value }))}
                  placeholder="e.g. What are pool operating hours?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-teal-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">คำตอบภาษาอังกฤษ (Optional)</label>
                <textarea
                  rows={2}
                  value={faqForm.answer_en}
                  onChange={e => setFaqForm(f => ({ ...f, answer_en: e.target.value }))}
                  placeholder="e.g. The main pool is open daily 7 AM - 9 PM..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="faqActive"
                  checked={faqForm.is_active}
                  onChange={e => setFaqForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                />
                <label htmlFor="faqActive" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  เปิดใช้งานคำถามนี้ในระบบแชทบอท
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingFaq}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {savingFaq ? 'กำลังบันทึก...' : 'บันทึก FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default ChatbotApiManager;
