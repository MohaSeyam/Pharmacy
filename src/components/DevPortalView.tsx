import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  ShieldCheck,
  Key,
  Laptop,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  Unlock,
  Ban,
  Clock,
  CheckCircle2,
  Building2,
  Download,
  Copy,
  Check,
  X,
  FileDown,
  Layers,
  Sparkles,
  Pill,
  Heart,
  Cross,
  Shield,
  AlertCircle
} from 'lucide-react';
import { License } from '../types/pharmacy';

export const DevPortalView: React.FC = () => {
  const {
    allLicenses,
    currentLicense,
    pharmacyBranding,
    activeBranch,
    activeBranchId,
    currentDeviceHwid,
    licenseValidationStatus,
    generateBoundLicense,
    activateBoundLicense,
    updateLicenseStatus,
    renewLicense,
    revokeDevice,
    isClockTampered,
    simulateClockTamper,
    resetClockTamper,
    auditLogs
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'GENERATOR' | 'AUDIT' | 'LICENSES' | 'DEVICES'>('GENERATOR');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Form State for License Key Generator bound to pharmacy branding & branches
  const [formPharmacyName, setFormPharmacyName] = useState('صيدليات ابن سينا الحديثة');
  const [formLogoIcon, setFormLogoIcon] = useState('pill');
  const [formAddress, setFormAddress] = useState('شارع العليا العام، مجمع الرعاية الطبي، الرياض');
  const [formTaxNo, setFormTaxNo] = useState('310998877600003');
  const [formPhone, setFormPhone] = useState('011-4455667');
  const [formCurrency, setFormCurrency] = useState('ر.س');
  const [formMaxDevices, setFormMaxDevices] = useState(3);
  const [formDurationMonths, setFormDurationMonths] = useState(12);

  // Bound Branches List
  const [formBranches, setFormBranches] = useState<{ id: string; name: string }[]>([
    { id: 'SINA-MAIN', name: 'الفرع الرئيسي - شارع العليا' },
    { id: 'SINA-NORTH', name: 'فرع حي النرجس الشمالي' }
  ]);
  const [newBranchIdInput, setNewBranchIdInput] = useState('');
  const [newBranchNameInput, setNewBranchNameInput] = useState('');

  // Generated License Result Preview
  const [lastGeneratedLicense, setLastGeneratedLicense] = useState<License | null>(null);

  // Add Branch to generator form
  const handleAddBranch = () => {
    if (!newBranchIdInput.trim() || !newBranchNameInput.trim()) return;
    const cleanId = newBranchIdInput.trim().toUpperCase().replace(/\s+/g, '-');
    setFormBranches([...formBranches, { id: cleanId, name: newBranchNameInput.trim() }]);
    setNewBranchIdInput('');
    setNewBranchNameInput('');
  };

  const handleRemoveBranch = (idx: number) => {
    if (formBranches.length <= 1) return;
    setFormBranches(formBranches.filter((_, i) => i !== idx));
  };

  // Generate License Action
  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPharmacyName.trim() || formBranches.length === 0) return;

    const generated = generateBoundLicense({
      pharmacyName: formPharmacyName.trim(),
      logoIcon: formLogoIcon,
      address: formAddress.trim(),
      taxNo: formTaxNo.trim(),
      phone: formPhone.trim(),
      branches: formBranches,
      maxDevices: formMaxDevices,
      durationMonths: formDurationMonths
    });

    setLastGeneratedLicense(generated);
    setSuccessToast(`تم توليد وتشفير مفتاح ترخيص جديد بنجاح للصيدلية: (${generated.pharmacy_name})`);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  // Immediate Apply / Enforce on Active System
  const handleApplyToCurrentSystem = (lic: License) => {
    const res = activateBoundLicense(lic, true);
    setSuccessToast(res.message);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  // Copy Key to Clipboard
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  // Export .lic file
  const handleExportLicFile = (lic: License) => {
    const payload = {
      format: 'PHARMASYS_CRYPTOGRAPHIC_LICENSE_V2',
      issued_at: new Date().toISOString(),
      license_key: lic.license_key,
      signature_hash: lic.signature_hash,
      bound_entities: {
        pharmacy_name: lic.pharmacy_name,
        pharmacy_logo_icon: lic.pharmacy_logo_icon,
        pharmacy_address: lic.pharmacy_address,
        pharmacy_tax_no: lic.pharmacy_tax_no,
        allowed_branch_ids: lic.allowed_branch_ids,
        allowed_branch_names: lic.allowed_branch_names
      },
      hardware_binding: {
        max_devices: lic.max_devices,
        enforced_hwid_fingerprint: currentDeviceHwid
      },
      validity: {
        starts_at: lic.starts_at,
        expires_at: lic.expires_at,
        grace_days: lic.grace_days,
        status: lic.status
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `License_${lic.pharmacy_name.replace(/\s+/g, '_')}.lic`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#334155]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                لوحة المطوّر: إدارة وإنفاذ تراخيص الصيدليات (License Key Manager)
              </h2>
              <p className="text-xs text-[#94A3B8]">
                توليد مفاتيح تراخيص مشفرة ومقيّدة بهوية الصيدلية (الاسم، الشعار، العنوان) وأرقام الفروع المصرح بها (Branch IDs).
              </p>
            </div>
          </div>
        </div>

        {/* Global Compliance Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
              licenseValidationStatus.isCompliant
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-rose-950/70 text-rose-300 border-rose-800 animate-pulse'
            }`}
          >
            {licenseValidationStatus.isCompliant ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>
              {licenseValidationStatus.isCompliant
                ? 'حالة الترخيص: موثّق ومطابق للمعايير'
                : 'تنبيه: انتهاك مطابقة الترخيص بالفروع'}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-600 rounded-lg text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#334155] mb-6 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('GENERATOR')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'GENERATOR'
              ? 'bg-[#0EA5E9] text-white font-semibold'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>توليد مفتاح ترخيص مقيّد (License Generator)</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'AUDIT'
              ? 'bg-[#0EA5E9] text-white font-semibold'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>فحص الإنفاذ والمطابقة (Enforcement Audit)</span>
          {!licenseValidationStatus.isCompliant && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('LICENSES')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'LICENSES'
              ? 'bg-[#0EA5E9] text-white font-semibold'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>سجل التراخيص المعتمدة ({allLicenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DEVICES')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'DEVICES'
              ? 'bg-[#0EA5E9] text-white font-semibold'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>محطات العتاد (HWID Terminals)</span>
        </button>
      </div>

      {/* TAB 1: BOUND LICENSE GENERATOR FORM */}
      {activeTab === 'GENERATOR' && (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pr-1">
          {/* Left Form (8 Cols) */}
          <form onSubmit={handleGenerateLicense} className="lg:col-span-7 space-y-5">
            {/* Section 1: Pharmacy Identity */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0EA5E9]" />
                  <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
                    1. بيانات وهوية الصيدلية المراد ترخيصها (Pharmacy Branding)
                  </h3>
                </div>
                <span className="text-[11px] text-[#94A3B8]">تُشفر داخل المفتاح</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    اسم الصيدلية أو المجموعة الرسمية *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPharmacyName}
                    onChange={(e) => setFormPharmacyName(e.target.value)}
                    placeholder="مثال: صيدليات النور النموذجية"
                    className="w-full p-2.5 bg-[#0F172A] border border-[#334155] rounded-md text-[#F8FAFC] text-xs outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    رمز وشعار الصيدلية المعتمد
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'pill', label: 'دواء', icon: <Pill className="w-4 h-4" /> },
                      { id: 'cross', label: 'صليب', icon: <Cross className="w-4 h-4" /> },
                      { id: 'heart', label: 'قلب', icon: <Heart className="w-4 h-4" /> },
                      { id: 'shield', label: 'درع', icon: <Shield className="w-4 h-4" /> },
                      { id: 'building', label: 'مبنى', icon: <Building2 className="w-4 h-4" /> }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setFormLogoIcon(item.id)}
                        className={`p-2 rounded-md border flex flex-col items-center gap-1 transition-colors ${
                          formLogoIcon === item.id
                            ? 'bg-[#0EA5E9]/20 border-[#0EA5E9] text-[#0EA5E9]'
                            : 'bg-[#0F172A] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                      >
                        {item.icon}
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    الرقم الضريبي (VAT No.)
                  </label>
                  <input
                    type="text"
                    value={formTaxNo}
                    onChange={(e) => setFormTaxNo(e.target.value)}
                    className="w-full p-2.5 bg-[#0F172A] border border-[#334155] rounded-md text-[#F8FAFC] font-mono text-xs outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    العنوان والمدينة المسجلة بالترخيص
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full p-2.5 bg-[#0F172A] border border-[#334155] rounded-md text-[#F8FAFC] text-xs outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    رقم الهاتف الرسمي
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#0F172A] border border-[#334155] rounded-md text-[#F8FAFC] font-mono text-xs outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    العملة الرسمية المعتمدة
                  </label>
                  <input
                    type="text"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full p-2.5 bg-[#0F172A] border border-[#334155] rounded-md text-[#F8FAFC] text-xs outline-none focus:border-[#0EA5E9]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Bound Branch IDs (Crucial Enforcement Requirement) */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0EA5E9]" />
                  <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
                    2. أرقام ومعرّفات الفروع المصرح لها (Enforced Branch IDs)
                  </h3>
                </div>
                <span className="text-[11px] bg-[#0F172A] text-[#94A3B8] px-2 py-0.5 rounded border border-[#334155] font-mono">
                  {formBranches.length} فروع مقيدة
                </span>
              </div>

              <p className="text-[11px] text-[#94A3B8]">
                يقوم النظام بالتحقق التلقائي عند بدء الجلسة أو البيع: لا يمكن تشغيل النظام على أي فرع إلا إذا كان معرّف الفرع (Branch ID) مسجلاً ومشفراً في مفتاح الترخيص.
              </p>

              {/* Branch list */}
              <div className="space-y-2">
                {formBranches.map((br, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#0F172A] border border-[#334155] rounded-md text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="kbd-shortcut text-[10px]">
                        ID: {br.id}
                      </span>
                      <span className="text-[#F8FAFC] font-medium">{br.name}</span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                          الفرع الرئيسي
                        </span>
                      )}
                    </div>
                    {formBranches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBranch(idx)}
                        className="text-[#94A3B8] hover:text-rose-400 p-1"
                        title="حذف الفرع"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Branch Input */}
              <div className="pt-2 border-t border-[#334155] flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="معرّف الفرع (مثال: BR-EAST)"
                  value={newBranchIdInput}
                  onChange={(e) => setNewBranchIdInput(e.target.value)}
                  className="flex-1 p-2 bg-[#0F172A] border border-[#334155] rounded-md text-xs font-mono text-[#F8FAFC] outline-none focus:border-[#0EA5E9]"
                />
                <input
                  type="text"
                  placeholder="اسم الفرع (مثال: فرع حي الشروق)"
                  value={newBranchNameInput}
                  onChange={(e) => setNewBranchNameInput(e.target.value)}
                  className="flex-1 p-2 bg-[#0F172A] border border-[#334155] rounded-md text-xs text-[#F8FAFC] outline-none focus:border-[#0EA5E9]"
                />
                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="px-3 py-2 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-semibold rounded-md text-[#F8FAFC] transition-colors shrink-0"
                >
                  + إضافة فرع
                </button>
              </div>
            </div>

            {/* Section 3: Hardware & Duration Constraints */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#0EA5E9]" />
                  <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
                    3. قيود العتاد والسريان (Security & Hardware Constraints)
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    أقصى عدد أجهزة كاشير مسموح بها (HWID Limit)
                  </label>
                  <select
                    value={formMaxDevices}
                    onChange={(e) => setFormMaxDevices(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0F172A] border border-[#334155] rounded-md text-[#F8FAFC] text-xs outline-none"
                  >
                    <option value={1}>جهاز كاشير واحد (Single POS Terminal)</option>
                    <option value={2}>جهازين (2 Terminals)</option>
                    <option value={3}>3 أجهزة نقاط بيع ومستودع</option>
                    <option value={5}>5 أجهزة كاشير متزامنة</option>
                    <option value={10}>10 أجهزة (Enterprise Scale)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    مدة الترخيص
                  </label>
                  <select
                    value={formDurationMonths}
                    onChange={(e) => setFormDurationMonths(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0F172A] border border-[#334155] rounded-md text-[#F8FAFC] text-xs outline-none"
                  >
                    <option value={6}>6 أشهر (تجريبي / نصف سنوي)</option>
                    <option value={12}>سنة واحدة (ترخيص سنوي قياسي)</option>
                    <option value={24}>سنتان (2 Years Enterprise)</option>
                    <option value={36}>3 سنوات (3 Years Extended)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>توليد وتشفير مفتاح الترخيص المعتمد الآن</span>
            </button>
          </form>

          {/* Right Column: Generated Certificate & Enforce Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
                <h3 className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0EA5E9]" />
                  <span>شهادة ومفتاح الترخيص المولد (License Payload)</span>
                </h3>
                {lastGeneratedLicense && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                    جاهز للتفعيل
                  </span>
                )}
              </div>

              {lastGeneratedLicense ? (
                <div className="space-y-4 text-xs">
                  {/* License Key Box */}
                  <div className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94A3B8] font-semibold">مفتاح الترخيص المشفّر:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(lastGeneratedLicense.license_key)}
                        className="text-[10px] text-[#0EA5E9] hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? 'تم النسخ' : 'نسخ المفتاح'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-sm text-[#0EA5E9] font-bold tracking-wider select-all break-all">
                      {lastGeneratedLicense.license_key}
                    </div>
                  </div>

                  {/* Bound Parameters Details */}
                  <div className="space-y-2 p-3 bg-[#0F172A] border border-[#334155] rounded-md text-[11px]">
                    <div className="flex justify-between border-b border-[#334155]/60 pb-1.5">
                      <span className="text-[#94A3B8]">اسم الصيدلية المقيّدة:</span>
                      <span className="font-semibold text-[#F8FAFC]">{lastGeneratedLicense.pharmacy_name}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#334155]/60 pb-1.5">
                      <span className="text-[#94A3B8]">الفروع المصرح بها:</span>
                      <span className="font-mono text-[#0EA5E9] font-semibold">
                        {lastGeneratedLicense.allowed_branch_ids.join(', ')}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-[#334155]/60 pb-1.5">
                      <span className="text-[#94A3B8]">سريان الترخيص حتى:</span>
                      <span className="font-mono text-[#F8FAFC]">{lastGeneratedLicense.expires_at}</span>
                    </div>

                    <div className="flex justify-between border-b border-[#334155]/60 pb-1.5">
                      <span className="text-[#94A3B8]">بصمة التوقيع الرقمي (Signature):</span>
                      <span className="font-mono text-[10px] text-[#94A3B8] truncate max-w-[150px]">
                        {lastGeneratedLicense.signature_hash}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">الأجهزة المسموح بها:</span>
                      <span className="font-mono text-[#F8FAFC]">{lastGeneratedLicense.max_devices} محطات عتاد</span>
                    </div>
                  </div>

                  {/* Primary Enforcement Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleApplyToCurrentSystem(lastGeneratedLicense)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>تطبيق وإنفاذ هذا الترخيص فوراً على النظام الحالي</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportLicFile(lastGeneratedLicense)}
                      className="w-full py-2 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] text-[#F8FAFC] rounded-md text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-[#0EA5E9]" />
                      <span>تصدير ملف الترخيص المعتمد (.lic)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-[#94A3B8] space-y-2">
                  <Key className="w-10 h-10 mx-auto text-[#334155]" />
                  <p className="text-xs">
                    قم بتعبئة بيانات الصيدلية وأرقام الفروع ثم اضغط "توليد مفتاح الترخيص" لإنشاء شهادة التوثيق المشفرة.
                  </p>
                </div>
              )}
            </div>

            {/* Currently Active System Binding Indicator */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-5 space-y-3">
              <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>الترخيص النشط حاليًا على هذا الجهاز:</span>
              </div>
              <div className="text-xs space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">المفتاح:</span>
                  <span className="text-[#0EA5E9] font-bold">{currentLicense.license_key}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">المنشأة:</span>
                  <span className="text-[#F8FAFC]">{currentLicense.pharmacy_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">الفروع المصرح بها:</span>
                  <span className="text-emerald-400">{currentLicense.allowed_branch_ids?.join(', ') || 'الكل'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT & ENFORCEMENT VERIFICATION */}
      {activeTab === 'AUDIT' && (
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0EA5E9]" />
                  <span>محرك التحقق الأمني وإنفاذ المعرفات الفريدة (Security Enforcement Engine)</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  فحص لحظي يضمن عدم تشغيل البرنامج إلا تحت اسم الصيدلية المرخص لها والفروع المحددة بالمفتاح.
                </p>
              </div>

              <div
                className={`px-3 py-1.5 rounded-md border text-xs font-mono font-bold ${
                  licenseValidationStatus.isCompliant
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {licenseValidationStatus.isCompliant ? '100% COMPLIANT' : 'VIOLATION DETECTED'}
              </div>
            </div>

            {/* Check Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Check 1: Pharmacy Name */}
              <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">1. مطابقة اسم وهوية الصيدلية:</span>
                  {pharmacyBranding.name.trim() === currentLicense.pharmacy_name?.trim() ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> مطابق
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" /> غير مطابق
                    </span>
                  )}
                </div>
                <div className="text-[11px] space-y-1 text-[#94A3B8]">
                  <div>الاسم المعتمد بالترخيص: <span className="text-[#F8FAFC] font-semibold">{currentLicense.pharmacy_name}</span></div>
                  <div>الاسم الفعلي المسجل بالنظام: <span className="text-[#F8FAFC] font-semibold">{pharmacyBranding.name}</span></div>
                </div>
              </div>

              {/* Check 2: Branch ID Authorization */}
              <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">2. ترخيص الفرع النشط (Branch ID):</span>
                  {currentLicense.allowed_branch_ids?.includes(activeBranchId) ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> الفرع مصرّح به
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" /> فرع غير مرخص!
                    </span>
                  )}
                </div>
                <div className="text-[11px] space-y-1 text-[#94A3B8]">
                  <div>الفرع النشط حالياً: <span className="font-mono text-[#F8FAFC] font-semibold">{activeBranch.name} [{activeBranchId}]</span></div>
                  <div>الفروع المسموح بها في المفتاح: <span className="font-mono text-[#0EA5E9] font-semibold">{currentLicense.allowed_branch_ids?.join(', ') || 'الكل'}</span></div>
                </div>
              </div>

              {/* Check 3: Clock Tamper Protection */}
              <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">3. سلامة ساعة النظام (Anti-Clock Rollback):</span>
                  {!isClockTampered ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> سليمة وموثوقة
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-semibold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" /> رصد تراجع بالساعة!
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  يمنع الصيدلي من تغيير تاريخ الويندوز للتهرب من انتهاء رخصة البرنامج.
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={simulateClockTamper}
                    className="px-2.5 py-1 bg-amber-950/70 hover:bg-amber-900 border border-amber-700 text-amber-200 text-[10px] rounded"
                  >
                    محاكاة تلاعب بالساعة
                  </button>
                  {isClockTampered && (
                    <button
                      type="button"
                      onClick={resetClockTamper}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-[10px] rounded"
                    >
                      مزامنة وإصلاح الساعة
                    </button>
                  )}
                </div>
              </div>

              {/* Check 4: Expiry Countdown */}
              <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8FAFC]">4. صلاحية المفتاح والترخيص:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> سارٍ حتى {currentLicense.expires_at}
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  بصمة العتاد المصادق عليها: <span className="font-mono text-[#F8FAFC]">{currentDeviceHwid}</span>
                </div>
              </div>
            </div>

            {/* If violations exist, show prominent enterprise warning */}
            {!licenseValidationStatus.isCompliant && (
              <div className="p-4 bg-rose-950/80 border border-rose-600 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span>تنبيه أمني صارم: تم اكتشاف تعارض في معايير إنفاذ الترخيص</span>
                </div>
                <ul className="list-disc list-inside text-rose-300 text-[11px] space-y-1">
                  {licenseValidationStatus.violations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED LICENSES DIRECTORY */}
      {activeTab === 'LICENSES' && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#334155] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
                  قائمة التراخيص الصادرة وقواعد البيانات الموثقة
                </h3>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  جميع مفاتيح التراخيص الصادرة مع بيان الصيدلية والفروع المرتبطة بكل مفتاح.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#0F172A] border-b border-[#334155] text-[#94A3B8] font-semibold">
                    <th className="py-3 px-4">الصيدلية المرخصة</th>
                    <th className="py-3 px-4">مفتاح الترخيص</th>
                    <th className="py-3 px-4">الفروع المقيّدة</th>
                    <th className="py-3 px-4">الأجهزة</th>
                    <th className="py-3 px-4">تاريخ الانتهاء</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {allLicenses.map((lic) => {
                    const isActive = currentLicense.id === lic.id;
                    return (
                      <tr key={lic.id} className="hover:bg-[#0F172A]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#F8FAFC]">{lic.pharmacy_name || lic.client_name}</div>
                          <div className="text-[10px] text-[#94A3B8]">{lic.pharmacy_address || 'عنوان مسجل'}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#0EA5E9] font-bold">
                          {lic.license_key}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-[11px] text-[#F8FAFC]">
                            {lic.allowed_branch_ids?.length || lic.max_branches} فروع
                          </div>
                          <div className="text-[10px] text-[#94A3B8] truncate max-w-[150px]">
                            {lic.allowed_branch_ids?.join(', ') || 'جميع الفروع'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#94A3B8]">
                          {lic.devices.length} / {lic.max_devices}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#F8FAFC]">
                          {lic.expires_at}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              lic.status === 'ACTIVE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {lic.status === 'ACTIVE' ? 'سارٍ' : 'معلّق'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {isActive ? (
                              <span className="text-[11px] font-bold text-emerald-400">
                                المفعّل حالياً
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApplyToCurrentSystem(lic)}
                                className="px-2.5 py-1 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded text-[11px] font-semibold transition-colors"
                              >
                                تفعيل وإنفاذ
                              </button>
                            )}

                            <button
                              onClick={() => handleExportLicFile(lic)}
                              className="p-1 text-[#94A3B8] hover:text-white"
                              title="تصدير ملف الترخيص"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* TAB 4: HWID TERMINALS */}
      {activeTab === 'DEVICES' && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <div>
                <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">
                  الأجهزة ونقاط البيع المعتمدة بالترخيص الحالي ({currentLicense.devices.length} / {currentLicense.max_devices})
                </h3>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  بصمة عتاد الجهاز الحالي: <span className="font-mono text-[#0EA5E9] font-bold">{currentDeviceHwid}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentLicense.devices.map((d, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#0EA5E9]">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F8FAFC]">{d.device_name}</span>
                        {d.hw_fingerprint === currentDeviceHwid && (
                          <span className="text-[10px] bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/50 px-1.5 py-0.2 rounded font-mono">
                            الجهاز الحالي (This Machine)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                        HWID: {d.hw_fingerprint} · تفعيل: {d.activated_at} · آخر اتصال: {d.last_seen}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      مصادق عليه
                    </span>
                    {currentLicense.devices.length > 1 && d.hw_fingerprint !== currentDeviceHwid && (
                      <button
                        onClick={() => revokeDevice(currentLicense.id, d.hw_fingerprint)}
                        className="px-2.5 py-1 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-200 text-[10px] rounded transition-colors"
                      >
                        سحب الترخيص عن الجهاز
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
