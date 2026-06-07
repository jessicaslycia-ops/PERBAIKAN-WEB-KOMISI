import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Users, ShieldCheck, Sparkles, X, Check, Trash2, Eye, ChevronLeft, Globe, MapPin, RefreshCw, Camera, Save, Pencil, User, Lock } from 'lucide-react';
import BorderGlow from './components/BorderGlow';
import './index.css';

type Tab = 'buy' | 'clients' | 'admin';
type BuyView = 'select' | 'local' | 'international';
type Locale = 'id' | 'en';

interface Commission {
  id: number;
  name: string;
  reference_link: string;
  pose_outfit: string;
  notes: string;
  sfw: boolean;
  nsfw: boolean;
  checked: boolean;
  accepted: boolean;
  progress: number;
  created_at: string;
}

interface Setting {
  key: string;
  value: string;
}

const MAX_SLOTS = 5;

const COMMISSION_TYPES_EN = [
  { id: 'half', label: 'Half Body', price: '$49' },
  { id: 'knee', label: 'Knee Up', price: '$59' },
  { id: 'full', label: 'Full Body', price: '$70' },
];

const COMMISSION_TYPES_ID = [
  { id: 'half', label: 'Half Body', price: 'Rp. 55.000' },
  { id: 'knee', label: 'Knee Up', price: 'Rp. 65.000' },
  { id: 'full', label: 'Full Body', price: 'Rp. 80.000' },
];

