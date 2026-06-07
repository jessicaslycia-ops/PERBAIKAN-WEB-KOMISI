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
  { id: 'knee', label: 'Knee Up', price: 'Rp. 70.000' },
  { id: 'full', label: 'Full Body', price: 'Rp. 80.000' },
];

const t = {
  en: {
    buyCommission: 'Buy Commission',
    clientList: 'View Client List',
    adminLogin: 'Log In Admin',
    selectRegion: 'Select Your Region',
    local: 'Local',
    international: 'International',
    localDesc: 'For clients within Indonesia',
    internationalDesc: 'For clients outside Indonesia',
    conditionsTitle: 'Commission Terms & Conditions',
    fillForm: 'Fill Commission Form',
    nameLabel: 'Your name, or your username on other platforms so I can find you.',
    refLabel: 'Please submit a link to your character references.',
    poseLabel: 'Please submit your character pose, outfit, or something else.',
    notesLabel: 'Note for additions for your character.',
    contentRating: 'Content Rating',
    commissionType: 'Commission Type',
    submit: 'Submit Commission',
    submitting: 'Submitting...',
    successMsg: 'Commission submitted successfully! You are now in the client list.',
    clientsInQueue: 'clients in queue',
    noClients: 'No clients yet. Be the first to submit a commission!',
    adminPanel: 'Admin Panel',
    manageClients: 'Manage your commission clients',
    password: 'Password',
    enterPassword: 'Enter admin password',
    login: 'Log In',
    loggingIn: 'Logging in...',
    logout: 'Log Out',
    clientDetails: 'Client Details',
    backToList: 'Back to Client List',
    delete: 'Delete',
    checked: 'Checked',
    markChecked: 'Mark as checked',
    refresh: 'Refresh',
    loadError: 'Failed to load data. Please try again.',
    lastUpdated: 'Last updated',
    termsEditorEn: 'Edit Terms (English)',
    termsEditorId: 'Edit Terms (Indonesian)',
    profilePhoto: 'Profile Photo',
    uploadPhoto: 'Upload Photo',
    photoUrl: 'Photo URL',
    save: 'Save',
    saved: 'Saved!',
    clientProgress: 'Client Progress',
    progress: 'Progress',
    slots: 'Slots',
    slotsFilled: 'slots filled',
    lockLocal: 'Lock Local',
    lockInternational: 'Lock International',
    locked: 'Locked',
    unlocked: 'Unlocked',
    lockedPopupTitle: 'Commission Locked',
    lockedLocalMsg: 'Local commissions are currently locked. Please check back later!',
    lockedInternationalMsg: 'International commissions are currently locked. Please check back later!',
  },
  id: {
    buyCommission: 'Beli Komisi',
    clientList: 'Daftar Klien',
    adminLogin: 'Masuk Admin',
    selectRegion: 'Pilih Wilayah Anda',
    local: 'Lokal',
    international: 'Internasional',
    localDesc: 'Untuk klien di dalam Indonesia',
    internationalDesc: 'Untuk klien di luar Indonesia',
    conditionsTitle: 'Syarat & Ketentuan Komisi',
    fillForm: 'Isi Formulir Komisi',
    nameLabel: 'Nama Anda, atau nama pengguna di platform lain agar saya dapat menemukan Anda.',
    refLabel: 'Mohon kirimkan tautan referensi karakter Anda.',
    poseLabel: 'Mohon kirimkan pose, pakaian, atau hal lain untuk karakter Anda.',
    notesLabel: 'Catatan tambahan untuk karakter Anda.',
    contentRating: 'Peringkat Konten',
    commissionType: 'Jenis Komisi',
    submit: 'Kirim Komisi',
    submitting: 'Mengirim...',
    successMsg: 'Komisi berhasil dikirim! Anda sekarang ada di daftar klien.',
    clientsInQueue: 'klien dalam antrian',
    noClients: 'Belum ada klien. Jadilah yang pertama mengirim komisi!',
    adminPanel: 'Panel Admin',
    manageClients: 'Kelola klien komisi Anda',
    password: 'Kata Sandi',
    enterPassword: 'Masukkan kata sandi admin',
    login: 'Masuk',
    loggingIn: 'Sedang masuk...',
    logout: 'Keluar',
    clientDetails: 'Detail Klien',
    backToList: 'Kembali ke Daftar Klien',
    delete: 'Hapus',
    checked: 'Sudah Dicek',
    markChecked: 'Tandai sudah dicek',
    refresh: 'Segarkan',
    loadError: 'Gagal memuat data. Silakan coba lagi.',
    lastUpdated: 'Terakhir diperbarui',
    termsEditorEn: 'Edit Syarat (Bahasa Inggris)',
    termsEditorId: 'Edit Syarat (Bahasa Indonesia)',
    profilePhoto: 'Foto Profil',
    uploadPhoto: 'Unggah Foto',
    photoUrl: 'URL Foto',
    save: 'Simpan',
    saved: 'Tersimpan!',
    clientProgress: 'Progres Klien',
    progress: 'Progres',
    slots: 'Slot',
    slotsFilled: 'slot terisi',
    lockLocal: 'Kunci Lokal',
    lockInternational: 'Kunci Internasional',
    locked: 'Terkunci',
    unlocked: 'Terbuka',
    lockedPopupTitle: 'Komisi Terkunci',
    lockedLocalMsg: 'Komisi lokal saat ini terkunci. Silakan cek kembali nanti!',
    lockedInternationalMsg: 'Komisi internasional saat ini terkunci. Silakan cek kembali nanti!',
  },
};

