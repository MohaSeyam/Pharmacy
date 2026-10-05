import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Building2,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Moon,
  Sun,
  User,
  AlertTriangle,
  Code2,
  ShoppingBag,
  Keyboard,
  Pill,
  Heart,
  Cross,
  Shield,
  Palette,
  Check,
  Search,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Role } from '../types/pharmacy';

interface HeaderProps {
  onOpenPOS: () => void;
  isDevPortal: boolean;
  setIsDevPortal: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPOS, isDevPortal, setIsDevPortal }) => {
  const {
    activeBranch,
    activeBranchId,
    setActiveBranchId,
    branches,
    currentRole,
    setCurrentRole,
    theme,
    setTheme,
    colorTheme,
    setColorTheme,
    isOffline,
    setIsOffline,
    pendingSyncCount,
    triggerSync,
    isSyncing,
    currentLicense,
    isClockTampered,
    resetClockTamper,
    activeShift,
    pharmacyBranding,
    setIsShortcutsOpen,
    licenseValidationStatus
  } = usePharmacy();

  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  const roles: { value: Role; label: string }[] = [
    { value: 'OWNER', label: 'المالك (صلاحيات كاملة)' },
    { value: 'BRANCH_MANAGER', label: 'مدير فرع' },
    { value: 'PHARMACIST', label: 'د. صيدلي مسؤول' },
    { value: 'CASHIER', label: 'كاشير' },
    { value: 'STOREKEEPER', label: 'أمين مخزن' },
    { value: 'ACCOUNTANT', label: 'محاسب' }
  ];

  // Dynamic icon based on pharmacy branding
  const renderLogoIcon = () => {
    switch (pharmacyBranding.logo_icon) {
      case 'heart':
        return <Heart className="w-4 h-4 text-white" />;
      case 'cross':
        return <Cross className="w-4 h-4 text-white" />;
      case 'shield':
        return <Shield className="w-4 h-4 text-white" />;
      case 'building':
        return <Building2 className="w-4 h-4 text-white" />;
      default:
        return <Pill className="w-4 h-4 text-white" />;
    }
  };

  return (
    <header className="h-16 border-b border-[#334155] bg-[#1E293B] px-4 flex items-center justify-between select-none z-30 transition-colors gap-3">
      {/* COLUMN 1: [Logo] Brand & Branch Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center text-white shrink-0">
          {renderLogoIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm text-[#F8FAFC] tracking-tight truncate max-w-[200px]">
              {pharmacyBranding.name}
            </h1>
          </div>
          {/* Branch Switcher */}
          <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <Building2 className="w-3 h-3 text-[#94A3B8]" />
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              className="bg-transparent font-medium text-[#0EA5E9] hover:underline outline-none cursor-pointer text-[11px]"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#1E293B] text-[#F8FAFC]">
                  {b.name} {b.is_main ? '(الرئيسي)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* COLUMN 2: [شريط بحث شمول F2] Desktop Omnibox Search Bar */}
      <div className="hidden md:flex flex-1 max-w-xl mx-4">
        <div
          onClick={onOpenPOS}
          className="w-full flex items-center justify-between bg-[#0F172A] border border-[#334155] hover:border-[#0EA5E9] px-3 py-2 rounded-lg cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Search className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0EA5E9] transition-colors" />
            <span className="truncate">ابحث باسم الدواء، المادة الفعالة، أو امسح الباركود...</span>
          </div>
          <kbd className="kbd-shortcut text-[10px]">F2</kbd>
        </div>
      </div>

      {/* COLUMN 3: Status, License Badge, F1 Help, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* License Compliance Status Indicator */}
        <button
          onClick={() => setIsDevPortal(true)}
          title={licenseValidationStatus.message}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
            licenseValidationStatus.isCompliant
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
              : 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse'
          }`}
        >
          {licenseValidationStatus.isCompliant ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className="truncate max-w-[120px]">
            {licenseValidationStatus.isCompliant ? 'ترخيص موثّق' : 'تنبيه ترخيص'}
          </span>
        </button>

        {/* Shift status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0F172A] border border-[#334155] text-[11px] text-[#94A3B8]">
          <span className={`w-2 h-2 rounded-full ${activeShift ? 'bg-emerald-500' : 'bg-slate-500'}`} />
          <span>{activeShift ? 'الوردية: مفتوحة' : 'مغلقة'}</span>
        </div>

        {/* Offline / Sync Controller */}
        <div className="hidden xl:flex items-center gap-1 bg-[#0F172A] px-2 py-1 rounded-md border border-[#334155] text-xs">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#94A3B8]"
            title={isOffline ? 'اضغط للاتصال بالشبكة' : 'محاكاة وضع دون اتصال'}
          >
            <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span>{isOffline ? 'محلي' : 'متصل'}</span>
          </button>

          {pendingSyncCount > 0 && (
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1 bg-[#0EA5E9] text-white px-1.5 py-0.5 rounded text-[10px] font-mono mr-1"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingSyncCount}</span>
            </button>
          )}
        </div>

        {/* Clock Tamper Alert Warning */}
        {isClockTampered && (
          <div className="flex items-center gap-1 bg-rose-950 text-rose-300 border border-rose-800 px-2 py-1 rounded text-xs animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <button onClick={resetClockTamper} className="underline text-[10px] font-bold">
              إصلاح تلاعب الساعة
            </button>
          </div>
        )}

        {/* Keyboard Shortcuts Help Button (F1) */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0F172A] text-[#F8FAFC] hover:bg-[#334155] border border-[#334155] text-xs font-medium transition-colors"
          title="دليل اختصارات لوحة المفاتيح (F1)"
        >
          <Keyboard className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="hidden sm:inline">مساعدة</span>
          <kbd className="kbd-shortcut text-[10px]">F1</kbd>
        </button>

        {/* Toggle Developer Control Portal / Builder */}
        <button
          onClick={() => setIsDevPortal(!isDevPortal)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            isDevPortal
              ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]'
              : 'bg-[#0F172A] text-[#F8FAFC] border-[#334155] hover:bg-[#334155]'
          }`}
          title="برنامج المطوّر: إصدار نسخ الصيدليات وإدارة التراخيص"
        >
          <Code2 className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="hidden sm:inline">المطوّر والتراخيص</span>
        </button>

        {/* Quick Launch POS Button */}
        {!isDevPortal && (
          <button
            onClick={onOpenPOS}
            className="flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>نقطة البيع</span>
            <kbd className="kbd-shortcut bg-white/20 text-white border-white/20 text-[10px]">F2</kbd>
          </button>
        )}

        {/* Role simulator switcher */}
        <div className="hidden 2xl:flex items-center gap-1 bg-[#0F172A] px-2 py-1 rounded-md border border-[#334155] text-xs">
          <User className="w-3.5 h-3.5 text-[#94A3B8]" />
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as Role)}
            className="bg-transparent font-medium text-[#F8FAFC] outline-none text-[11px] cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value} className="bg-[#1E293B] text-[#F8FAFC]">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowPaletteMenu(!showPaletteMenu)}
            className="p-2 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#0F172A] transition-colors"
            title="تغيير لون التركيز الأساسي"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showPaletteMenu && (
            <div className="absolute top-full mt-2 left-0 sm:right-auto z-50 bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl p-2 w-48 text-xs space-y-1">
              <div className="text-[10px] font-semibold text-[#94A3B8] px-2 py-1">لون التمييز والتركيز</div>
              {[
                { id: 'blue', label: 'الأزرق المؤسسي (Sky)', color: 'bg-[#0EA5E9]' },
                { id: 'teal', label: 'الأخضر السريري (Teal)', color: 'bg-[#0D9488]' },
                { id: 'emerald', label: 'الزمردي الهادئ (Emerald)', color: 'bg-[#059669]' },
                { id: 'slate', label: 'الفحمي الهادئ (Slate)', color: 'bg-[#475569]' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setColorTheme(c.id as any);
                    setShowPaletteMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
                    colorTheme === c.id
                      ? 'bg-[#0F172A] text-white font-semibold'
                      : 'text-[#94A3B8] hover:bg-[#0F172A]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${c.color}`} />
                    <span>{c.label}</span>
                  </div>
                  {colorTheme === c.id && <Check className="w-3.5 h-3.5 text-[#0EA5E9]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
