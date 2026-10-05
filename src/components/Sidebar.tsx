import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  ArrowLeftRight,
  Users,
  Calculator,
  UserCheck,
  TrendingUp,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

export type TabId =
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'purchasing'
  | 'stockops'
  | 'customers'
  | 'accounting'
  | 'hr'
  | 'analytics'
  | 'settings'
  | 'devportal';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { batches, missedDemands, colorTheme } = usePharmacy();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Badges: near expiry count
  const nearExpiryCount = batches.filter((b) => b.status === 'NEAR_EXPIRY' || b.status === 'EXPIRED').length;
  const missedCount = missedDemands.length;

  const getActiveTabClass = () => {
    switch (colorTheme) {
      case 'teal': return 'bg-[#0D9488] text-white shadow-xs';
      case 'emerald': return 'bg-[#059669] text-white shadow-xs';
      case 'slate': return 'bg-[#475569] text-white shadow-xs';
      default: return 'bg-[#0EA5E9] text-white shadow-xs';
    }
  };

  const navItems: { id: TabId; label: string; icon: React.ReactNode; shortcut?: string; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pos', label: 'نقطة البيع (POS)', icon: <ShoppingBag className="w-4 h-4 text-[#0EA5E9]" />, shortcut: 'F2' },
    {
      id: 'inventory',
      label: 'المخزون وFEFO',
      icon: <Package className="w-4 h-4" />,
      badge: nearExpiryCount > 0 ? nearExpiryCount : undefined,
      badgeColor: 'bg-amber-950/80 text-amber-300 border border-amber-800'
    },
    { id: 'purchasing', label: 'المشتريات والموردين', icon: <Truck className="w-4 h-4" /> },
    { id: 'stockops', label: 'الجرد والتحويلات', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'customers', label: 'العملاء والديون', icon: <Users className="w-4 h-4" /> },
    { id: 'accounting', label: 'المحاسبة والأرباح', icon: <Calculator className="w-4 h-4" /> },
    { id: 'hr', label: 'الموظفون والرواتب', icon: <UserCheck className="w-4 h-4" /> },
    {
      id: 'analytics',
      label: 'تحليل ABC والطلب',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: missedCount > 0 ? missedCount : undefined,
      badgeColor: 'bg-rose-950/80 text-rose-300 border border-rose-800'
    },
    { id: 'settings', label: 'إعدادات النظام', icon: <Settings className="w-4 h-4" /> },
    { id: 'devportal', label: 'لوحة المطوّر (التراخيص)', icon: <ShieldCheck className="w-4 h-4 text-[#0EA5E9]" /> }
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-56'
      } bg-[#1E293B] border-r border-[#334155] flex flex-col justify-between shrink-0 select-none transition-all duration-200 z-20`}
    >
      <div className="p-2 space-y-2">
        {/* Toggle Collapse Button */}
        <div className="flex items-center justify-between px-2 py-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
              الوحدات
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] rounded hover:bg-[#0F172A] transition-colors"
            title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items (Single horizontal line, no word wraps) */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? getActiveTabClass()
                    : 'text-[#94A3B8] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-white' : 'text-[#94A3B8]'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1">
                    {item.shortcut && (
                      <kbd className="kbd-shortcut text-[9px] px-1 py-0.2">
                        {item.shortcut}
                      </kbd>
                    )}
                    {item.badge !== undefined && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tactile Keyboard Shortcuts Quick Bar */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#334155] text-[11px] text-[#94A3B8] space-y-1.5 bg-[#0F172A]/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            اختصارات سريعة
          </div>
          <div className="flex justify-between items-center">
            <span>البيع السريع:</span>
            <kbd className="kbd-shortcut text-[10px]">F2</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span>دليل المساعدة:</span>
            <kbd className="kbd-shortcut text-[10px]">F1</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span>إتمام الفاتورة:</span>
            <kbd className="kbd-shortcut text-[10px]">Enter</kbd>
          </div>
        </div>
      )}
    </aside>
  );
};
