import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Users,
  HeartPulse,
  CreditCard,
  Plus,
  Phone,
  Calendar,
  MessageCircle,
  FileCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { Customer } from '../types/pharmacy';

export const CustomersInsuranceView: React.FC = () => {
  const {
    customers,
    products,
    addCustomer,
    payCustomerDebt,
    pharmacyBranding
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'CHRONIC'>('CUSTOMERS');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showPayDebtModal, setShowPayDebtModal] = useState(false);
  const [selectedCustomerIdForPayment, setSelectedCustomerIdForPayment] = useState<string>('');
  const [debtPaymentAmount, setDebtPaymentAmount] = useState<string>('');

  // New Customer state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustNationalId, setNewCustNationalId] = useState('');
  const [newCustCreditLimit, setNewCustCreditLimit] = useState(1000);
  const [newCustChronicDiseases, setNewCustChronicDiseases] = useState('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    addCustomer({
      name: newCustName,
      phone: newCustPhone,
      national_id: newCustNationalId || undefined,
      credit_limit: newCustCreditLimit,
      chronic_diseases: newCustChronicDiseases ? newCustChronicDiseases.split('،').map((s) => s.trim()) : [],
      chronic_meds: []
    });

    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustNationalId('');
    setNewCustChronicDiseases('');
  };

  const handlePayDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(debtPaymentAmount);
    if (!amt || amt <= 0) return;
    payCustomerDebt(selectedCustomerIdForPayment, amt);
    setShowPayDebtModal(false);
    setDebtPaymentAmount('');
  };

  // Chronic patients list
  const chronicCustomers = customers.filter((c) => c.chronic_meds && c.chronic_meds.length > 0);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0EA5E9]" />
            <span>إدارة العملاء، الديون الآجلة، والأمراض المزمنة</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            ملفات الزبائن الدائمين، متابعة مديونيات البيع الآجل وسقوف الائتمان، وتذكير تجديد أدوية الأمراض المزمنة.
          </p>
        </div>

        <button
          onClick={() => setShowAddCustomerModal(true)}
          className="flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 py-2 rounded-md text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة ملف عميل جديد</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#334155] mb-4 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'CUSTOMERS'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
          }`}
        >
          دليل العملاء والذمم الآجلة ({customers.length})
        </button>

        <button
          onClick={() => setActiveTab('CHRONIC')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'CHRONIC'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-rose-400" />
          <span>متابعة أدوية الأمراض المزمنة ({chronicCustomers.length})</span>
        </button>
      </div>

      {/* TAB 1: Customers & Credit */}
      {activeTab === 'CUSTOMERS' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">اسم العميل</th>
                  <th className="p-3">رقم الجوال والهوية</th>
                  <th className="p-3">الأمراض المزمنة</th>
                  <th className="p-3">سقف الائتمان الآجل</th>
                  <th className="p-3">الرصيد المدين الحالي</th>
                  <th className="p-3 text-center">إجراءات السداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-[#F8FAFC]">{c.name}</td>
                    <td className="p-3 font-mono text-[#94A3B8]">
                      {c.phone} {c.national_id && `· ${c.national_id}`}
                    </td>
                    <td className="p-3 text-[#94A3B8]">
                      {c.chronic_diseases && c.chronic_diseases.length > 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                          {c.chronic_diseases.join('، ')}
                        </span>
                      ) : (
                        'لا يوجد'
                      )}
                    </td>
                    <td className="p-3 font-mono">{c.credit_limit} {pharmacyBranding.currency}</td>
                    <td className="p-3 font-mono font-bold">
                      <span className={c.current_balance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                        {c.current_balance.toFixed(2)} {pharmacyBranding.currency}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {c.current_balance > 0 && (
                        <button
                          onClick={() => {
                            setSelectedCustomerIdForPayment(c.id);
                            setDebtPaymentAmount(c.current_balance.toString());
                            setShowPayDebtModal(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          سداد دفعة نقدية
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Chronic Patients */}
      {activeTab === 'CHRONIC' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col p-4">
          <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 shrink-0 text-red-500" />
            <span>
              نظام خدمة المرضى المزمنين: يتابع مواعيد نفاد جرعات الأدوية المزمنة (سكر، ضغط، ربو) لإرسال تذكير مسبق وتجهيز العلاج.
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">اسم المريض</th>
                  <th className="p-3">رقم الجوال</th>
                  <th className="p-3">الدواء المزمن</th>
                  <th className="p-3">الجرعة اليومية</th>
                  <th className="p-3">تاريخ آخر صرف</th>
                  <th className="p-3">موعد التجديد المتوقع</th>
                  <th className="p-3 text-center">تذكير المريض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {chronicCustomers.map((cust) =>
                  cust.chronic_meds.map((med, idx) => {
                    const prod = products.find((p) => p.id === med.product_id);
                    const lastDate = new Date(med.last_refill_date);
                    lastDate.setDate(lastDate.getDate() + 30);
                    const nextRefill = lastDate.toISOString().split('T')[0];

                    return (
                      <tr key={`${cust.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-[#F8FAFC]">{cust.name}</td>
                        <td className="p-3 font-mono text-[#94A3B8]">{cust.phone}</td>
                        <td className="p-3 font-medium text-emerald-800 dark:text-emerald-300">
                          {prod?.trade_name}
                        </td>
                        <td className="p-3 font-mono">{med.daily_dose_units} حبة/يوم</td>
                        <td className="p-3 font-mono text-slate-500">{med.last_refill_date}</td>
                        <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">
                          {nextRefill}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              alert(`تم تجهيز رسالة التذكير بالواتساب للعميل (${cust.name}) لتجديد دواء (${prod?.trade_name}).`);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>تذكير واتساب</span>
                          </button>
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

      {/* MODAL: Pay Customer Debt */}
      {showPayDebtModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-md w-full p-5 shadow-2xl border border-[#334155] text-[#F8FAFC]">
            <h3 className="font-bold text-sm text-[#F8FAFC] mb-1">
              سند قبض سداد دين عميل
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              العميل: {customers.find((c) => c.id === selectedCustomerIdForPayment)?.name}
            </p>

            <form onSubmit={handlePayDebtSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#94A3B8]">المبلغ المسدد ({pharmacyBranding.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={debtPaymentAmount}
                  onChange={(e) => setDebtPaymentAmount(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md font-mono outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowPayDebtModal(false)}
                  className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] rounded-md transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  إصدار سند القبض وقيد النقدية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-md w-full p-5 shadow-2xl border border-[#334155] text-[#F8FAFC]">
            <div className="flex justify-between items-center pb-3 border-b border-[#334155]">
              <h3 className="font-bold text-sm text-[#F8FAFC]">فتح ملف عميل جديد</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block font-semibold mb-1 text-[#94A3B8]">اسم العميل الكامل</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="محمد عبدالله"
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#94A3B8]">رقم الجوال</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="050XXXXXXX"
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md font-mono outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-[#94A3B8]">الهوية الوطنية (اختياري)</label>
                  <input
                    type="text"
                    value={newCustNationalId}
                    onChange={(e) => setNewCustNationalId(e.target.value)}
                    placeholder="10XXXXXXXX"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md font-mono outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#94A3B8]">سقف الائتمان الآجل</label>
                  <input
                    type="number"
                    value={newCustCreditLimit}
                    onChange={(e) => setNewCustCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md font-mono outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#94A3B8]">الأمراض المزمنة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={newCustChronicDiseases}
                  onChange={(e) => setNewCustChronicDiseases(e.target.value)}
                  placeholder="السكري، ضغط الدم، ربو"
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] rounded-md transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-md transition-colors shadow-xs"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
