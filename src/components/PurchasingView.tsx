import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Truck,
  Plus,
  Receipt,
  FileCheck,
  AlertTriangle,
  Building2,
  Calendar,
  X,
  CreditCard,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { GoodsReceiptLine } from '../types/pharmacy';

export const PurchasingView: React.FC = () => {
  const {
    suppliers,
    goodsReceipts,
    receiveGoods,
    paySupplier,
    products,
    activeBranchId,
    reorderMetrics,
    accounts
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'RECEIPTS' | 'SUPPLIERS' | 'REORDER_SUGGESTIONS'>('RECEIPTS');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedSupplierIdForPayment, setSelectedSupplierIdForPayment] = useState<string>('');
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [paymentAccountSelect, setPaymentAccountSelect] = useState<string>('acc-102');

  // New Goods Receipt form state
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState<string>('');
  const [receiptLines, setReceiptLines] = useState<GoodsReceiptLine[]>([]);
  const [selectedProdToAdd, setSelectedProdToAdd] = useState<string>(products[0]?.id || '');
  const [batchNoInput, setBatchNoInput] = useState<string>('');
  const [expiryDateInput, setExpiryDateInput] = useState<string>('2027-12-31');
  const [qtyBoxesInput, setQtyBoxesInput] = useState<number>(10);
  const [bonusBoxesInput, setBonusBoxesInput] = useState<number>(0);
  const [costPerBoxInput, setCostPerBoxInput] = useState<number>(20.0);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  // Add line to goods receipt
  const handleAddReceiptLine = () => {
    if (!batchNoInput || !expiryDateInput) {
      setReceiptError('يرجى إدخال رقم الدفعة وتاريخ الانتهاء');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (expiryDateInput <= today) {
      setReceiptError('INV-09: لا يمكن استلام بضاعة بتاريخ انتهاء منتهٍ أو في الماضي!');
      return;
    }

    const total = qtyBoxesInput * costPerBoxInput;
    const newLine: GoodsReceiptLine = {
      product_id: selectedProdToAdd,
      batch_no: batchNoInput,
      expiry_date: expiryDateInput,
      qty_boxes: qtyBoxesInput,
      bonus_boxes: bonusBoxesInput,
      cost_per_box: costPerBoxInput,
      total
    };

    setReceiptLines((prev) => [...prev, newLine]);
    setBatchNoInput('');
    setReceiptError(null);
  };

  const handleSaveReceipt = () => {
    if (receiptLines.length === 0) {
      setReceiptError('يجب إضافة صنف واحد على الأقل للاستلام');
      return;
    }
    const totalAmount = receiptLines.reduce((sum, l) => sum + l.total, 0);

    receiveGoods({
      supplier_id: selectedSupplierId,
      branch_id: activeBranchId,
      receipt_date: new Date().toISOString().split('T')[0],
      invoice_no: supplierInvoiceNo || `INV-SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      lines: receiptLines,
      total_amount: totalAmount,
      payment_status: 'UNPAID'
    });

    setShowReceiptModal(false);
    setReceiptLines([]);
    setSupplierInvoiceNo('');
    setReceiptError(null);
  };

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmountInput);
    if (!amt || amt <= 0) return;
    paySupplier(selectedSupplierIdForPayment, amt, paymentAccountSelect);
    setShowPayModal(false);
    setPaymentAmountInput('');
  };

  // Reorder urgent items
  const urgentReorderItems = reorderMetrics
    .filter((m) => m.cover_days <= 10 && m.suggested_order_boxes > 0)
    .sort((a, b) => a.cover_days - b.cover_days);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            <span>المشتريات والموردين وإدارة الدفعات الواردة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدخال فواتير الشراء واستلام الدفعات، مطابقة الأسعار، حساب ذمم الموردين، واقتراح أوامر الشراء الآلية.
          </p>
        </div>

        <button
          onClick={() => setShowReceiptModal(true)}
          className="flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>استلام بضاعة جديدة (سند إدخال)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#334155] mb-4 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('RECEIPTS')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'RECEIPTS'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          سجل فواتير الاستلام ({goodsReceipts.length})
        </button>

        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'SUPPLIERS'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          دليل الموردين وأعمار الديون ({suppliers.length})
        </button>

        <button
          onClick={() => setActiveTab('REORDER_SUGGESTIONS')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'REORDER_SUGGESTIONS'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>مقترحات إعادة الطلب (ROP)</span>
          {urgentReorderItems.length > 0 && (
            <span className="bg-red-500 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full">
              {urgentReorderItems.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Goods Receipts */}
      {activeTab === 'RECEIPTS' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">رقم سند الاستلام</th>
                  <th className="p-3">المورد</th>
                  <th className="p-3">تاريخ الاستلام</th>
                  <th className="p-3">رقم فاتورة المورد</th>
                  <th className="p-3">عدد الأصناف</th>
                  <th className="p-3">إجمالي الفاتورة</th>
                  <th className="p-3">حالة السداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {goodsReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      لا توجد فواتير استلام مسجلة حتى الآن. اضغط على زر "استلام بضاعة جديدة" لإضافة أول شحنة.
                    </td>
                  </tr>
                ) : (
                  goodsReceipts.map((gr) => {
                    const sup = suppliers.find((s) => s.id === gr.supplier_id);
                    return (
                      <tr key={gr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-mono font-bold text-[#F8FAFC]">
                          {gr.doc_no}
                        </td>
                        <td className="p-3 font-semibold text-[#F8FAFC]">
                          {sup?.name || 'مورد عام'}
                        </td>
                        <td className="p-3 font-mono text-[#94A3B8]">
                          {gr.receipt_date}
                        </td>
                        <td className="p-3 font-mono text-[#94A3B8]">
                          {gr.invoice_no}
                        </td>
                        <td className="p-3 font-mono">{gr.lines.length} صنف</td>
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {gr.total_amount.toFixed(2)} ر.س
                        </td>
                        <td className="p-3">
                          <span className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                            مستحقة للدفع
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers Ledger */}
      {activeTab === 'SUPPLIERS' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">اسم المورد</th>
                  <th className="p-3">مسؤول التواصل والهاتف</th>
                  <th className="p-3">فترة الائتمان</th>
                  <th className="p-3">سقف الائتمان</th>
                  <th className="p-3">الرصيد المستحق (نحن مدينون)</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-[#F8FAFC]">
                      {sup.name}
                    </td>
                    <td className="p-3 text-[#94A3B8]">
                      {sup.contact_person} · <span className="font-mono">{sup.phone}</span>
                    </td>
                    <td className="p-3 font-mono text-[#94A3B8]">
                      {sup.payment_terms_days} يوم
                    </td>
                    <td className="p-3 font-mono text-[#94A3B8]">
                      {sup.credit_limit.toLocaleString()} ر.س
                    </td>
                    <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">
                      {sup.balance.toLocaleString()} ر.س
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedSupplierIdForPayment(sup.id);
                          setPaymentAmountInput(sup.balance.toString());
                          setShowPayModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        سداد دفعة للمورد
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Auto Reorder Suggestions */}
      {activeTab === 'REORDER_SUGGESTIONS' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col p-4">
          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              نظام التنبؤ الذكي: يحسب معدل الاستهلاك اليومي (ADS) وأيام التغطية المتبقية. الأصناف أدناه تحتاج طلب توريد فورًا لتفادي نفادها.
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-2.5">الصنف</th>
                  <th className="p-2.5">تصنيف ABC</th>
                  <th className="p-2.5">الرصيد الحالي</th>
                  <th className="p-2.5">الاستهلاك اليومي (ADS)</th>
                  <th className="p-2.5">أيام التغطية المتبقية</th>
                  <th className="p-2.5">نقطة إعادة الطلب (ROP)</th>
                  <th className="p-2.5">الكمية المقترحة للطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {reorderMetrics.map((m) => {
                  const prod = products.find((p) => p.id === m.product_id);
                  const isCritical = m.cover_days <= (prod?.lead_time_days || 3);
                  return (
                    <tr key={m.product_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-bold text-[#F8FAFC]">
                        {prod?.trade_name}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.abc_class === 'A'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : m.abc_class === 'B'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          فئة {m.abc_class}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono">{m.current_stock_units} حبة</td>
                      <td className="p-2.5 font-mono">{m.ads} حبة/يوم</td>
                      <td className="p-2.5 font-mono font-bold">
                        <span className={isCritical ? 'text-red-600' : 'text-[#F8FAFC]'}>
                          {m.cover_days} يوم {isCritical && '⚠️ وشك النفاد'}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono">{m.rop_units} حبة</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {m.suggested_order_boxes} علبة
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Goods Receipt */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-3xl w-full p-6 shadow-2xl border border-[#334155] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <h3 className="font-bold text-base text-[#F8FAFC]">
                استلام بضاعة جديدة وإدخال دفعات المخزون
              </h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {receiptError && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                {receiptError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto my-3 space-y-4 text-xs">
              {/* Supplier & Invoice info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المورد</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">رقم فاتورة المورد</label>
                  <input
                    type="text"
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                    placeholder="INV-2026-991"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg font-mono outline-none"
                  />
                </div>
              </div>

              {/* Add item row form */}
              <div className="p-3 bg-[#0F172A] rounded-lg border border-[#334155] space-y-3">
                <span className="font-bold text-[#F8FAFC]">إضافة صنف للشحنة</span>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] mb-0.5">الصنف</label>
                    <select
                      value={selectedProdToAdd}
                      onChange={(e) => setSelectedProdToAdd(e.target.value)}
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.trade_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] mb-0.5 text-[#94A3B8]">رقم الدفعة (Batch No)</label>
                    <input
                      type="text"
                      value={batchNoInput}
                      onChange={(e) => setBatchNoInput(e.target.value)}
                      placeholder="BATCH-2026-X"
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md font-mono uppercase text-[#F8FAFC] focus:border-[#0EA5E9] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] mb-0.5 text-[#94A3B8]">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      value={expiryDateInput}
                      onChange={(e) => setExpiryDateInput(e.target.value)}
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md font-mono text-[#F8FAFC] focus:border-[#0EA5E9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-0.5 text-[#94A3B8]">الكمية المستلمة (علب)</label>
                    <input
                      type="number"
                      min="1"
                      value={qtyBoxesInput}
                      onChange={(e) => setQtyBoxesInput(parseInt(e.target.value) || 1)}
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md font-mono text-[#F8FAFC] focus:border-[#0EA5E9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-0.5 text-[#94A3B8]">البونص المجاني (علب)</label>
                    <input
                      type="number"
                      min="0"
                      value={bonusBoxesInput}
                      onChange={(e) => setBonusBoxesInput(parseInt(e.target.value) || 0)}
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md font-mono text-[#F8FAFC] focus:border-[#0EA5E9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-0.5 text-[#94A3B8]">سعر شراء العلبة (ر.س)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={costPerBoxInput}
                      onChange={(e) => setCostPerBoxInput(parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md font-mono text-[#F8FAFC] focus:border-[#0EA5E9] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddReceiptLine}
                  className="w-full py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-md font-semibold text-xs transition-colors shadow-xs"
                >
                  + إضافة الصنف لقائمة الاستلام
                </button>
              </div>

              {/* Items in receipt list */}
              {receiptLines.length > 0 && (
                <div className="border border-[#334155] rounded-lg overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#0F172A] border-b border-slate-200">
                      <tr>
                        <th className="p-2">الصنف</th>
                        <th className="p-2">الدفعة</th>
                        <th className="p-2">الانتهاء</th>
                        <th className="p-2">الكمية + بونص</th>
                        <th className="p-2">التكلفة</th>
                        <th className="p-2">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                      {receiptLines.map((l, i) => {
                        const p = products.find((pr) => pr.id === l.product_id);
                        return (
                          <tr key={i}>
                            <td className="p-2 font-medium">{p?.trade_name}</td>
                            <td className="p-2 font-mono">{l.batch_no}</td>
                            <td className="p-2 font-mono">{l.expiry_date}</td>
                            <td className="p-2 font-mono">
                              {l.qty_boxes} + {l.bonus_boxes} مجانًا
                            </td>
                            <td className="p-2 font-mono">{l.cost_per_box.toFixed(2)} ر.س</td>
                            <td className="p-2 font-mono font-bold">{l.total.toFixed(2)} ر.س</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#334155] flex items-center justify-between">
              <div className="font-bold text-sm">
                الإجمالي المستحق:{' '}
                <span className="font-mono text-emerald-600">
                  {receiptLines.reduce((sum, l) => sum + l.total, 0).toFixed(2)} ر.س
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 bg-[#0F172A] text-slate-600 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveReceipt}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  اعتماد الشحنة وتحديث المخزون
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Pay Supplier */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-md w-full p-6 shadow-2xl border border-[#334155]">
            <h3 className="font-bold text-base text-[#F8FAFC] mb-2">
              سداد دفعة نقدية / بنكية للمورد
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              المورد: {suppliers.find((s) => s.id === selectedSupplierIdForPayment)?.name}
            </p>

            <form onSubmit={handlePaySupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">المبلغ المراد سداده (ر.س)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">حساب السداد (الخصم من)</label>
                <select
                  value={paymentAccountSelect}
                  onChange={(e) => setPaymentAccountSelect(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                >
                  <option value="acc-102">البنك - الحساب الجاري (الأهلي)</option>
                  <option value="acc-101">الصندوق الرئيسي (نقدية بالصندوق)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-[#0F172A] text-slate-600 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  تأكيد وقيد السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
