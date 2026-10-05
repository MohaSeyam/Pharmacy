import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  UserCheck,
  Calendar,
  CreditCard,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PayrollRun } from '../types/pharmacy';

export const HRView: React.FC = () => {
  const { employees, payrollRuns, createPayrollRun, approvePayrollRun, branches } = usePharmacy();
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [currentRun, setCurrentRun] = useState<PayrollRun | null>(null);

  const handleGenerateRun = () => {
    const run = createPayrollRun(selectedMonth);
    setCurrentRun(run);
  };

  const handleApprove = (runId: string) => {
    approvePayrollRun(runId);
    if (currentRun) {
      setCurrentRun({ ...currentRun, status: 'APPROVED' });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <span>الموظفون، الحضور، ومسيرات الرواتب (HR)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة عقود الصيادلة والموظفين، احتساب البدلات والخصومات، واعتماد كشف الرواتب الشهري مع القيد التلقائي.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs font-mono outline-none"
          />
          <button
            onClick={handleGenerateRun}
            className="flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
          >
            <span>احتساب مسير رواتب الشهر</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Active Payroll Run View if generated */}
        {currentRun && (
          <div className="bg-[#1E293B] p-5 rounded-lg border border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#F8FAFC]">
                  كشف مسير رواتب شهر {currentRun.month}
                </h3>
                <p className="text-xs text-slate-500">
                  إجمالي صافي المستحقات:{' '}
                  <span className="font-bold font-mono text-emerald-600">
                    {currentRun.total_net.toLocaleString()} ر.س
                  </span>
                </p>
              </div>

              {currentRun.status === 'APPROVED' ? (
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>معتمد ومُقيد بالمحاسبة</span>
                </span>
              ) : (
                <button
                  onClick={() => handleApprove(currentRun.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  اعتماد المسير وصرف الرواتب
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                  <tr>
                    <th className="p-2.5">الموظف</th>
                    <th className="p-2.5">الأساسي</th>
                    <th className="p-2.5">البدلات</th>
                    <th className="p-2.5">الإضافي</th>
                    <th className="p-2.5">الخصومات</th>
                    <th className="p-2.5">السلف</th>
                    <th className="p-2.5">صافي الراتب المستحق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155] font-mono">
                  {currentRun.lines.map((l) => (
                    <tr key={l.employee_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-sans font-bold text-[#F8FAFC]">
                        {l.employee_name}
                      </td>
                      <td className="p-2.5">{l.base_salary.toLocaleString()} ر.س</td>
                      <td className="p-2.5 text-emerald-600">+{l.allowances} ر.س</td>
                      <td className="p-2.5 text-emerald-600">+{l.overtime} ر.س</td>
                      <td className="p-2.5 text-red-600">-{l.deductions} ر.س</td>
                      <td className="p-2.5 text-red-600">-{l.advances} ر.س</td>
                      <td className="p-2.5 font-bold text-[#F8FAFC]">
                        {l.net_salary.toLocaleString()} ر.س
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employees Directory Table */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#334155] font-bold text-xs text-[#F8FAFC]">
            فريق العمل والصيادلة النشطين ({employees.length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">اسم الموظف</th>
                  <th className="p-3">الدور والمسؤولية</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">رقم الجوال</th>
                  <th className="p-3">تاريخ التعيين</th>
                  <th className="p-3">الراتب الأساسي</th>
                  <th className="p-3">حالة الحساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {employees.map((emp) => {
                  const br = branches.find((b) => b.id === emp.branch_id);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-[#F8FAFC]">{emp.full_name}</td>
                      <td className="p-3">
                        <span className="bg-[#0F172A] text-[#F8FAFC] px-2 py-0.5 rounded text-[11px] font-mono">
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-3 text-[#94A3B8]">{br?.name}</td>
                      <td className="p-3 font-mono text-[#94A3B8]">{emp.phone}</td>
                      <td className="p-3 font-mono text-slate-500">{emp.hire_date}</td>
                      <td className="p-3 font-mono font-bold text-[#F8FAFC]">
                        {emp.base_salary.toLocaleString()} ر.س
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                          نشط على النظام
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
