import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  ArrowLeftRight,
  ClipboardList,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package,
  X
} from 'lucide-react';

export const StockOperationsView: React.FC = () => {
  const {
    products,
    batches,
    stockLevels,
    activeBranchId,
    branches,
    settleStocktake,
    writeOffBatch,
    transferStockBetweenBranches,
    getProductStockUnits
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'STOCKTAKE' | 'WRITEOFF' | 'TRANSFER'>('STOCKTAKE');

  // Stocktake state
  const [stocktakeCounts, setStocktakeCounts] = useState<{ [batchId: string]: number }>({});
  const [stocktakeSuccessMessage, setStocktakeSuccessMessage] = useState<string | null>(null);

  // Write-off state
  const [selectedWriteoffBatchId, setSelectedWriteoffBatchId] = useState<string>(
    batches.find((b) => b.status === 'EXPIRED')?.id || batches[0]?.id || ''
  );
  const [writeoffQtyInput, setWriteoffQtyInput] = useState<number>(10);
  const [writeoffReason, setWriteoffReason] = useState<'EXPIRED' | 'DAMAGED' | 'SPOILED'>('EXPIRED');
  const [writeoffSuccessMessage, setWriteoffSuccessMessage] = useState<string | null>(null);

  // Transfer state
  const [transferTargetBranch, setTransferTargetBranch] = useState<string>('br-2');
  const [transferBatchId, setTransferBatchId] = useState<string>(batches[0]?.id || '');
  const [transferQtyInput, setTransferQtyInput] = useState<number>(24);
  const [transferSuccessMessage, setTransferSuccessMessage] = useState<string | null>(null);

  // Active branch batches
  const branchBatches = batches.map((b) => {
    const sl = stockLevels.find((s) => s.batch_id === b.id && s.branch_id === activeBranchId);
    const prod = products.find((p) => p.id === b.product_id);
    return {
      ...b,
      currentUnits: sl ? sl.qty_units : 0,
      productName: prod?.trade_name || 'صنف',
      unitCost: (b.cost_per_box || 10) / (prod?.packing.units_per_box || 1)
    };
  });

  // Handle stocktake count change
  const handleCountChange = (batchId: string, val: string) => {
    const num = parseInt(val);
    setStocktakeCounts((prev) => ({ ...prev, [batchId]: isNaN(num) ? 0 : num }));
  };

  const handleApplyStocktake = () => {
    const adjustments: {
      batch_id: string;
      product_id: string;
      diff_units: number;
      cost_per_unit: number;
      reason: string;
    }[] = [];

    branchBatches.forEach((b) => {
      const counted = stocktakeCounts[b.id];
      if (counted !== undefined && counted !== b.currentUnits) {
        adjustments.push({
          batch_id: b.id,
          product_id: b.product_id,
          diff_units: counted - b.currentUnits,
          cost_per_unit: b.unitCost,
          reason: 'تسوية جرد دوري معتمد للمستودع'
        });
      }
    });

    if (adjustments.length === 0) {
      alert('لم يتم تعديل أي عدّ فعلي للجرد');
      return;
    }

    settleStocktake(adjustments);
    setStocktakeSuccessMessage(`تم اعتماد تسوية الجرد لـ ${adjustments.length} صنف بنجاح وتحديث القيود المالية.`);
    setStocktakeCounts({});
    setTimeout(() => setStocktakeSuccessMessage(null), 4000);
  };

  const handleExecuteWriteoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWriteoffBatchId || writeoffQtyInput <= 0) return;
    writeOffBatch(selectedWriteoffBatchId, writeoffQtyInput, writeoffReason);
    setWriteoffSuccessMessage(`تم تسجيل محضر الإتلاف وإثبات خسائر الإتلاف المحاسبية بنجاح.`);
    setTimeout(() => setWriteoffSuccessMessage(null), 4000);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find((b) => b.id === transferBatchId);
    if (!batch || transferQtyInput <= 0) return;

    transferStockBetweenBranches(activeBranchId, transferTargetBranch, transferBatchId, batch.product_id, transferQtyInput);
    setTransferSuccessMessage(`تم تحويل ${transferQtyInput} حبة إلى الفرع بنجاح.`);
    setTimeout(() => setTransferSuccessMessage(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-emerald-600" />
          <span>العمليات المخزنية: الجرد، الإتلاف، والتحويل بين الفروع</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          إجراءات الجرد الدوري والتسوية، محاضر إتلاف الأدوية المنتهية والتالفة، ومناقلة المخزون بين الصيدليات.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#334155] mb-4 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('STOCKTAKE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'STOCKTAKE'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>الجرد الدوري والتسوية (Stocktake)</span>
        </button>

        <button
          onClick={() => setActiveTab('WRITEOFF')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'WRITEOFF'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4 text-red-500" />
          <span>محضر إتلاف منتهي / تالف (Write-off)</span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSFER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'TRANSFER'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-500" />
          <span>التحويل بين الفروع (Branch Transfer)</span>
        </button>
      </div>

      {/* TAB 1: Stocktake */}
      {activeTab === 'STOCKTAKE' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col p-4">
          {stocktakeSuccessMessage && (
            <div className="mb-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{stocktakeSuccessMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">
              أدخل الكمية الفعلية المعدودة في الرف لكل دفعة لحساب الفروقات وتوليد قيد التسوية المحاسبي.
            </span>
            <button
              onClick={handleApplyStocktake}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              اعتماد وترحيل تسوية الجرد
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-2.5">الصنف الدوائي</th>
                  <th className="p-2.5">رقم الدفعة</th>
                  <th className="p-2.5">تاريخ الانتهاء</th>
                  <th className="p-2.5">الرصيد بالنظام (حبات)</th>
                  <th className="p-2.5">العدّ الفعلي (الجرد)</th>
                  <th className="p-2.5">الفرق (عجز / فائض)</th>
                  <th className="p-2.5">الأثر المالي (ر.س)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {branchBatches.map((b) => {
                  const counted = stocktakeCounts[b.id] !== undefined ? stocktakeCounts[b.id] : b.currentUnits;
                  const diff = counted - b.currentUnits;
                  const financialImpact = diff * b.unitCost;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-bold text-[#F8FAFC]">{b.productName}</td>
                      <td className="p-2.5 font-mono">{b.batch_no}</td>
                      <td className="p-2.5 font-mono">{b.expiry_date}</td>
                      <td className="p-2.5 font-mono font-bold text-[#F8FAFC]">{b.currentUnits}</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={counted}
                          onChange={(e) => handleCountChange(b.id, e.target.value)}
                          className="w-24 p-1.5 bg-[#0F172A] border border-[#334155] rounded font-mono text-xs outline-none"
                        />
                      </td>
                      <td className="p-2.5 font-mono font-bold">
                        <span className={diff < 0 ? 'text-red-600' : diff > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono">
                        <span className={financialImpact < 0 ? 'text-red-600' : financialImpact > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                          {financialImpact.toFixed(2)} ر.س
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Damage & Expiry Write-Off */}
      {activeTab === 'WRITEOFF' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs p-6 flex flex-col max-w-xl">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <Flame className="w-5 h-5" />
            <h3 className="font-bold text-base">إصدار محضر إتلاف أدوية رسمي</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            يتم خصم الكميات التالفة من رصيد الدفعة، وإثبات خسائر الإتلاف بقيد محاسبي مدين لحساب (خسائر إتلاف الأدوية 604).
          </p>

          {writeoffSuccessMessage && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{writeoffSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleExecuteWriteoff} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">الدفعة المراد إتلافها</label>
              <select
                value={selectedWriteoffBatchId}
                onChange={(e) => setSelectedWriteoffBatchId(e.target.value)}
                className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
              >
                {branchBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.productName} · دفعة {b.batch_no} (انتهاء: {b.expiry_date}) [رصيد: {b.currentUnits} حبة]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">سبب الإتلاف</label>
              <select
                value={writeoffReason}
                onChange={(e) => setWriteoffReason(e.target.value as any)}
                className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
              >
                <option value="EXPIRED">انتهاء فترة الصلاحية الدوائية (Expired)</option>
                <option value="DAMAGED">تلف فيزيائي / كسر في العبوة (Physical Damage)</option>
                <option value="SPOILED">انقطاع تبريد / فساد حراري (Cold Chain Break)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">الكمية المراد إتلافها (بالحبة)</label>
              <input
                type="number"
                min="1"
                required
                value={writeoffQtyInput}
                onChange={(e) => setWriteoffQtyInput(parseInt(e.target.value) || 1)}
                className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg font-mono outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              اعتماد محضر الإتلاف وخصم المخزون
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Inter-Branch Stock Transfer */}
      {activeTab === 'TRANSFER' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs p-6 flex flex-col max-w-xl">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Building2 className="w-5 h-5" />
            <h3 className="font-bold text-base">تحويل ومناقلة مخزون بين الفروع</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            خصم الكمية من الفرع الحالي ({branches.find((b) => b.id === activeBranchId)?.name}) وإضافتها مباشرة لفرع المستلم.
          </p>

          {transferSuccessMessage && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{transferSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">الفرع المستلم</label>
              <select
                value={transferTargetBranch}
                onChange={(e) => setTransferTargetBranch(e.target.value)}
                className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
              >
                {branches
                  .filter((b) => b.id !== activeBranchId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">الدفعة المراد تحويلها</label>
              <select
                value={transferBatchId}
                onChange={(e) => setTransferBatchId(e.target.value)}
                className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
              >
                {branchBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.productName} · دفعة {b.batch_no} [رصيد الفرع: {b.currentUnits} حبة]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">الكمية المحولة (بالحبة)</label>
              <input
                type="number"
                min="1"
                required
                value={transferQtyInput}
                onChange={(e) => setTransferQtyInput(parseInt(e.target.value) || 1)}
                className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg font-mono outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              تنفيذ التحويل الفوري بين الفروع
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
