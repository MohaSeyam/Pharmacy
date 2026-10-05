import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Calculator,
  TrendingUp,
  Receipt,
  BookOpen,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  X
} from 'lucide-react';
import { Expense } from '../types/pharmacy';

export const AccountingView: React.FC = () => {
  const {
    accounts,
    journalEntries,
    expenses,
    addExpense,
    calculateProfitMetrics,
    activeBranchId
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'PROFIT' | 'JOURNALS' | 'EXPENSES' | 'CHART_OF_ACCOUNTS'>('PROFIT');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // New Expense form state
  const [expCategory, setExpCategory] = useState('كهرباء ومرافق');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expDescription, setExpDescription] = useState('');
  const [expAccount, setExpAccount] = useState('acc-101');

  const profit = calculateProfitMetrics();

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!amt || amt <= 0) return;

    addExpense({
      branch_id: activeBranchId,
      category: expCategory,
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      description: expDescription,
      payment_account: expAccount
    });

    setShowAddExpenseModal(false);
    setExpAmount('');
    setExpDescription('');
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-600" />
            <span>المحاسبة، الأرباح الحقيقية، والقيود التلقائية</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            احتساب أرباح الصيدلية وفق تكلفة الدفعات الفعلية (COGS)، القيود اليومية التلقائية المتوازنة، ومصروفات التشغيل.
          </p>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>سند صرف مصروفات جديد</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#334155] mb-4 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('PROFIT')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'PROFIT'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          قائمة الدخل والأرباح (P&L)
        </button>

        <button
          onClick={() => setActiveTab('JOURNALS')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'JOURNALS'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          دفتر القيود اليومية التلقائية ({journalEntries.length})
        </button>

        <button
          onClick={() => setActiveTab('EXPENSES')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'EXPENSES'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          سندات المصروفات التشغيلية ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab('CHART_OF_ACCOUNTS')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'CHART_OF_ACCOUNTS'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          دليل الحسابات والأرصدة ({accounts.length})
        </button>
      </div>

      {/* TAB 1: Real Profit & Loss */}
      {activeTab === 'PROFIT' && (
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
              <span className="text-xs text-slate-500">إجمالي المبيعات الصافية</span>
              <div className="text-xl font-bold font-mono text-[#F8FAFC] mt-1">
                {profit.grossRevenue.toLocaleString()} ر.س
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">مبيعات نقدية، شبكة، وآجل</span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
              <span className="text-xs text-slate-500">تكلفة البضاعة المباعة (COGS)</span>
              <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {profit.cogs.toLocaleString()} ر.س
              </div>
              <span className="text-[11px] text-slate-400">حسب تكلفة شراء كل دفعة فعلية</span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
              <span className="text-xs text-slate-500">مجمل الربح التجاري</span>
              <div className="text-xl font-bold font-mono text-[#0EA5E9] dark:text-[#0EA5E9] dark:text-emerald-400 mt-1">
                {profit.grossProfit.toLocaleString()} ر.س
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                هامش الربح: {profit.profitMarginPct.toFixed(1)}%
              </span>
            </div>

            <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs">
              <span className="text-xs text-slate-500">صافي الربح بعد المصروفات</span>
              <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                {profit.netProfit.toLocaleString()} ر.س
              </div>
              <span className="text-[11px] text-slate-400">بعد خصم الرواتب، الإيجار، وتوالف الإتلاف</span>
            </div>
          </div>

          {/* Detailed P&L statement */}
          <div className="bg-[#1E293B] p-6 rounded-lg border border-[#334155] shadow-xs">
            <h3 className="font-bold text-sm text-[#F8FAFC] mb-4">
              قائمة الدخل التفصيلية (Income Statement)
            </h3>

            <div className="divide-y divide-[#334155] text-xs font-mono">
              <div className="py-2.5 flex justify-between font-bold text-[#F8FAFC]">
                <span>(+) إيرادات مبيعات الأدوية والمستلزمات</span>
                <span>{profit.grossRevenue.toFixed(2)} ر.س</span>
              </div>

              <div className="py-2.5 flex justify-between text-red-600">
                <span>(-) تكلفة البضاعة المباعة الفعلية (FEFO COGS)</span>
                <span>-{profit.cogs.toFixed(2)} ر.س</span>
              </div>

              <div className="py-2.5 flex justify-between font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 rounded">
                <span>(=) مجمل الربح التشغيلي</span>
                <span>{profit.grossProfit.toFixed(2)} ر.س</span>
              </div>

              <div className="py-2.5 flex justify-between text-[#94A3B8]">
                <span>(-) مصروفات الرواتب والأجور (مسير شهري)</span>
                <span>-25,000.00 ر.س</span>
              </div>

              <div className="py-2.5 flex justify-between text-[#94A3B8]">
                <span>(-) مصروفات الإيجار والمرافق والتشغيل</span>
                <span>-{profit.totalExpenses.toFixed(2)} ر.س</span>
              </div>

              <div className="py-2.5 flex justify-between text-[#94A3B8]">
                <span>(-) خسائر إتلاف الأدوية المنتهية والتالفة</span>
                <span>-{profit.writeoffLosses.toFixed(2)} ر.س</span>
              </div>

              <div className="py-3 flex justify-between text-sm font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/60 dark:bg-emerald-950/60 px-3 rounded-lg">
                <span>(=) صافي الربح النهائي للفترة</span>
                <span>{profit.netProfit.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Automatic Double-Entry Journal */}
      {activeTab === 'JOURNALS' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col p-4">
          <div className="mb-3 text-xs text-slate-500">
            كل عملية بيع، شراء، إتلاف، أو صرف رواتب تولّد قيدًا يوميًا مزدوجًا ومتوازنًا تلقائيًا وفق معايير المحاسبة (ACC-01).
          </div>

          <div className="overflow-y-auto flex-1 space-y-3">
            {journalEntries.map((je) => (
              <div
                key={je.id}
                className="p-3 bg-[#0F172A] border border-[#334155] rounded-lg space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F8FAFC]">{je.description}</span>
                    <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {je.ref_type}
                    </span>
                  </div>
                  <div className="font-mono text-slate-500 text-[11px]">{je.date}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right font-mono text-[11px]">
                    <thead className="text-slate-400 border-b border-[#334155]">
                      <tr>
                        <th className="py-1">الحساب</th>
                        <th className="py-1">مدين (Debit)</th>
                        <th className="py-1">دائن (Credit)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                      {je.lines.map((l, idx) => (
                        <tr key={idx}>
                          <td className="py-1 font-sans">{l.account_name}</td>
                          <td className="py-1 text-emerald-600 font-semibold">
                            {l.debit > 0 ? `${l.debit.toFixed(2)} ر.س` : '-'}
                          </td>
                          <td className="py-1 text-blue-600 font-semibold">
                            {l.credit > 0 ? `${l.credit.toFixed(2)} ر.س` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Operating Expenses */}
      {activeTab === 'EXPENSES' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">تصنيف المصروف</th>
                  <th className="p-3">البيان والشرح</th>
                  <th className="p-3">حساب الدفع</th>
                  <th className="p-3">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-[#94A3B8]">{exp.date}</td>
                    <td className="p-3 font-semibold text-[#F8FAFC]">
                      {exp.category}
                    </td>
                    <td className="p-3 text-[#94A3B8]">{exp.description}</td>
                    <td className="p-3 font-mono text-slate-500">{exp.payment_account}</td>
                    <td className="p-3 font-mono font-bold text-red-600 dark:text-red-400">
                      {exp.amount.toFixed(2)} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Chart of Accounts */}
      {activeTab === 'CHART_OF_ACCOUNTS' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">رمز الحساب</th>
                  <th className="p-3">اسم الحساب</th>
                  <th className="p-3">نوع الحساب</th>
                  <th className="p-3">الرصيد الحالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-[#F8FAFC]">
                      {acc.code}
                    </td>
                    <td className="p-3 font-medium text-[#F8FAFC]">{acc.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0F172A] text-[#94A3B8]">
                        {acc.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#F8FAFC]">
                      {acc.balance.toLocaleString()} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-md w-full p-6 shadow-2xl border border-[#334155]">
            <div className="flex justify-between items-center pb-3 border-b border-[#334155]">
              <h3 className="font-bold text-base text-[#F8FAFC]">
                تسجيل سند صرف مصروفات
              </h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs mt-3">
              <div>
                <label className="block font-semibold mb-1">تصنيف المصروف</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                >
                  <option value="كهرباء ومرافق">كهرباء ومرافق</option>
                  <option value="إيجار الفرع">إيجار الفرع</option>
                  <option value="نظافة ومستهلكات">نظافة ومستهلكات وأكياس</option>
                  <option value="صيانة أجهزة وتكييف">صيانة أجهزة وتكييف</option>
                  <option value="ضيافة ونثريات">ضيافة ونثريات</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">المبلغ (ر.س)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="250.00"
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">الشرح والبيان</label>
                <input
                  type="text"
                  required
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="شراء رول حراري للطابعات وورق فواتير"
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">الخصم من حساب</label>
                <select
                  value={expAccount}
                  onChange={(e) => setExpAccount(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                >
                  <option value="acc-101">الصندوق الرئيسي (نقدية بالصندوق)</option>
                  <option value="acc-102">البنك - الحساب الجاري</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-[#0F172A] text-slate-600 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  حفظ وقيد السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
