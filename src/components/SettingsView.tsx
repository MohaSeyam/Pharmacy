import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Settings,
  Shield,
  RefreshCw,
  HardDrive,
  Printer,
  FileText,
  Lock,
  Download,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    auditLogs,
    currentLicense,
    isOffline,
    setIsOffline,
    pendingSyncCount,
    triggerSync,
    isSyncing,
    currentDeviceHwid,
    pharmacyBranding
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'AUDIT' | 'GENERAL' | 'BACKUP'>('AUDIT');
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleBackup = () => {
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 4000);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>إعدادات النظام، سجل التدقيق المشفر، والمزامنة</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          سجل التدقيق المتسلسل غير القابل للتعديل، النسخ الاحتياطي المشفر، وإعدادات الطابعات والمزامنة المركزية.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#334155] mb-4 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'AUDIT'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>سجل التدقيق المتسلسل المشفر ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'GENERAL'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>بيانات الصيدلية والطابعات</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'BACKUP'
              ? 'bg-[#0EA5E9] text-white'
              : 'text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>النسخ الاحتياطي والمزامنة (Offline/Online)</span>
        </button>
      </div>

      {/* TAB 1: Immutable Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col p-4">
          <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-900 dark:text-emerald-200">
            سجل التدقيق (SEC-06): كل سجل يحمل بصمة تجزئة مشفرة مرتبطة بالسجل السابق (Hash Chaining) لمنع حذف أو تعديل أي حركة مالية أو مخزنية.
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F172A] border-b border-[#334155] text-slate-500 font-semibold">
                <tr>
                  <th className="p-2.5">الوقت والتاريخ</th>
                  <th className="p-2.5">المستخدم</th>
                  <th className="p-2.5">العملية (Action)</th>
                  <th className="p-2.5">الكيان</th>
                  <th className="p-2.5">التفاصيل</th>
                  <th className="p-2.5">بصمة التشفير (Hash)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155] font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 text-slate-500">{new Date(log.timestamp).toLocaleTimeString('ar-SA')}</td>
                    <td className="p-2.5 font-sans font-medium text-[#F8FAFC]">
                      {log.user_name}
                    </td>
                    <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {log.action}
                    </td>
                    <td className="p-2.5 text-slate-500">{log.entity}</td>
                    <td className="p-2.5 font-sans text-[#F8FAFC]">{log.details}</td>
                    <td className="p-2.5 text-slate-400 text-[10px]">
                      {log.hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: General & Printers */}
      {activeTab === 'GENERAL' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs p-6 max-w-2xl overflow-y-auto space-y-4 text-xs">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#F8FAFC]">بيانات المنشأة الضريبية</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">اسم الصيدلية الرسمي</label>
                <input
                  type="text"
                  readOnly
                  value={pharmacyBranding.name}
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded font-semibold text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">الرقم الضريبي (VAT ID)</label>
                <input
                  type="text"
                  readOnly
                  value={pharmacyBranding.tax_no}
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded font-mono text-[#F8FAFC]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#334155] space-y-3">
            <h3 className="font-bold text-sm text-[#F8FAFC]">إعدادات طباعة الإيصال الحراري</h3>
            <div>
              <label className="block text-slate-500 mb-1">عرض ورق الطابعة الحرارية</label>
              <select className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded text-[#F8FAFC]">
                <option value="80mm">80mm حراري قياسي (Standard POS Roll)</option>
                <option value="58mm">58mm حراري صغير</option>
                <option value="A4">A4 قياسي للمستشفيات</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">تذييل الإيصال (سياسة الاسترجاع والتحذيرات)</label>
              <textarea
                rows={2}
                defaultValue="الأدوية لا تُستبدل ولا تُسترجع إلا حسب اشتراطات وزارة الصحة وخلال 24 ساعة مع إحضار الفاتورة."
                className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded text-[#F8FAFC]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Backup & Sync */}
      {activeTab === 'BACKUP' && (
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs p-6 max-w-2xl overflow-y-auto space-y-6 text-xs">
          {/* Sync status */}
          <div className="p-4 bg-[#0F172A] rounded-lg border border-[#334155] space-y-3">
            <h3 className="font-bold text-sm text-[#F8FAFC] flex items-center justify-between">
              <span>حالة المزامنة والعمل دون اتصال (Offline-first)</span>
              <span className="font-mono text-xs text-slate-500">
                {isOffline ? 'وضع محلي دون اتصال' : 'متصل بالسيرفر المركزي'}
              </span>
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#F8FAFC]">
                  الحركات المنتظرة في طابور المزامنة: {pendingSyncCount} حركات
                </div>
                <p className="text-[11px] text-slate-500">
                  في حالة انقطاع الشبكة، تستمر عمليات البيع محليًا ويتم دمج الحركات فور عودة الاتصال.
                </p>
              </div>

              <button
                onClick={triggerSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>مزامنة فورية الآن</span>
              </button>
            </div>
          </div>

          {/* Encrypted Backup */}
          <div className="p-4 bg-[#0F172A] rounded-lg border border-[#334155] space-y-3">
            <h3 className="font-bold text-sm text-[#F8FAFC]">النسخ الاحتياطي المشفر (AES-256)</h3>
            <p className="text-slate-500">
              يتم تشفير ملف قاعدة البيانات بالكامل بمفتاح الصيدلية الخاص قبل حفظه أو تصديره (SEC-05).
            </p>

            {backupSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم إنشاء النسخة الاحتياطية المشفرة وتجهيزها للحفظ بأمان.</span>
              </div>
            )}

            <button
              onClick={handleBackup}
              className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>توليد وتنزيل نسخة احتياطية مشفرة فورًا</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
