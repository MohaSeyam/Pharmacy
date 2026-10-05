import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Activity,
  Calendar,
  Layers,
  FileText,
  Flame,
  Bell,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { TabId } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: TabId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    sales,
    activeShift,
    batches,
    products,
    customers,
    reorderMetrics,
    currentLicense,
    currentDeviceHwid,
    calculateProfitMetrics,
    pharmacyBranding,
    dismissedExpiryBatchIds,
    dismissExpiryAlert
  } = usePharmacy();

  const [isAlertsExpanded, setIsAlertsExpanded] = useState(true);
  const [selectedAlertFilter, setSelectedAlertFilter] = useState<'ALL' | 'EXPIRED' | 'CRITICAL_30' | 'WARNING_60'>('ALL');

  const profit = calculateProfitMetrics();

  // Metrics
  const todaySalesCount = sales.length;
  const todaySalesTotal = sales.reduce((sum, s) => sum + s.total, 0);

  // Expiry notification calculations
  const today = new Date();
  const getDaysUntilExpiry = (expStr: string) => {
    const expDate = new Date(expStr);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const activeBatchesWithDays = batches
    .filter((b) => !dismissedExpiryBatchIds.includes(b.id))
    .map((b) => {
      const daysLeft = getDaysUntilExpiry(b.expiry_date);
      const prod = products.find((p) => p.id === b.product_id);
      return {
        ...b,
        daysLeft,
        productName: prod?.trade_name || 'صنف دوائي',
        shelfLocation: prod?.shelf_location || 'رف عام'
      };
    })
    .filter((b) => b.daysLeft <= 60)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const expiredCount = activeBatchesWithDays.filter((b) => b.daysLeft < 0).length;
  const critical30Count = activeBatchesWithDays.filter((b) => b.daysLeft >= 0 && b.daysLeft <= 30).length;
  const warning60Count = activeBatchesWithDays.filter((b) => b.daysLeft > 30 && b.daysLeft <= 60).length;

  const filteredAlertBatches = activeBatchesWithDays.filter((b) => {
    if (selectedAlertFilter === 'EXPIRED') return b.daysLeft < 0;
    if (selectedAlertFilter === 'CRITICAL_30') return b.daysLeft >= 0 && b.daysLeft <= 30;
    if (selectedAlertFilter === 'WARNING_60') return b.daysLeft > 30 && b.daysLeft <= 60;
    return true;
  });

  // Critical stock items under ROP
  const criticalStockItems = reorderMetrics
    .filter((m) => m.cover_days <= 10)
    .slice(0, 5);

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#0F172A] text-[#F8FAFC] space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E293B] p-5 rounded-lg border border-[#334155]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#F8FAFC]">
              لوحة التحكم والمؤشرات اليومية
            </h2>
            <span className="text-xs bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-800">
              النظام متصل وآمن
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            صيدلية: <span className="font-semibold text-[#F8FAFC]">{pharmacyBranding.name}</span> · ترخيص سارٍ حتى {currentLicense.expires_at}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 py-2 rounded-md text-xs font-bold shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>شاشة البيع السريع</span>
            <kbd className="kbd-shortcut bg-white/20 text-white border-white/20 text-[10px]">F2</kbd>
          </button>
        </div>
      </div>

      {/* NOTIFICATION SYSTEM: Proactive Expiry Safety Center */}
      {activeBatchesWithDays.length > 0 && (
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 bg-[#0F172A] flex items-center justify-between border-b border-[#334155]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-[#F8FAFC]">
                    نظام الإنذار المبكر لصلاحية الأدوية (Inventory Expiry Alerts)
                  </h3>
                  <span className="bg-rose-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {activeBatchesWithDays.length} تنبيهات
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  أصناف قاربت أو انتهت صلاحيتها وتحتاج تدخلاً فوريًا لحماية سلامة المرضى وتفادي الخسائر.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter tabs */}
              <div className="hidden md:flex items-center gap-1 bg-[#1E293B] p-1 rounded-md border border-[#334155] text-xs">
                <button
                  onClick={() => setSelectedAlertFilter('ALL')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    selectedAlertFilter === 'ALL'
                      ? 'bg-[#0EA5E9] text-white'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  الكل ({activeBatchesWithDays.length})
                </button>
                {expiredCount > 0 && (
                  <button
                    onClick={() => setSelectedAlertFilter('EXPIRED')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      selectedAlertFilter === 'EXPIRED'
                        ? 'bg-rose-600 text-white'
                        : 'text-rose-400 hover:bg-rose-950/40'
                    }`}
                  >
                    منتهي ({expiredCount})
                  </button>
                )}
                {critical30Count > 0 && (
                  <button
                    onClick={() => setSelectedAlertFilter('CRITICAL_30')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      selectedAlertFilter === 'CRITICAL_30'
                        ? 'bg-amber-600 text-white'
                        : 'text-amber-400 hover:bg-amber-950/40'
                    }`}
                  >
                    خلال شهر ({critical30Count})
                  </button>
                )}
                {warning60Count > 0 && (
                  <button
                    onClick={() => setSelectedAlertFilter('WARNING_60')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      selectedAlertFilter === 'WARNING_60'
                        ? 'bg-slate-700 text-white'
                        : 'text-[#94A3B8] hover:bg-[#0F172A]'
                    }`}
                  >
                    خلال 60 يومًا ({warning60Count})
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
                className="p-1.5 rounded-md text-[#94A3B8] hover:bg-[#0F172A]"
              >
                {isAlertsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expandable Alert Items List */}
          {isAlertsExpanded && (
            <div className="p-4 divide-y divide-[#334155] max-h-72 overflow-y-auto">
              {filteredAlertBatches.map((b) => {
                const isExpired = b.daysLeft < 0;
                return (
                  <div
                    key={b.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isExpired
                            ? 'bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400'
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                        }`}
                      >
                        {isExpired ? <Flame className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#F8FAFC]">
                            {b.productName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isExpired
                                ? 'bg-red-600 text-white'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                            }`}
                          >
                            {isExpired ? `منتهي منذ ${Math.abs(b.daysLeft)} يومًا` : `متبقي ${b.daysLeft} يومًا فقط`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          رقم الدفعة: {b.batch_no} · تاريخ الانتهاء: {b.expiry_date} · موقع التخزين: {b.shelfLocation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {isExpired ? (
                        <button
                          onClick={() => onNavigate('stockops')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-[11px] shadow-xs flex items-center gap-1"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>إصدار محضر إتلاف فوري</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('pos')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[11px] shadow-xs flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>صرف أولوية (FEFO)</span>
                        </button>
                      )}

                      <button
                        onClick={() => dismissExpiryAlert(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        title="تجاهل التنبيه مؤقتًا"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Today */}
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#94A3B8] font-medium">مبيعات اليوم</span>
            <div className="p-2 rounded-md bg-[#0F172A] border border-[#334155] text-[#0EA5E9]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-[#F8FAFC] mt-2">
            {todaySalesTotal.toFixed(2)} {pharmacyBranding.currency}
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
            الفواتير: <span className="font-mono font-bold text-[#F8FAFC]">{todaySalesCount}</span>
          </span>
        </div>

        {/* Real Gross Profit */}
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#94A3B8] font-medium">مجمل الربح التجاري</span>
            <div className="p-2 rounded-md bg-[#0F172A] border border-[#334155] text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
            {profit.grossProfit.toLocaleString()} {pharmacyBranding.currency}
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
            هامش ربح: <span className="font-mono font-semibold text-[#F8FAFC]">{profit.profitMarginPct.toFixed(1)}%</span>
          </span>
        </div>

        {/* Cash in Drawer */}
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#94A3B8] font-medium">النقدية بالدرج</span>
            <div className="p-2 rounded-md bg-[#0F172A] border border-[#334155] text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-[#F8FAFC] mt-2">
            {activeShift ? (activeShift.opening_cash + activeShift.cash_sales).toFixed(2) : '0.00'} {pharmacyBranding.currency}
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
            الوردية: {activeShift ? 'مفتوحة' : 'مغلقة'}
          </span>
        </div>

        {/* Customer Receivables */}
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#94A3B8] font-medium">ذمم العملاء (الآجل)</span>
            <div className="p-2 rounded-md bg-[#0F172A] border border-[#334155] text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-2">
            {customers.reduce((sum, c) => sum + c.current_balance, 0).toLocaleString()} {pharmacyBranding.currency}
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
            {customers.filter((c) => c.current_balance > 0).length} عملاء
          </span>
        </div>
      </div>

      {/* Stock Shortage and Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Critical Stock Items under ROP */}
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs text-[#F8FAFC]">
                  أصناف على وشك النفاد (نقطة إعادة الطلب ROP)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('purchasing')}
                className="text-[11px] text-[#0EA5E9] hover:underline font-semibold"
              >
                إنشاء أمر شراء
              </button>
            </div>

            <div className="divide-y divide-[#334155] my-2">
              {criticalStockItems.map((m) => {
                const prod = products.find((p) => p.id === m.product_id);
                return (
                  <div key={m.product_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#F8FAFC]">
                        {prod?.trade_name}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">
                        معدل الاستهلاك: {m.ads} حبة/يوم · الرصيد: {m.current_stock_units} حبة
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <div className="font-bold text-rose-400">
                        {m.cover_days} أيام تغطية
                      </div>
                      <span className="text-[10px] text-[#0EA5E9] font-semibold">
                        مقترح الطلب: {m.suggested_order_boxes} علبة
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#334155]">
            <button
              onClick={() => onNavigate('purchasing')}
              className="w-full py-2 bg-[#0F172A] hover:bg-[#334155] text-[#0EA5E9] text-xs font-semibold rounded-md text-center border border-[#334155] transition-colors"
            >
              استعراض مقترحات التوريد الآلية
            </button>
          </div>
        </div>

        {/* Quick Operations Portal */}
        <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0EA5E9]" />
                <h3 className="font-bold text-xs text-[#F8FAFC]">
                  العمليات والمهام السريعة
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <button
                onClick={() => onNavigate('pos')}
                className="p-3 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] rounded-md text-right transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-[#0EA5E9] mb-1" />
                <span className="font-bold text-xs block text-[#F8FAFC]">نقطة البيع (POS)</span>
                <span className="text-[10px] text-[#94A3B8]">صرف أدوية ومسح باركود [F2]</span>
              </button>

              <button
                onClick={() => onNavigate('purchasing')}
                className="p-3 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] rounded-md text-right transition-colors"
              >
                <Package className="w-5 h-5 text-[#0EA5E9] mb-1" />
                <span className="font-bold text-xs block text-[#F8FAFC]">استلام شحنة بضاعة</span>
                <span className="text-[10px] text-[#94A3B8]">إدخال دفعات شراء جديدة</span>
              </button>

              <button
                onClick={() => onNavigate('stockops')}
                className="p-3 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] rounded-md text-right transition-colors"
              >
                <Layers className="w-5 h-5 text-purple-400 mb-1" />
                <span className="font-bold text-xs block text-[#F8FAFC]">الجرد والتسوية</span>
                <span className="text-[10px] text-[#94A3B8]">مطابقة الفعلي بالنظام</span>
              </button>

              <button
                onClick={() => onNavigate('stockops')}
                className="p-3 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] rounded-md text-right transition-colors"
              >
                <Flame className="w-5 h-5 text-rose-400 mb-1" />
                <span className="font-bold text-xs block text-[#F8FAFC]">محضر إتلاف رسمي</span>
                <span className="text-[10px] text-[#94A3B8]">عزل الدفعات المنتهية</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#334155] flex justify-between items-center text-xs text-[#94A3B8]">
            <span>النسخة الحالية: PharmaSys Windows v2.4 (Enterprise Desktop)</span>
            <span className="font-mono">قاعدة بيانات محلية مشفرة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