async function apiFetch(path: string, options?: RequestInit) {
  const bust = `_cb=${Date.now()}`;
  const sep = path.includes('?') ? '&' : '?';
  const url = `${path}${sep}${bust}`;
  const res = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers: {
      ...options?.headers,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function StarParticles() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = isMobile ? 40 : 80;
  const particles = useRef<Array<{
    id: number; left: number; top: number; size: number;
    delay: number; duration: number; floatDuration: number;
  }>>([]);
  if (particles.current.length === 0) {
    particles.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
      floatDuration: 8 + Math.random() * 12,
    }));
  }
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.current.map((p) => (
        <div key={p.id} className="absolute rounded-full"
          style={{
            left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size,
            background: 'rgba(255,255,255,0.7)',
            boxShadow: `0 0 ${p.size * 2}px ${p.size * 0.5}px rgba(255,255,255,0.3)`,
            animation: `twinkle ${p.duration}s ease-in-out ${p.delay}s infinite, floatParticle ${p.floatDuration}s ease-in-out ${p.delay}s infinite`,
          }} />
      ))}
    </div>
  );
}

function AuroraGlow() {
  return <div className="aurora-glow" aria-hidden="true" />;
}

function LockPopup({ show, locale, onClose }: { show: boolean; locale: Locale; onClose: () => void }) {
  const txt = t[locale];
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}>
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="max-w-sm w-full p-8 rounded-3xl text-center"
            style={{
              background: 'rgba(20,20,30,0.8)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(220,38,38,0.3)',
              boxShadow: '0 0 40px rgba(220,38,38,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}>
            <Lock className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-300 mb-3">{txt.lockedPopupTitle}</h3>
            <p className="text-sm text-gray-300 mb-6">
              {locale === 'id' ? txt.lockedLocalMsg : txt.lockedInternationalMsg}
            </p>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm font-medium hover:bg-red-500/25 transition-all">
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const glassStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 0 30px rgba(128,0,255,0.15)',
};

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className} style={glassStyle}>{children}</div>;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [buyView, setBuyView] = useState<BuyView>('select');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [termsEn, setTermsEn] = useState('');
  const [termsId, setTermsId] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [localLocked, setLocalLocked] = useState(false);
  const [internationalLocked, setInternationalLocked] = useState(false);
  const [lockPopupShow, setLockPopupShow] = useState(false);
  const [lockPopupLocale, setLockPopupLocale] = useState<Locale>('en');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [selectedClient, setSelectedClient] = useState<Commission | null>(null);
  const [customSlots, setCustomSlots] = useState(MAX_SLOTS);
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0 });
  const [titleTapCount, setTitleTapCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [profileRunaway, setProfileRunaway] = useState({ x: 0, y: 0 });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCommissions = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setFetchError('');
    try {
      const data = await apiFetch('/api/commissions');
      const sorted = Array.isArray(data) ? data.sort((a: Commission, b: Commission) => a.id - b.id) : [];
      setCommissions(sorted);
      setLastUpdated(new Date());
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await apiFetch('/api/settings');
      const settingsArr = Array.isArray(data) ? data : [];
      const en = settingsArr.find((s: Setting) => s.key === 'terms_text_en');
      const id = settingsArr.find((s: Setting) => s.key === 'terms_text_id');
      const photo = settingsArr.find((s: Setting) => s.key === 'profile_photo');
      const localLock = settingsArr.find((s: Setting) => s.key === 'local_locked');
      const intlLock = settingsArr.find((s: Setting) => s.key === 'international_locked');
      const slots = settingsArr.find((s: Setting) => s.key === 'commission_slots');
      if (en?.value) setTermsEn(en.value);
      if (id?.value) setTermsId(id.value);
      if (photo?.value) setProfilePhoto(photo.value);
      if (localLock?.value !== undefined) setLocalLocked(localLock.value === 'true');
      if (intlLock?.value !== undefined) setInternationalLocked(intlLock.value === 'true');
      if (slots?.value) setCustomSlots(Number(slots.value));
      setProfileLoaded(true);
    } catch {
      setProfileLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
    fetchSettings();
    const token = localStorage.getItem('nurul_admin_token');
    if (token) { setAdminToken(token); setAdminLoggedIn(true); }
  }, [fetchCommissions, fetchSettings]);

  useEffect(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (activeTab === 'clients' || activeTab === 'admin') {
      pollRef.current = setInterval(() => { fetchCommissions(false); fetchSettings(); }, 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeTab, fetchCommissions, fetchSettings]);

  useEffect(() => {
    const move = (e: MouseEvent) => setCursorGlow({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    if (activeTab === 'clients' || activeTab === 'admin') {
      setLoading(true); fetchCommissions(); fetchSettings();
    }
  }, [activeTab, fetchCommissions, fetchSettings]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedClient(null);
    if (tab === 'buy') setBuyView('select');
  };

  const handleRegionClick = (region: BuyView) => {
    if (region === 'local' && localLocked) {
      setLockPopupLocale('id');
      setLockPopupShow(true);
      return;
    }
    if (region === 'international' && internationalLocked) {
      setLockPopupLocale('en');
      setLockPopupShow(true);
      return;
    }
    setBuyView(region);
  };

  const getLocale = (): Locale => buyView === 'local' ? 'id' : 'en';
  const getTerms = () => buyView === 'local' ? termsId : termsEn;
  const txt = t[getLocale()];
  const acceptedCount = commissions.filter(c => c.accepted).length;

  return (
    <div className="min-h-screen animated-bg text-white overflow-x-hidden relative selection:bg-purple-500/30">
      <div className="cursor-glow" style={{ left: cursorGlow.x - 140, top: cursorGlow.y - 140 }} />
      <div className="god-rays"></div>
      <div className="light-particles"></div>
      <AuroraGlow />
      <StarParticles />
      <LockPopup show={lockPopupShow} locale={lockPopupLocale} onClose={() => setLockPopupShow(false)} />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 pt-6 pb-3 px-4"
        style={{ background: 'linear-gradient(to bottom, #0a0a0f 70%, transparent)' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="text-center">
          <motion.div className="flex items-center justify-center gap-2 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Sparkles className="w-3.5 h-3.5 text-purple-400/70" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-purple-300/50 font-medium">Welcome to</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400/70" />
          </motion.div>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4 md:gap-5">
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
                className="relative shrink-0" onMouseEnter={() => setProfileRunaway({ x: (Math.random() - 0.5) * 140, y: (Math.random() - 0.5) * 90 })} style={{ transform: `translate(${profileRunaway.x}px, ${profileRunaway.y}px)`, transition: "0.25s ease" }}>
                <div className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full overflow-hidden border-[2px] border-purple-400/40 shadow-[0_0_25px_rgba(168,85,247,0.3)] bg-[#0a0a0f] flex items-center justify-center breathe-glow profile-pulse">
                  {!profileLoaded ? (
                    <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  ) : profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 md:w-8 md:h-8 text-purple-400/50" />
                  )}
                </div>
              </motion.div>

              <motion.h1 className="text-3xl md:text-5xl font-bold tracking-tight"
                onClick={() => {
                  const next = titleTapCount + 1;
                  setTitleTapCount(next);
                  if (next >= 4) {
                    setShowWarning(true);
                    setTimeout(() => setShowWarning(false), 3500);
                    setTitleTapCount(0);
                  }
                }}
                initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
                style={{ textShadow: '0 0 30px rgba(168,85,247,0.15)' }}>
                <span className="bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
                  NURULL COMMISSION
                </span>
              </motion.h1>
            </div>
          </div>

          <div className="commission-open-bubble">Commission Open!</div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="mt-3 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20">
              <Users className="w-3 h-3 text-purple-300" />
              <span className="text-xs text-purple-200 font-medium">{acceptedCount}/{customSlots} {txt.slotsFilled}</span>
            </div>
            {localLocked && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-400/20">
                <Lock className="w-3 h-3 text-red-300" />
                <span className="text-[10px] text-red-300">Local</span>
              </div>
            )}
            {internationalLocked && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-400/20">
                <Lock className="w-3 h-3 text-red-300" />
                <span className="text-[10px] text-red-300">Intl</span>
              </div>
            )}
          </motion.div>

          <motion.div className="mt-3 h-[1px] mx-auto"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), rgba(139,92,246,0.2), transparent)' }}
            initial={{ width: 0, opacity: 0 }} animate={{ width: 140, opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} />
        </motion.div>
                {showWarning && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl bg-red-500/20 border border-red-400/30 backdrop-blur-xl text-red-100 shadow-[0_0_30px_rgba(255,0,0,0.25)]">
              ⚠ Hidden warning easter egg activated.
            </motion.div>
          )}
      </header>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-center gap-3 px-4 py-8 flex-wrap">
        {[
          { key: 'buy' as Tab, label: txt.buyCommission, icon: PenLine },
          { key: 'clients' as Tab, label: txt.clientList, icon: Users },
          { key: 'admin' as Tab, label: txt.adminLogin, icon: ShieldCheck },
        ].map((item, i) => (
          <motion.button key={item.key}
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            onClick={() => handleTabChange(item.key)}
            className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 backdrop-blur-xl border overflow-hidden menu-shimmer group ${
              activeTab === item.key
                ? 'bg-purple-500/12 border-purple-400/40 text-purple-100 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white hover:border-white/15'
            }`}>
            {activeTab === item.key && (
              <motion.div layoutId="activeTabGlow" className="absolute inset-0 rounded-xl"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                style={{ boxShadow: 'inset 0 0 20px rgba(168,85,247,0.08), 0 0 30px rgba(168,85,247,0.1)' }} />
            )}
            <item.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10 tracking-wide">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Content */}
      <main className="relative z-10 px-4 pb-20 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'buy' && (
            <BuySection key="buy" view={buyView} setView={setBuyView} locale={getLocale()} termsText={getTerms()}
              adminLoggedIn={adminLoggedIn} onTermsUpdate={fetchSettings}
              localLocked={localLocked} internationalLocked={internationalLocked}
              onRegionClick={handleRegionClick} />
          )}
          {activeTab === 'clients' && (
            <ClientList key="clients" commissions={commissions} loading={loading} error={fetchError}
              lastUpdated={lastUpdated} onRefresh={() => { fetchCommissions(); fetchSettings(); }} locale={getLocale()} />
          )}
          {activeTab === 'admin' && (
            <AdminSection key="admin" adminLoggedIn={adminLoggedIn} setAdminLoggedIn={setAdminLoggedIn}
              adminToken={adminToken} setAdminToken={setAdminToken} commissions={commissions} loading={loading}
              error={fetchError} lastUpdated={lastUpdated} onRefresh={() => { fetchCommissions(); fetchSettings(); }}
              selectedClient={selectedClient} setSelectedClient={setSelectedClient} onUpdate={fetchCommissions}
              termsEn={termsEn} termsId={termsId} profilePhoto={profilePhoto}
              localLocked={localLocked} internationalLocked={internationalLocked}
              onSettingsUpdate={fetchSettings} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─── Buy Section ─── */
function BuySection({ view, setView, locale, termsText, adminLoggedIn, onTermsUpdate, localLocked, internationalLocked, onRegionClick }: {
  view: BuyView; setView: (v: BuyView) => void; locale: Locale; termsText: string;
  adminLoggedIn: boolean; onTermsUpdate: () => void;
  localLocked: boolean; internationalLocked: boolean;
  onRegionClick: (region: BuyView) => void;
}) {
  const txt = t[locale];
  const [editingTerms, setEditingTerms] = useState(false);
  const [editText, setEditText] = useState(termsText);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setEditText(termsText); }, [termsText]);

  const saveTerms = async () => {
    try {
      const key = locale === 'id' ? 'terms_text_id' : 'terms_text_en';
      await apiFetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value: editText }) });
      setSaved(true); setEditingTerms(false); onTermsUpdate();
      setTimeout(() => setSaved(false), 2000);
    } catch { alert('Failed to save terms'); }
  };

  if (view === 'select') {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={33}
          glowRadius={47}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
        >
          <GlassCard className="rounded-3xl p-8 md:p-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 0 15px rgba(168,85,247,0.15)' }}>{txt.selectRegion}</h2>
              <p className="text-sm text-gray-400 mt-2">Choose your region to continue</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <RegionCard icon={MapPin} title={txt.local} desc={txt.localDesc}
                locked={localLocked} onClick={() => onRegionClick('local')} />
              <RegionCard icon={Globe} title={txt.international} desc={txt.internationalDesc}
                locked={internationalLocked} onClick={() => onRegionClick('international')} />
            </div>
          </GlassCard>
        </BorderGlow>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
      <button onClick={() => setView('select')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4 px-2 py-1 rounded-lg hover:bg-white/5">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <BorderGlow
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#120F17"
        borderRadius={33}
        glowRadius={47}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        colors={['#c084fc', '#f472b6', '#38bdf8']}
        className="mb-6"
      >
        <GlassCard className="rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/12 flex items-center justify-center">
                <ShieldCheck className="w-[18px] h-[18px] text-amber-300" />
              </div>
              <h2 className="text-lg font-bold text-white" style={{ textShadow: '0 0 15px rgba(168,85,247,0.15)' }}>{txt.conditionsTitle}</h2>
            </div>
            {adminLoggedIn && (
              <button onClick={() => { setEditingTerms(!editingTerms); setEditText(termsText); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/12 border border-purple-400/20 text-purple-200 text-xs hover:bg-purple-500/20 transition-all">
                <Pencil className="w-3 h-3" /> {editingTerms ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-300 text-sm text-center">
                {txt.saved}
              </motion.div>
            )}
          </AnimatePresence>
          {editingTerms && adminLoggedIn ? (
            <div className="space-y-3">
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={18}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-400/30 focus:bg-white/[0.04] transition-all backdrop-blur-sm resize-none font-mono leading-relaxed input-glow" />
              <button onClick={saveTerms}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-400/25 text-purple-100 text-sm hover:bg-purple-500/25 transition-all">
                <Save className="w-4 h-4" /> {txt.save}
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-300/80 whitespace-pre-wrap leading-relaxed">
              {termsText || (locale === 'id' ? 'Syarat dan ketentuan belum ditetapkan.' : 'Terms and conditions have not been set yet.')}
            </div>
          )}
        </GlassCard>
      </BorderGlow>

      <CommissionForm locale={locale} onSubmitted={() => {}} />
    </motion.div>
  );
}

function RegionCard({ icon: Icon, title, desc, locked, onClick }: {
  icon: React.ElementType; title: string; desc: string; locked: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`relative p-6 rounded-2xl backdrop-blur-xl text-left transition-all overflow-hidden ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer'}`}
      style={{
        background: 'rgba(20,20,30,0.35)',
        backdropFilter: 'blur(16px)',
        border: locked ? '1px solid rgba(220,38,38,0.2)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: locked ? '0 0 20px rgba(220,38,38,0.1)' : '0 0 20px rgba(128,0,255,0.1)',
      }}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-8 h-8 ${locked ? 'text-red-300' : 'text-purple-300'}`} />
        {locked && <Lock className="w-4 h-4 text-red-400" />}
      </div>
      <h3 className="text-lg font-bold text-white mb-1" style={{ textShadow: '0 0 10px rgba(255,255,255,0.08)' }}>{title}</h3>
      <p className="text-sm text-gray-400/70">{locked ? 'Currently locked' : desc}</p>
    </button>
  );
}

function CommissionForm({ locale, onSubmitted }: { locale: Locale; onSubmitted: () => void }) {
  const txt = t[locale];
  const [form, setForm] = useState({ name: '', reference_link: '', pose_outfit: '', notes: '', sfw: false, nsfw: false, commission_type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const typeList = locale === 'id' ? COMMISSION_TYPES_ID : COMMISSION_TYPES_EN;
      const selectedType = typeList.find(t => t.id === form.commission_type);
      const typeNote = selectedType ? `\n\n[COMMISSION TYPE] ${selectedType.label} (${selectedType.price})` : '';
      await apiFetch('/api/commissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, reference_link: form.reference_link, pose_outfit: form.pose_outfit, notes: form.notes + typeNote, sfw: form.sfw, nsfw: form.nsfw }),
      });
      setSuccess(true);
      setForm({ name: '', reference_link: '', pose_outfit: '', notes: '', sfw: false, nsfw: false, commission_type: '' });
      onSubmitted();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) { alert(err.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="40 80 80"
      backgroundColor="#120F17"
      borderRadius={33}
      glowRadius={47}
      glowIntensity={1}
      coneSpread={25}
      animated={false}
      colors={['#c084fc', '#f472b6', '#38bdf8']}
    >
      <GlassCard className="rounded-3xl p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-purple-500/12 flex items-center justify-center">
            <PenLine className="w-[18px] h-[18px] text-purple-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white" style={{ textShadow: '0 0 15px rgba(168,85,247,0.15)' }}>{txt.fillForm}</h2>
            <p className="text-sm text-gray-400">{locale === 'id' ? 'Isi detail di bawah ini' : 'Fill in the details below'}</p>
          </div>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> {txt.successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label={txt.nameLabel} value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder={locale === 'id' ? 'Contoh: @username' : 'e.g. @username'} required />
          <FormField label={txt.refLabel} value={form.reference_link} onChange={(v) => setForm({ ...form, reference_link: v })} placeholder="https://..." />
          <FormField label={txt.poseLabel} value={form.pose_outfit} onChange={(v) => setForm({ ...form, pose_outfit: v })} placeholder={locale === 'id' ? 'Deskripsikan pose...' : 'Describe the pose...'} textarea />
          <FormField label={txt.notesLabel} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder={locale === 'id' ? 'Detail tambahan...' : 'Any extra details...'} textarea />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">{txt.commissionType}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(locale === 'id' ? COMMISSION_TYPES_ID : COMMISSION_TYPES_EN).map((type) => (
                <button key={type.id} type="button" onClick={() => setForm({ ...form, commission_type: type.id })}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                    form.commission_type === type.id
                      ? 'bg-purple-500/12 border-purple-400/35' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                  style={form.commission_type === type.id ? { boxShadow: '0 0 20px rgba(168,85,247,0.15)' } : {}}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-semibold shrink-0 ${form.commission_type === type.id ? 'text-purple-200' : 'text-gray-300'}`}>{type.label}</span>
                    <span className={`text-base font-bold text-right tabular-nums ${form.commission_type === type.id ? 'text-purple-300' : 'text-gray-500'}`}>{type.price}</span>
                  </div>
                  {form.commission_type === type.id && (
                    <div className="absolute top-2 right-2"><Check className="w-3.5 h-3.5 text-purple-400" /></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">{txt.contentRating}</label>
            <div className="flex gap-5">
              {[{ key: 'sfw', label: 'SFW', color: 'emerald' }, { key: 'nsfw', label: 'NSFW', color: 'rose' }].map((item) => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${(form as any)[item.key] ? `bg-${item.color}-500/20 border-${item.color}-400` : 'border-white/15 group-hover:border-white/25'}`}>
                    {(form as any)[item.key] && <Check className={`w-3 h-3 text-${item.color}-300`} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={(form as any)[item.key]} onChange={(e) => setForm({ ...form, [item.key]: e.target.checked } as any)} />
                  <span className="text-sm text-gray-300">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button disabled={submitting || !form.name.trim() || !form.commission_type}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600/60 via-violet-600/60 to-purple-600/60 backdrop-blur-sm border border-purple-400/20 text-white font-semibold text-sm tracking-wide hover:from-purple-600 hover:via-violet-600 hover:to-purple-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 6px 20px rgba(168,85,247,0.2)' }}>
            {submitting ? txt.submitting : txt.submit}
          </button>
        </form>
      </GlassCard>
    </BorderGlow>
  );
}

function FormField({ label, value, onChange, placeholder, textarea, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; textarea?: boolean; required?: boolean;
}) {
  const inputClasses = 'w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400/25 focus:bg-white/[0.04] transition-all backdrop-blur-sm input-glow';
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}{required && <span className="text-purple-400 ml-1">*</span>}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={inputClasses + ' resize-none'} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClasses} />
      )}
    </div>
  );
}

/* ─── Client List ─── */
function ClientList({ commissions, loading, error, lastUpdated, onRefresh, locale }: {
  commissions: Commission[]; loading: boolean; error: string; lastUpdated: Date | null;
  onRefresh: () => void; locale: Locale;
}) {
  const txt = t[locale];
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
      <BorderGlow
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#120F17"
        borderRadius={33}
        glowRadius={47}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        colors={['#c084fc', '#f472b6', '#38bdf8']}
      >
        <GlassCard className="rounded-3xl p-6 md:p-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/12 flex items-center justify-center">
                <Users className="w-[18px] h-[18px] text-indigo-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white" style={{ textShadow: '0 0 15px rgba(168,85,247,0.15)' }}>{txt.clientList}</h2>
                <p className="text-sm text-gray-400">{commissions.length} {txt.clientsInQueue}</p>
              </div>
            </div>
            <button onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> {txt.refresh}
            </button>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-300 text-sm text-center">{txt.loadError}: {error}</div>}
          {lastUpdated && <p className="text-[10px] text-gray-600 mb-4 text-right">{txt.lastUpdated}: {lastUpdated.toLocaleTimeString()}</p>}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{txt.noClients}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commissions.map((client, index) => (
                <motion.div key={client.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    client.checked ? 'bg-emerald-500/[0.02] border-emerald-500/6' : 'bg-white/[0.02] border-white/[0.04] hover:border-white/8'
                  }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border ${
                    client.checked ? 'bg-emerald-500/12 text-emerald-300 border-emerald-400/12' : 'bg-gradient-to-br from-purple-500/12 to-violet-500/12 text-purple-300 border-purple-400/12'
                  }`}>
                    {client.checked ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${client.checked ? 'text-emerald-200/60 line-through' : 'text-white'}`}>{client.name}</p>
                    <p className="text-xs text-gray-500">{new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    {client.progress > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all duration-700" style={{ width: `${client.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-purple-300 font-medium tabular-nums">{client.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </BorderGlow>
    </motion.div>
  );
}

/* ─── Admin Section ─── */
function AdminSection({ adminLoggedIn, setAdminLoggedIn, adminToken, setAdminToken, commissions, loading, error, lastUpdated, onRefresh, selectedClient, setSelectedClient, onUpdate, termsEn, termsId, profilePhoto, localLocked, internationalLocked, onSettingsUpdate }: {
  adminLoggedIn: boolean; setAdminLoggedIn: (v: boolean) => void; adminToken: string; setAdminToken: (v: string) => void;
  commissions: Commission[]; loading: boolean; error: string; lastUpdated: Date | null; onRefresh: () => void;
  selectedClient: Commission | null; setSelectedClient: (c: Commission | null) => void; onUpdate: () => void;
  termsEn: string; termsId: string; profilePhoto: string | null;
  localLocked: boolean; internationalLocked: boolean; onSettingsUpdate: () => void;
}) {
  const txt = t['en'];
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [adminTab, setAdminTab] = useState<'clients' | 'slots' | 'progress' | 'terms' | 'profile'>('clients');
  const [editTermsEn, setEditTermsEn] = useState(termsEn);
  const [editTermsId, setEditTermsId] = useState(termsId);
  const [termsSaved, setTermsSaved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(profilePhoto || '');
  const [photoSaved, setPhotoSaved] = useState(false);
  const [localLockOn, setLocalLockOn] = useState(localLocked);
  const [intlLockOn, setIntlLockOn] = useState(internationalLocked);
  const [lockSaved, setLockSaved] = useState(false);
  const [progressClient, setProgressClient] = useState<Commission | null>(null);
  const [customSlots, setCustomSlots] = useState(MAX_SLOTS);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    setEditTermsEn(termsEn); setEditTermsId(termsId); setPhotoUrl(profilePhoto || '');
    setLocalLockOn(localLocked); setIntlLockOn(internationalLocked);
  }, [termsEn, termsId, profilePhoto, localLocked, internationalLocked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginError(''); setLoggingIn(true);
    try {
      const data = await apiFetch('/api/admin-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (data.success) { setAdminToken(data.token); setAdminLoggedIn(true); localStorage.setItem('nurul_admin_token', data.token); }
      else setLoginError(data.error || 'Invalid password');
    } catch { setLoginError('Login failed. Please try again.'); }
    finally { setLoggingIn(false); }
  };

  const handleLogout = () => { setAdminLoggedIn(false); setAdminToken(''); setSelectedClient(null); localStorage.removeItem('nurul_admin_token'); };

  const toggleChecked = async (client: Commission) => {
    try { await apiFetch('/api/commissions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: client.id, checked: !client.checked }) }); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const toggleAccepted = async (client: Commission) => {
    try { await apiFetch('/api/commissions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: client.id, accepted: !client.accepted }) }); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const updateProgress = async (clientId: number, progress: number) => {
    try { await apiFetch('/api/commissions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: clientId, progress }) }); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const deleteClient = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try { await apiFetch('/api/commissions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); setSelectedClient(null); setProgressClient(null); onUpdate(); }
    catch (err) { console.error(err); }
  };

  const saveTerms = async (locale: 'en' | 'id') => {
    try {
      const key = locale === 'id' ? 'terms_text_id' : 'terms_text_en';
      const value = locale === 'id' ? editTermsId : editTermsEn;
      await apiFetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
      setTermsSaved(true); onSettingsUpdate(); setTimeout(() => setTermsSaved(false), 2000);
    } catch { alert('Failed to save'); }
  };

  const savePhoto = async () => {
    try { await apiFetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'profile_photo', value: photoUrl }) }); setPhotoSaved(true); onSettingsUpdate(); setTimeout(() => setPhotoSaved(false), 2000); }
    catch { alert('Failed to save'); }
  };

  const saveLocks = async () => {
    try {
      await apiFetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'local_locked', value: localLockOn ? 'true' : 'false' }) });
      await apiFetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'international_locked', value: intlLockOn ? 'true' : 'false' }) });
      setLockSaved(true); onSettingsUpdate(); setTimeout(() => setLockSaved(false), 2000);
    } catch { alert('Failed to save'); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPhotoUrl(reader.result as string); };
    reader.readAsDataURL(file);
  };

  if (!adminLoggedIn) {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={33}
          glowRadius={47}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
        >
          <GlassCard className="rounded-3xl p-8 md:p-10 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-amber-500/12 flex items-center justify-center">
                <ShieldCheck className="w-[18px] h-[18px] text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white" style={{ textShadow: '0 0 15px rgba(168,85,247,0.15)' }}>{txt.adminLogin}</h2>
                <p className="text-sm text-gray-400">Enter your password to access the admin panel</p>
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{txt.password}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={txt.enterPassword}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-amber-400/25 focus:bg-white/[0.04] transition-all backdrop-blur-sm input-glow" />
              </div>
              {loginError && <p className="text-sm text-rose-400">{loginError}</p>}
              <button disabled={loggingIn || !password}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600/60 to-orange-600/60 backdrop-blur-sm border border-amber-400/20 text-white font-semibold text-sm tracking-wide hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 6px 20px rgba(245,158,11,0.15)' }}>
                {loggingIn ? txt.loggingIn : txt.login}
              </button>
            </form>
          </GlassCard>
        </BorderGlow>
      </motion.div>
    );
  }

  if (progressClient) {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={33}
          glowRadius={47}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
        >
          <GlassCard className="rounded-3xl p-6 md:p-10">
            <button onClick={() => setProgressClient(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6 px-2 py-1 rounded-lg hover:bg-white/5">
              <ChevronLeft className="w-4 h-4" /> {txt.backToList}
            </button>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-white mb-2" style={{ textShadow: '0 0 15px rgba(168,85,247,0.15)' }}>{txt.clientProgress}</h2>
              <p className="text-sm text-gray-400">{progressClient.name}</p>
            </div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-300">{txt.progress}</span>
                <span className="text-2xl font-bold text-purple-300 tabular-nums">{progressValue}%</span>
              </div>
              <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden mb-6">
                <motion.div className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-400 to-purple-300"
                  animate={{ width: `${progressValue}%` }} transition={{ duration: 0.3 }} />
              </div>
              <input type="range" min="0" max="100" value={progressValue} onChange={(e) => setProgressValue(Number(e.target.value))} className="w-full mb-6" />
              <div className="flex gap-3">
                <button onClick={() => { updateProgress(progressClient.id, progressValue); setProgressClient(null); }}
                  className="flex-1 py-3 rounded-xl bg-purple-500/15 border border-purple-400/25 text-purple-100 text-sm font-medium hover:bg-purple-500/25 transition-all">
                  {txt.save}
                </button>
                <button onClick={() => setProgressClient(null)}
                  className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 text-sm hover:bg-white/[0.06] hover:text-white transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </BorderGlow>
      </motion.div>
    );
  }

  if (selectedClient) {
    const typeMatch = selectedClient.notes.match(/\[COMMISSION TYPE\] (.+)/);
    const commissionType = typeMatch ? typeMatch[1] : null;
    const cleanNotes = selectedClient.notes.replace(/\n\n\[COMMISSION TYPE\].+/, '');
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={33}
          glowRadius={47}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
        >
          <GlassCard className="rounded-3xl p-6 md:p-10">
            <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6 px-2 py-1 rounded-lg hover:bg-white/5">
              <ChevronLeft className="w-4 h-4" /> {txt.backToList}
            </button>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white" style={{ textShadow: '0 0 15px rgba(168,85,247,0.15)' }}>{txt.clientDetails}</h2>
              <button onClick={() => deleteClient(selectedClient.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/8 border border-rose-500/12 text-rose-300 text-xs hover:bg-rose-500/15 transition-all">
                <Trash2 className="w-3 h-3" /> {txt.delete}
              </button>
            </div>
            <div className="space-y-5">
              <DetailRow label="Name / Username" value={selectedClient.name} />
              {commissionType && <DetailRow label="Commission Type" value={commissionType} />}
              <DetailRow label="Character References" value={selectedClient.reference_link} isLink />
              <DetailRow label="Pose / Outfit" value={selectedClient.pose_outfit} />
              <DetailRow label="Additional Notes" value={cleanNotes} />
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{txt.progress}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all duration-500" style={{ width: `${selectedClient.progress || 0}%` }} />
                  </div>
                  <span className="text-sm font-bold text-purple-300 tabular-nums">{selectedClient.progress || 0}%</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                {selectedClient.sfw && <span className="px-3 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/12 text-xs text-emerald-300 font-medium">SFW</span>}
                {selectedClient.nsfw && <span className="px-3 py-1 rounded-lg bg-rose-500/8 border border-rose-500/12 text-xs text-rose-300 font-medium">NSFW</span>}
              </div>
              <div className="pt-4 border-t border-white/[0.04]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => toggleChecked(selectedClient)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${selectedClient.checked ? 'bg-purple-500/20 border-purple-400' : 'border-white/12 hover:border-white/25'}`}>
                    {selectedClient.checked && <Check className="w-4 h-4 text-purple-300" />}
                  </div>
                  <span className="text-sm text-gray-300">{selectedClient.checked ? txt.checked : txt.markChecked}</span>
                </label>
              </div>
            </div>
          </GlassCard>
        </BorderGlow>
      </motion.div>
    );
  }

  const acceptedCount = commissions.filter(c => c.accepted).length;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
      <BorderGlow
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#120F17"
        borderRadius={33}
        glowRadius={47}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        colors={['#c084fc', '#f472b6', '#38bdf8']}
      >
        <GlassCard className="rounded-3xl p-6 md:p-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/12 flex items-center justify-center">
                <ShieldCheck className="w-[18px] h-[18px] text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white" style={{ textShadow: '0 0 15px rgba(168,85,247,0.15)' }}>{txt.adminPanel}</h2>
                <p className="text-sm text-gray-400">{txt.manageClients}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onRefresh}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">
                <RefreshCw className="w-3.5 h-3.5" /> {txt.refresh}
              </button>
              <button onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">
                {txt.logout}
              </button>
            </div>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-300 text-sm text-center">{txt.loadError}: {error}</div>}
          {lastUpdated && <p className="text-[10px] text-gray-600 mb-4 text-right">{txt.lastUpdated}: {lastUpdated.toLocaleTimeString()}</p>}

          <div className="flex gap-3 mb-6 flex-wrap">
            {[
              { key: 'clients' as const, label: 'Clients' },
              { key: 'slots' as const, label: `Slots (${acceptedCount}/${customSlots})` },
              { key: 'progress' as const, label: 'Progress' },
              { key: 'terms' as const, label: 'Terms' },
              { key: 'profile' as const, label: 'Profile' },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setAdminTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  adminTab === tab.key
                    ? 'bg-purple-500/12 border border-purple-400/25 text-purple-100'
                    : 'bg-white/[0.02] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.05] hover:border-white/12'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {adminTab === 'clients' && (
            <>
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" /></div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500"><Users className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-sm">No clients yet.</p></div>
              ) : (
                <div className="space-y-3">
                  {commissions.map((client, index) => (
                    <motion.div key={client.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${client.checked ? 'bg-emerald-500/[0.02] border-emerald-500/6' : 'bg-white/[0.02] border-white/[0.04] hover:border-white/8'}`}
                      onClick={() => setSelectedClient(client)}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border ${client.checked ? 'bg-emerald-500/12 text-emerald-300 border-emerald-400/12' : 'bg-gradient-to-br from-purple-500/12 to-violet-500/12 text-purple-300 border-purple-400/12'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${client.checked ? 'text-emerald-200/60 line-through' : 'text-white'}`}>{client.name}</p>
                        <p className="text-xs text-gray-500">{new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {client.sfw && <span className="px-2 py-0.5 rounded-md bg-emerald-500/8 border border-emerald-500/10 text-[10px] text-emerald-300">SFW</span>}
                        {client.nsfw && <span className="px-2 py-0.5 rounded-md bg-rose-500/8 border border-rose-500/10 text-[10px] text-rose-300">NSFW</span>}
                        <button onClick={(e) => { e.stopPropagation(); toggleChecked(client); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${client.checked ? 'bg-emerald-500/12 text-emerald-300' : 'bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-white'}`}>
                          {client.checked ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-white transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {adminTab === 'slots' && (
  <>
    <div className="mb-6 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <label className="block text-sm mb-3 text-purple-200">Commission Slot Setting</label>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={customSlots}
                  onChange={(e) => setCustomSlots(Number(e.target.value))}
                  className="px-4 py-3 rounded-xl bg-black/30 border border-white/10"
                />
                <button
                  onClick={async () => {
                    await apiFetch('/api/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ key: 'commission_slots', value: String(customSlots) })
                    });
                  }}
                  className="px-5 py-3 rounded-xl bg-purple-500/20 border border-purple-400/20">
                  Save Slots
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-purple-200">Accepted Clients ({acceptedCount}/{customSlots})</h3>
                <div className="flex-1 mx-4 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400" style={{ width: `${(acceptedCount / MAX_SLOTS) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-purple-300 tabular-nums">{Math.round((acceptedCount / MAX_SLOTS) * 100)}%</span>
              </div>
              {commissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><p className="text-sm">No clients yet.</p></div>
              ) : (
                <div className="space-y-2">
                  {commissions.map((client, index) => (
                    <div key={client.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-300 border border-purple-400/10">
                        {index + 1}
                      </div>
                      <p className="text-sm text-white flex-1 truncate">{client.name}</p>
                      <button onClick={() => toggleAccepted(client)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          client.accepted
                            ? 'bg-emerald-500/12 border border-emerald-400/25 text-emerald-200'
                            : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.06]'
                        }`}>
                        {client.accepted ? 'Accepted' : 'Accept'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
      </>
          )}

          {adminTab === 'progress' && (
            <>
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" /></div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500"><Users className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="text-sm">No clients yet.</p></div>
              ) : (
                <div className="space-y-4">
                  {commissions.map((client, index) => (
                    <div key={client.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/12 flex items-center justify-center text-xs font-bold text-purple-300 border border-purple-400/12">
                            {index + 1}
                          </div>
                          <p className="text-sm font-semibold text-white">{client.name}</p>
                        </div>
                        <button onClick={() => { setProgressClient(client); setProgressValue(client.progress || 0); }}
                          className="px-3 py-1.5 rounded-lg bg-purple-500/12 border border-purple-400/20 text-purple-200 text-xs hover:bg-purple-500/20 transition-all">
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all duration-500" style={{ width: `${client.progress || 0}%` }} />
                        </div>
                        <span className="text-sm font-bold text-purple-300 tabular-nums w-10 text-right">{client.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {adminTab === 'terms' && (
            <div className="space-y-6">
              {termsSaved && <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-300 text-sm text-center">{txt.saved}</div>}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-blue-200 flex items-center gap-2"><Globe className="w-4 h-4" /> {txt.termsEditorEn}</h3>
                <textarea value={editTermsEn} onChange={(e) => setEditTermsEn(e.target.value)} rows={12}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-blue-400/25 focus:bg-white/[0.04] transition-all backdrop-blur-sm resize-none font-mono leading-relaxed input-glow" />
                <button onClick={() => saveTerms('en')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/12 border border-blue-400/20 text-blue-200 text-sm hover:bg-blue-500/20 transition-all">
                  <Save className="w-4 h-4" /> {txt.save} (English)
                </button>
              </div>
              <div className="h-[1px] bg-white/[0.04]" />
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-2"><MapPin className="w-4 h-4" /> {txt.termsEditorId}</h3>
                <textarea value={editTermsId} onChange={(e) => setEditTermsId(e.target.value)} rows={12}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-emerald-400/25 focus:bg-white/[0.04] transition-all backdrop-blur-sm resize-none font-mono leading-relaxed input-glow" />
                <button onClick={() => saveTerms('id')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/12 border border-emerald-400/20 text-emerald-200 text-sm hover:bg-emerald-500/20 transition-all">
                  <Save className="w-4 h-4" /> {txt.save} (Indonesian)
                </button>
              </div>
            </div>
          )}

          {adminTab === 'profile' && (
            <div className="space-y-6">
              {photoSaved && <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-300 text-sm text-center">{txt.saved}</div>}
              <div className="flex flex-col items-center gap-5">
                <div className="w-24 h-24 rounded-full overflow-hidden border-[2px] border-purple-400/35 shadow-[0_0_30px_rgba(168,85,247,0.25)] bg-[#0a0a0f] flex items-center justify-center breathe-glow profile-pulse">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <User className="w-10 h-10 text-purple-400/50" />
                  )}
                </div>
                <div className="w-full space-y-3 max-w-md">
                  <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all cursor-pointer">
                    <Camera className="w-4 h-4" /> {txt.uploadPhoto}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <div className="flex gap-2">
                    <input type="text" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder={txt.photoUrl}
                      className="flex-1 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-400/25 input-glow" />
                    <button onClick={savePhoto}
                      className="px-4 py-2 rounded-xl bg-purple-500/12 border border-purple-400/20 text-purple-200 hover:bg-purple-500/20 transition-all">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-white/[0.04]" />

              {/* Lock Toggle */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-red-200">Region Locks</h3>
                {lockSaved && <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-300 text-sm text-center">{txt.saved}</div>}
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setLocalLockOn(!localLockOn)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      localLockOn ? 'bg-red-500/12 border border-red-400/25 text-red-200' : 'bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white'
                    }`}>
                    <Lock className="w-4 h-4" />
                    {txt.lockLocal}: {localLockOn ? txt.locked : txt.unlocked}
                  </button>
                  <button onClick={() => setIntlLockOn(!intlLockOn)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      intlLockOn ? 'bg-red-500/12 border border-red-400/25 text-red-200' : 'bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white'
                    }`}>
                    <Lock className="w-4 h-4" />
                    {txt.lockInternational}: {intlLockOn ? txt.locked : txt.unlocked}
                  </button>
                  <button onClick={saveLocks}
                    className="px-4 py-2 rounded-xl bg-purple-500/12 border border-purple-400/20 text-purple-200 text-sm hover:bg-purple-500/20 transition-all">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </BorderGlow>
    </motion.div>
  );
}

function DetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-300/80 hover:text-purple-200 break-all transition-colors">{value}</a>
      ) : (
        <p className="text-sm text-gray-200/80 whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}

export default App;
