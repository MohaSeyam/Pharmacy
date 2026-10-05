import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Package,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    reorderMetrics,
    products,
    batches,
    missedDemands,
    getProductStockBreakdown
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'ABC_ROP' | 'MISSED_DEMAND' | 'EXPIRY_ALERTS'>('ABC_ROP');

  // Expiry buckets calculation
  const today = new Date();
  const getDaysUntilExpiry = (expStr: string) => {
    const expDate = new Date(expStr);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const batchesWithDays = batches.map((b) => {
    const daysLeft = getDaysUntilExpiry(b.expiry_date);
    const prod = products.find((p) => p.id === b.product_id);
    return {
      ...b,
      daysLeft,
      productName: prod?.trade_name || 'صنف',
      barcode: prod?.barcode || ''
    };
  });

  const expiredBatches = batchesWithDays.filter((b) => b.daysLeft < 0);
  const nearExpiry30 = batchesWithDays.filter((b) => b.daysLeft >= 0 && b.daysLeft <= 30);
  const nearExpiry60 = batchesWithDays.filter((b) => b.daysLeft > 30 && b.daysLeft <= 60);
  const nearExpiry90 = batchesWithDays.filter((b) => b.daysLeft > 60 && b.daysLeft <= 90);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <span>تحليل الأكثر مبيعًا، تصنيف ABC، وضمان التوفر</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          حساب معدل الاستهلاك اليومي (ADS)، أيام التغطية، وتنبيهات وشك النفاد، وسجل الطلبات الضائعة.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#334155] mb-4 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ABC_ROP')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'ABC_ROP'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>تصنيف ABC ومعدل التغطية (ROP)</span>
        </button>

        <button
          onClick={() => setActiveTab('EXPIRY_ALERTS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'EXPIRY_ALERTS'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>رادار الصلاحية (30 / 60 / 90 يومًا)</span>
        </button>

        <button
          onClick={() => setActiveTab('MISSED_DEMAND')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'MISSED_DEMAND'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span>سجل الطلب الضائع ({missedDemands.length})</span>
        </button>
      </div>

      {/* TAB 1: ABC and ROP */}
      {activeTab === 'ABC_ROP' && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1E293B] p-4 rounded-lg border border-red-200 dark:border-red-900/60 shadow-xs">
              <span className="text-xs font-bold text-red-700 dark:text-red-400">
                الفئة A (الأعلى استهلاكًا 80%)
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                تُمثّل العمود الفقري لمبيعات الصيدلية ويتم مراقبتها يوميًا لمنع أي نفاد.
              </p>
              <div className="text-xl font-bold font-mono text-[#F8FAFC] mt-2">
                {reorderMetrics.filter((m) => m.abc_class === 'A').length} صنف أساسي
              </div>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-lg border border-blue-200 dark:border-blue-900/60 shadow-xs">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                الفئة B (استهلاك متوسط 15%)
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                حركة بيع منتظمة مع دورة توريد أسبوعية.
              </p>
              <div className="text-xl font-bold font-mono text-[#F8FAFC] mt-2">
                {reorderMetrics.filter((m) => m.abc_class === 'B').length} صنف
              </div>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
              <span className="text-xs font-bold text-[#F8FAFC]">
                الفئة C (حركة منخفضة 5%)
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                أدوية تخصصية تُطلب دوريًا بكميات محدودة لتقليل رأس المال الراكد.
              </p>
              <div className="text-xl font-bold font-mono text-[#F8FAFC] mt-2">
                {reorderMetrics.filter((m) => m.abc_class === 'C').length} صنف
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">الصنف الدوائي</th>
                    <th className="p-3">تصنيف ABC</th>
                    <th className="p-3">معدل البيع اليومي (ADS)</th>
                    <th className="p-3">الرصيد المتاح</th>
                    <th className="p-3">أيام التغطية المتبقية</th>
                    <th className="p-3">نقطة إعادة الطلب (ROP)</th>
                    <th className="p-3">الكمية المقترحة للطلب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {reorderMetrics.map((m) => {
                    const prod = products.find((p) => p.id === m.product_id);
                    const isUnderRop = m.current_stock_units <= m.rop_units;
                    return (
                      <tr key={m.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-[#F8FAFC]">
                          {prod?.trade_name}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.abc_class === 'A'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : m.abc_class === 'B'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Class {m.abc_class}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{m.ads} حبة/يوم</td>
                        <td className="p-3 font-mono font-bold text-[#F8FAFC]">
                          {getProductStockBreakdown(m.product_id).displayString}
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <span className={m.cover_days <= 10 ? 'text-red-600' : 'text-[#F8FAFC]'}>
                            {m.cover_days} يوم {m.cover_days <= 10 && '⚠️'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#94A3B8]">
                          {m.rop_units} حبة
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {m.suggested_order_boxes} علبة
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Expiry Radar */}
      {activeTab === 'EXPIRY_ALERTS' && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-lg border border-red-200 dark:border-red-900/60 shadow-xs">
              <span className="text-xs font-bold text-red-700 dark:text-red-300">منتهي الصلاحية</span>
              <div className="text-2xl font-bold font-mono text-red-700 dark:text-red-300 mt-1">
                {expiredBatches.length} دفعات
              </div>
              <span className="text-[11px] text-red-600 font-semibold">محظور بيعه وفق INV-05</span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-lg border border-amber-200 dark:border-amber-900/60 shadow-xs">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">خلال 30 يومًا</span>
              <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300 mt-1">
                {nearExpiry30.length} دفعات
              </div>
              <span className="text-[11px] text-amber-600">أولوية صرف قصوى / إرجاع للمورد</span>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/40 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/60 shadow-xs">
              <span className="text-xs font-bold text-yellow-800 dark:text-yellow-300">خلال 60 يومًا</span>
              <div className="text-2xl font-bold font-mono text-yellow-800 dark:text-yellow-300 mt-1">
                {nearExpiry60.length} دفعات
              </div>
              <span className="text-[11px] text-yellow-700">مراقبة دورية</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-200 dark:border-blue-900/60 shadow-xs">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">خلال 90 يومًا</span>
              <div className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-300 mt-1">
                {nearExpiry90.length} دفعات
              </div>
              <span className="text-[11px] text-blue-600">حالة مستقرة</span>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden">
            <div className="p-3 border-b border-[#334155] font-bold text-xs">
              كشف تفصيلي بالدفعات المنتهية وقريبة الانتهاء
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">الصنف الدوائي</th>
                    <th className="p-3">رقم الدفعة</th>
                    <th className="p-3">تاريخ الانتهاء</th>
                    <th className="p-3">الأيام المتبقية</th>
                    <th className="p-3">الحالة والإجراء المقترح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {[...expiredBatches, ...nearExpiry30, ...nearExpiry60].map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-[#F8FAFC]">{b.productName}</td>
                      <td className="p-3 font-mono">{b.batch_no}</td>
                      <td className="p-3 font-mono font-bold text-[#F8FAFC]">
                        {b.expiry_date}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <span className={b.daysLeft < 0 ? 'text-red-600' : 'text-amber-600'}>
                          {b.daysLeft < 0 ? `منتهي منذ ${Math.abs(b.daysLeft)} يوم` : `متبقي ${b.daysLeft} يوم`}
                        </span>
                      </td>
                      <td className="p-3">
                        {b.daysLeft < 0 ? (
                          <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                            عزل فوري وإصدار محضر إتلاف
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                            صرف سريع عبر FEFO أو إرجاع للمورد
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Missed Demand */}
      {activeTab === 'MISSED_DEMAND' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col p-4">
          <div className="mb-3 text-xs text-slate-500">
            يسجل الكاشير أي صنف طلبه العميل ولم يتوفر بالصيدلية لقياس الطلب الضائع وتوجيه أوامر الشراء المستقبلية بدقة.
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">الصنف المطلوب</th>
                  <th className="p-3">الكمية المطلوبة</th>
                  <th className="p-3">وقت وتاريخ الطلب</th>
                  <th className="p-3">ملاحظات الكاشير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {missedDemands.map((md) => (
                  <tr key={md.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-[#F8FAFC]">{md.product_name}</td>
                    <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">
                      {md.requested_qty} عبوة
                    </td>
                    <td className="p-3 font-mono text-slate-500">{md.timestamp}</td>
                    <td className="p-3 text-[#94A3B8]">{md.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