const API_URL = 'https://script.google.com/macros/s/AKfycbyR675qZ-b9030N8f8V-uWqYJ_0e9mGZl07oJ0XFwO8/exec';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [buyView, setBuyView] = useState<BuyView>('select');
  const [locale, setLocale] = useState<Locale>('id');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [localLockOn, setLocalLockOn] = useState(false);
  const [intlLockOn, setIntlLockOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formRef, setFormRef] = useState('');
  const [formPose, setFormPose] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSfw, setFormSfw] = useState(true);
  const [formNsfw, setFormNsfw] = useState(false);
  const [formType, setFormType] = useState('half');

  // Admin selected commission detail
  const [selectedComm, setSelectedComm] = useState<Commission | null>(null);

  // Fetch Commissions - PERBAIKAN: Menambahkan redirect: 'follow'
  const fetchCommissions = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_URL}?action=getCommissions`, {
        method: 'GET',
        redirect: 'follow' // <-- Ditambahkan agar fetch tidak failed di Vercel
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCommissions(data);
      }
    } catch (err: any) {
      setApiError(err.message || 'Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Settings - PERBAIKAN: Menambahkan redirect: 'follow'
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=getSettings`, {
        method: 'GET',
        redirect: 'follow' // <-- Ditambahkan agar fetch tidak failed di Vercel
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const localLock = data.find((s: Setting) => s.key === 'local_lock');
        const intlLock = data.find((s: Setting) => s.key === 'intl_lock');
        if (localLock) setLocalLockOn(localLock.value === 'true');
        if (intlLock) setIntlLockOn(intlLock.value === 'true');
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
    fetchSettings();
  }, [fetchCommissions, fetchSettings]);

  const acceptedCount = commissions.filter(c => c.accepted).length;
  const currentTypes = locale === 'id' ? COMMISSION_TYPES_ID : COMMISSION_TYPES_EN;

  // Submit Commission - PERBAIKAN: Menambahkan redirect: 'follow'
  const handleSubmitCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setIsLoading(true);

    const typeObj = currentTypes.find(t => t.id === formType);
    const finalTypeLabel = typeObj ? `${typeObj.label} (${typeObj.price})` : formType;

    const payload = {
      action: 'addCommission',
      name: formName,
      reference_link: formRef,
      pose_outfit: `[${finalTypeLabel}] ${formPose}`,
      notes: formNotes,
      sfw: formSfw,
      nsfw: formNsfw
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow', // <-- Ditambahkan untuk penanganan POST redirect Google Script
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Submit failed');
      
      // Reset form
      setFormName('');
      setFormRef('');
      setFormPose('');
      setFormNotes('');
      setFormSfw(true);
      setFormNsfw(false);
      
      alert(locale === 'id' ? 'Komisi berhasil dikirim!' : 'Commission submitted successfully!');
      fetchCommissions();
      setActiveTab('clients');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update Commission Status - PERBAIKAN: Menambahkan redirect: 'follow'
  const handleUpdateStatus = async (id: number, updates: Partial<Commission>) => {
    setIsLoading(true);
    const payload = {
      action: 'updateCommission',
      id,
      ...updates
    };
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow', // <-- Ditambahkan
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchCommissions();
      if (selectedComm && selectedComm.id === id) {
        const fresh = commissions.find(c => c.id === id);
        if (fresh) setSelectedComm({ ...fresh, ...updates });
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Commission - PERBAIKAN: Menambahkan redirect: 'follow'
  const handleDeleteCommission = async (id: number) => {
    if (!confirm(locale === 'id' ? 'Hapus komisi ini?' : 'Delete this commission?')) return;
    setIsLoading(true);
    const payload = { action: 'deleteCommission', id };
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow', // <-- Ditambahkan
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Delete failed');
      setSelectedComm(null);
      fetchCommissions();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Locks - PERBAIKAN: Menambahkan redirect: 'follow'
  const saveLocks = async () => {
    setIsLoading(true);
    const payload = {
      action: 'updateSettings',
      settings: [
        { key: 'local_lock', value: String(localLockOn) },
        { key: 'intl_lock', value: String(intlLockOn) }
      ]
    };
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow', // <-- Ditambahkan
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      alert('Locks saved successfully');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'nurullladmin99') {
      setIsAdminLoggedIn(true);
      setAdminError('');
    } else {
      setAdminError(locale === 'id' ? 'Password salah!' : 'Wrong password!');
    }
  };

  // Translation helpers
  const txt = {
    welcome: locale === 'id' ? 'Selamat Datang Di' : 'Welcome To',
    slotsFilled: locale === 'id' ? `${acceptedCount}/${MAX_SLOTS} slot terisi` : `${acceptedCount}/${MAX_SLOTS} slots filled`,
    buyTab: locale === 'id' ? 'Pesan Komisi' : 'Buy Commission',
    clientTab: locale === 'id' ? 'Daftar Klien' : 'Client List',
    adminTab: locale === 'id' ? 'Admin Panel' : 'Admin Panel',
    selectRegion: locale === 'id' ? 'Pilih Wilayah Anda' : 'Select Your Region',
    localBtn: locale === 'id' ? 'Indonesia (Rupiah)' : 'Indonesia (Rupiah)',
    intlBtn: locale === 'id' ? 'International (USD)' : 'International (USD)',
    lockedMessage: locale === 'id' ? 'Maaf, slot untuk wilayah ini sedang ditutup.' : 'Sorry, slots for this region are currently closed.',
    formName: locale === 'id' ? 'Nama / Username' : 'Name / Username',
    formRef: locale === 'id' ? 'Link Referensi Gambar' : 'Image Reference Link',
    formPose: locale === 'id' ? 'Detail Pose & Pakaian' : 'Pose & Outfit Details',
    formNotes: locale === 'id' ? 'Catatan Tambahan' : 'Additional Notes',
    submitBtn: locale === 'id' ? 'Kirim Permintaan Komisi' : 'Submit Commission Request',
    backBtn: locale === 'id' ? 'Kembali' : 'Back',
    clientListTitle: locale === 'id' ? 'Antrean Komisi Publik' : 'Public Commission Queue',
    adminTitle: locale === 'id' ? 'Otentikasi Admin' : 'Admin Authentication',
    adminPassPlace: locale === 'id' ? 'Masukkan password admin...' : 'Enter admin password...',
    loginBtn: locale === 'id' ? 'Masuk' : 'Log In',
    lockLocal: locale === 'id' ? 'Kunci Slot Lokal' : 'Lock Local Slots',
    lockInternational: locale === 'id' ? 'Kunci Slot Internasional' : 'Lock International Slots',
    locked: locale === 'id' ? 'Terkunci' : 'Locked',
    unlocked: locale === 'id' ? 'Terbuka' : 'Unlocked',
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans antialiased bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/20 via-black to-black pb-12 px-4 selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Top Banner & Language Switcher */}
      <div className="max-w-5xl mx-auto pt-6 flex justify-end gap-2">
        <button 
          onClick={() => setLocale('id')} 
          className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border transition-all ${locale === 'id' ? 'bg-purple-500/10 border-purple-400/30 text-purple-300' : 'bg-transparent border-white/[0.04] text-gray-500 hover:text-gray-300'}`}>
          ID
        </button>
        <button 
          onClick={() => setLocale('en')} 
          className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border transition-all ${locale === 'en' ? 'bg-purple-500/10 border-purple-400/30 text-purple-300' : 'bg-transparent border-white/[0.04] text-gray-500 hover:text-gray-300'}`}>
          EN
        </button>
      </div>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto pt-10 text-center mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-purple-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" /> {txt.welcome} <Sparkles className="w-3.5 h-3.5" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 bg-gradient-to-r from-white via-gray-200 to-purple-400 bg-clip-text text-transparent">
          NURULL COMMISSION
        </h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/[0.06] rounded-full text-xs text-gray-400 backdrop-blur-md">
          <div className={`w-1.5 h-1.5 rounded-full ${acceptedCount >= MAX_SLOTS ? 'bg-red-400' : 'bg-purple-400 animate-pulse'}`}></div>
          <span className="font-medium tracking-wide">{txt.slotsFilled}</span>
          {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-purple-400 ml-1" />}
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div className="max-w-md mx-auto mt-4 p-2.5 bg-red-500/8 border border-red-500/15 text-red-400 rounded-xl text-xs flex items-center justify-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{apiError}</span>
            <button onClick={fetchCommissions} className="underline hover:text-red-300 ml-1">Retry</button>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <div className="flex justify-center gap-1.5 mt-8 max-w-sm mx-auto bg-white/[0.02] border border-white/[0.04] p-1 rounded-xl backdrop-blur-sm">
          <TabButton active={activeTab === 'buy'} onClick={() => { setActiveTab('buy'); setBuyView('select'); }} icon={<PenLine className="w-4 h-4" />} label={txt.buyTab} />
          <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users className="w-4 h-4" />} label={txt.clientTab} />
          <TabButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<ShieldCheck className="w-4 h-4" />} label={txt.adminTab} />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: BUY COMMISSION */}
          {activeTab === 'buy' && (
            <motion.div key="buy-tab" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              <BorderGlow animated={buyView !== 'select'} glowColor="270deg 70% 60%">
                <GlassCard>
                  {buyView === 'select' && (
                    <div className="py-10 text-center">
                      <h2 className="text-xl font-bold text-white mb-6 tracking-tight">{txt.selectRegion}</h2>
                      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                        <button onClick={() => setBuyView('local')}
                          className="flex-1 p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-purple-500/30 text-left transition-all group">
                          <MapPin className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-105 transition-transform" />
                          <p className="font-bold text-gray-200 text-sm mb-0.5">{txt.localBtn}</p>
                          <p className="text-xs text-gray-500">Slot lokal via QRIS / Bank Transfer.</p>
                        </button>
                        <button onClick={() => setBuyView('international')}
                          className="flex-1 p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-purple-500/30 text-left transition-all group">
                          <Globe className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-105 transition-transform" />
                          <p className="font-bold text-gray-200 text-sm mb-0.5">{txt.intlBtn}</p>
                          <p className="text-xs text-gray-500">Global slots via PayPal / Invoice.</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {buyView !== 'select' && (
                    <div>
                      <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                        <button onClick={() => setBuyView('select')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-all">
                          <ChevronLeft className="w-4 h-4" /> {txt.backBtn}
                        </button>
                        <span className="text-xs font-semibold tracking-wider uppercase text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/10">
                          {buyView === 'local' ? 'Local Slot' : 'International Slot'}
                        </span>
                      </div>

                      {((buyView === 'local' && localLockOn) || (buyView === 'international' && intlLockOn)) ? (
                        <div className="py-12 text-center max-w-sm mx-auto">
                          <Lock className="w-8 h-8 text-red-400/60 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-300">{txt.lockedMessage}</p>
                        </div>
                      ) : acceptedCount >= MAX_SLOTS ? (
                        <div className="py-12 text-center max-w-sm mx-auto">
                          <Lock className="w-8 h-8 text-red-400/60 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-300">
                            {locale === 'id' ? 'Semua slot komisi penuh saat ini! Silakan cek antrean secara berkala.' : 'All commission slots are currently full! Please check the queue periodically.'}
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitCommission} className="space-y-4 max-w-xl mx-auto">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {currentTypes.map(t => (
                              <label key={t.id} className={`flex flex-col p-3 rounded-xl border text-center cursor-pointer transition-all ${formType === t.id ? 'bg-purple-500/10 border-purple-500/40 text-white' : 'bg-white/[0.01] border-white/[0.05] text-gray-400 hover:bg-white/[0.02]'}`}>
                                <input type="radio" name="commType" value={t.id} checked={formType === t.id} onChange={(e) => setFormType(e.target.value)} className="sr-only" />
                                <span className="text-xs font-bold">{t.label}</span>
                                <span className="text-sm font-black text-purple-400 mt-1">{t.price}</span>
                              </label>
                            ))}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{txt.formName}</label>
                            <input required type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Nurul / @nurul_art"
                              className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-purple-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-all" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{txt.formRef}</label>
                            <input required type="url" value={formRef} onChange={(e) => setFormRef(e.target.value)} placeholder="e.g. https://drive.google.com/..."
                              className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-purple-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-all" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{txt.formPose}</label>
                            <input required type="text" value={formPose} onChange={(e) => setFormPose(e.target.value)} placeholder="e.g. Standing, dark techwear outfit, holding katana"
                              className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-purple-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-all" />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{txt.formNotes}</label>
                            <textarea rows={3} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="e.g. Please make the background purple aesthetic..."
                              className="w-full bg-white/[0.02] border border-white/[0.06] focus:border-purple-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-all resize-none" />
                          </div>

                          <div className="flex gap-4 p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl">
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 cursor-pointer select-none">
                              <input type="checkbox" checked={formSfw} onChange={(e) => setFormSfw(e.target.checked)} className="rounded border-white/[0.1] bg-black text-purple-600 focus:ring-0 focus:ring-offset-0" />
                              SFW Art
                            </label>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-400 cursor-pointer select-none">
                              <input type="checkbox" checked={formNsfw} onChange={(e) => setFormNsfw(e.target.checked)} className="rounded border-white/[0.1] bg-black text-purple-600 focus:ring-0 focus:ring-offset-0" />
                              NSFW Variant (+Fee)
                            </label>
                          </div>

                          <button type="submit" disabled={isLoading}
                            className="w-full font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl shadow-lg shadow-purple-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            {txt.submitBtn}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </GlassCard>
              </BorderGlow>
            </motion.div>
          )}

          {/* TAB 2: PUBLIC CLIENT LIST */}
          {activeTab === 'clients' && (
            <motion.div key="clients-tab" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              <GlassCard>
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">{txt.clientListTitle}</h2>
                  </div>
                  <button onClick={fetchCommissions} disabled={isLoading} className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white transition-all disabled:opacity-40">
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {commissions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-500">
                    {locale === 'id' ? 'Belum ada data permintaan komisi.' : 'No commission requests found.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {commissions.map((c, i) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl hover:bg-white/[0.02] transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-200 truncate">{c.name}</p>
                            <p className="text-[11px] text-gray-500 truncate max-w-[200px] sm:max-w-md">{c.pose_outfit}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {!c.checked ? (
                            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">Pending</span>
                          ) : !c.accepted ? (
                            <span className="text-[10px] font-bold tracking-wider uppercase text-red-400/90 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/10">Declined</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">Active Slot</span>
                              <div className="w-16 bg-white/[0.05] h-1.5 rounded-full overflow-hidden border border-white/[0.04] hidden sm:block">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${c.progress}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-gray-400 hidden sm:inline">{c.progress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* TAB 3: ADMIN PANEL */}
          {activeTab === 'admin' && (
            <motion.div key="admin-tab" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              {!isAdminLoggedIn ? (
                <GlassCard className="max-w-sm mx-auto">
                  <div className="text-center mb-6">
                    <Lock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <h2 className="text-base font-bold text-white tracking-tight">{txt.adminTitle}</h2>
                  </div>
                  <form onSubmit={handleAdminLogin} className="space-y-3">
                    <input required type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder={txt.adminPassPlace}
                      className="w-full bg-black border border-white/[0.08] focus:border-purple-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none transition-all" />
                    {adminError && <p className="text-[11px] text-red-400 pl-1">{adminError}</p>}
                    <button type="submit" className="w-full font-bold text-xs bg-white text-black hover:bg-gray-200 py-2.5 rounded-xl transition-all uppercase tracking-wider">
                      {txt.loginBtn}
                    </button>
                  </form>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: List & Settings */}
                  <div className="md:col-span-1 space-y-4">
                    <GlassCard p="p-4">
                      <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                        <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Control Desk
                        </p>
                        <button onClick={() => setIsAdminLoggedIn(false)} className="text-[10px] font-bold text-gray-500 hover:text-white tracking-wider uppercase">
                          Logout
                        </button>
                      </div>

                      {/* Lock Toggles */}
                      <div className="space-y-2 mb-4">
                        <button onClick={() => setLocalLockOn(!localLockOn)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                            localLockOn ? 'bg-red-500/8 border-red-500/15 text-red-300' : 'bg-white/[0.01] border-white/[0.05] text-gray-400 hover:text-white'
                          }`}>
                          <span>{txt.lockLocal}</span>
                          <span className="text-[10px] font-bold uppercase">{localLockOn ? txt.locked : txt.unlocked}</span>
                        </button>
                        <button onClick={() => setIntlLockOn(!intlLockOn)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                            intlLockOn ? 'bg-red-500/8 border-red-500/15 text-red-300' : 'bg-white/[0.01] border-white/[0.05] text-gray-400 hover:text-white'
                          }`}>
                          <span>{txt.lockInternational}</span>
                          <span className="text-[10px] font-bold uppercase">{intlLockOn ? txt.locked : txt.unlocked}</span>
                        </button>
                        <button onClick={saveLocks} disabled={isLoading}
                          className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/20 rounded-xl transition-all flex items-center justify-center gap-1">
                          <Save className="w-3.5 h-3.5" /> Save Lock Configurations
                        </button>
                      </div>
                    </GlassCard>

                    {/* Mini List */}
                    <GlassCard p="p-4" className="max-h-[400px] overflow-y-auto">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-white/[0.05] pb-2">Inbox ({commissions.length})</p>
                      <div className="space-y-1.5">
                        {commissions.map(c => (
                          <button key={c.id} onClick={() => setSelectedComm(c)}
                            className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${selectedComm?.id === c.id ? 'bg-purple-500/10 border-purple-500/30 text-white' : 'bg-white/[0.01] border-white/[0.04] text-gray-400 hover:bg-white/[0.02]'}`}>
                            <span className="text-xs font-bold truncate block">{c.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${!c.checked ? 'bg-amber-500/10 text-amber-400' : !c.accepted ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              {!c.checked ? 'New' : !c.accepted ? 'Rej' : `${c.progress}%`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Right Column: Detail Desk */}
                  <div className="md:col-span-2">
                    <GlassCard className="h-full flex flex-col justify-between">
                      {selectedComm ? (
                        <div className="space-y-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                              <div>
                                <h3 className="text-base font-black text-white">{selectedComm.name}</h3>
                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{selectedComm.created_at}</p>
                              </div>
                              <button onClick={() => handleDeleteCommission(selectedComm.id)} disabled={isLoading} className="p-2 text-gray-500 hover:text-red-400 bg-white/[0.02] border border-white/[0.06] rounded-xl transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.01] p-3 border border-white/[0.04] rounded-xl">
                              <DetailRow label="Order Meta Details" value={selectedComm.pose_outfit} />
                              <DetailRow label="Reference Link" value={selectedComm.reference_link} isLink />
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Client Notes</p>
                              <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {selectedComm.notes || 'No extra notes provided.'}
                              </div>
                            </div>

                            <div className="flex gap-4 text-xs">
                              <span className={`px-2 py-0.5 rounded border font-semibold ${selectedComm.sfw ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400' : 'bg-white/[0.02] border-white/[0.05] text-gray-500'}`}>SFW</span>
                              <span className={`px-2 py-0.5 rounded border font-semibold ${selectedComm.nsfw ? 'bg-red-500/10 border-red-500/10 text-red-400' : 'bg-white/[0.02] border-white/[0.05] text-gray-500'}`}>NSFW Variant</span>
                            </div>
                          </div>

                          {/* Action Bar Desk */}
                          <div className="border-t border-white/[0.05] pt-4 mt-6">
                            {!selectedComm.checked ? (
                              <div className="flex gap-2">
                                <button onClick={() => handleUpdateStatus(selectedComm.id, { checked: true, accepted: true })} disabled={isLoading}
                                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10">
                                  <Check className="w-4 h-4" /> Accept & Open Slot
                                </button>
                                <button onClick={() => handleUpdateStatus(selectedComm.id, { checked: true, accepted: false })} disabled={isLoading}
                                  className="py-2.5 px-4 rounded-xl bg-white/[0.02] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 text-gray-400 hover:text-red-400 font-bold text-xs uppercase tracking-wider transition-all">
                                  Decline
                                </button>
                              </div>
                            ) : !selectedComm.accepted ? (
                              <button onClick={() => handleUpdateStatus(selectedComm.id, { checked: true, accepted: true, progress: 0 })} disabled={isLoading}
                                className="w-full py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all uppercase tracking-wider">
                                Re-evaluate & Accept Order
                              </button>
                            ) : (
                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs text-gray-400">
                                    <span className="font-medium">Production Progress Desk</span>
                                    <span className="font-bold text-purple-400">{selectedComm.progress}%</span>
                                  </div>
                                  <input type="range" min="0" max="100" step="5" value={selectedComm.progress} disabled={isLoading}
                                    onChange={(e) => handleUpdateStatus(selectedComm.id, { progress: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-white/[0.05] rounded-lg appearance-none cursor-pointer accent-purple-500" />
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleUpdateStatus(selectedComm.id, { progress: 100 })} disabled={isLoading || selectedComm.progress === 100}
                                    className="flex-1 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-xs font-bold transition-all uppercase tracking-wide">
                                    Mark 100% Finished
                                  </button>
                                  <button onClick={() => handleUpdateStatus(selectedComm.id, { checked: false, accepted: false, progress: 0 })} disabled={isLoading}
                                    className="py-2 px-3 bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/20 text-gray-500 hover:text-amber-400 rounded-lg text-xs font-medium transition-all">
                                    Reset to Inbox
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center text-xs text-gray-500 flex flex-col items-center justify-center h-full">
                          <User className="w-6 h-6 text-gray-700 mb-2" />
                          <span>Select a ticket from the inbox to manage credentials</span>
                        </div>
                      )}
                    </GlassCard>
                  </div>

                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold tracking-wide transition-all ${active ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10' : 'text-gray-500 hover:text-gray-300 bg-transparent'}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function GlassCard({ children, className = '', p = 'p-6' }: { children: React.ReactNode; className?: string; p?: string }) {
  return (
    <div className={`w-full bg-[#08060a]/70 border border-white/[0.04] backdrop-blur-xl rounded-2xl ${p} shadow-2xl relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function DetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline font-medium break-all block">
          {value}
        </a>
      ) : (
        <p className="text-xs text-gray-200 font-bold break-words">{value}</p>
      )}
    </div>
  );
}
