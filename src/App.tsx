import React, { useState, useEffect } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { PurchasingView } from './components/PurchasingView';
import { StockOperationsView } from './components/StockOperationsView';
import { CustomersInsuranceView } from './components/CustomersInsuranceView';
import { AccountingView } from './components/AccountingView';
import { HRView } from './components/HRView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { DevPortalView } from './components/DevPortalView';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

const MainLayout: React.FC = () => {
  const { theme, lang, isShortcutsOpen, setIsShortcutsOpen, licenseValidationStatus } = usePharmacy();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isDevPortal, setIsDevPortal] = useState<boolean>(false);

  // Sync theme with html root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Global Keyboard shortcuts (F1: Help/Shortcuts, F2: POS, Esc: Close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setIsDevPortal(false);
        setActiveTab('pos');
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsShortcutsOpen]);

  return (
    <div
      className="min-h-screen flex flex-col font-sans select-none bg-[#0F172A] text-[#F8FAFC]"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Application Bar */}
      <Header
        onOpenPOS={() => {
          setIsDevPortal(false);
          setActiveTab('pos');
        }}
        isDevPortal={isDevPortal}
        setIsDevPortal={setIsDevPortal}
      />

      {/* Global License Enforcement Alert Banner (if mismatch or expired) */}
      {!licenseValidationStatus.isCompliant && (
        <div className="bg-rose-950/90 border-b border-rose-800 px-4 py-2 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-rose-400">تنبيه أمني لإنفاذ التراخيص:</span>
            <span className="truncate">{licenseValidationStatus.message}</span>
          </div>
          <button
            onClick={() => setIsDevPortal(true)}
            className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 border border-rose-700 text-white rounded text-[11px] font-semibold shrink-0"
          >
            فتح لوحة المطوّر
          </button>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {!isDevPortal && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              if (tab === 'devportal') {
                setIsDevPortal(true);
              } else {
                setIsDevPortal(false);
                setActiveTab(tab);
              }
            }}
          />
        )}

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {isDevPortal ? (
            <DevPortalView />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView onNavigate={(t) => setActiveTab(t)} />}
              {activeTab === 'pos' && <POSView />}
              {activeTab === 'inventory' && <InventoryView />}
              {activeTab === 'purchasing' && <PurchasingView />}
              {activeTab === 'stockops' && <StockOperationsView />}
              {activeTab === 'customers' && <CustomersInsuranceView />}
              {activeTab === 'accounting' && <AccountingView />}
              {activeTab === 'hr' && <HRView />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Global Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <PharmacyProvider>
      <MainLayout />
    </PharmacyProvider>
  );
}
