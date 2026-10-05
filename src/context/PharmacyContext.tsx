import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Batch,
  StockLevel,
  StockMovement,
  Sale,
  SaleLine,
  HeldSale,
  Shift,
  Supplier,
  GoodsReceipt,
  Customer,
  Employee,
  PayrollRun,
  Account,
  JournalEntry,
  Expense,
  Branch,
  MissedDemand,
  License,
  AuditLog,
  UnitLevel,
  Role,
  ReorderMetric,
  ControlledDrugInfo,
  PaymentMethod,
  PharmacyBranding,
  ClientEdition,
  BranchInfo
} from '../types/pharmacy';
import {
  INITIAL_BRANCHES,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_STOCK_LEVELS,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_ACCOUNTS,
  INITIAL_EXPENSES,
  INITIAL_LICENSES,
  INITIAL_MISSED_DEMANDS
} from '../data/initialData';

export const DEFAULT_BRANDING: PharmacyBranding = {
  name: 'صيدليات الشفاء المتطورة',
  logo_icon: 'pill',
  tagline: 'رعايتكم الصحية غايتنا الأولى',
  tax_no: '300987654300003',
  commercial_reg_no: '1010998877',
  address: 'شارع الملك فهد، مقابل المستشفى التخصصي',
  phone: '011-4567890',
  currency: 'ر.س',
  receipt_footer: 'الأدوية لا تُستبدل ولا تُسترجع إلا حسب اشتراطات وزارة الصحة وخلال 24 ساعة مع إحضار الفاتورة.'
};

export const INITIAL_EDITIONS: ClientEdition[] = [
  {
    id: 'edition-shifa',
    branding: DEFAULT_BRANDING,
    branches: [
      {
        id: 'br-1',
        name: 'الفرع الرئيسي - شارع الجامعة',
        code: 'BR-MAIN',
        address: 'شارع الملك فهد، مقابل المستشفى التخصصي',
        phone: '011-4567890',
        color: '#0D9488',
        is_main: true
      },
      {
        id: 'br-2',
        name: 'فرع 2 - حي النور',
        code: 'BR-NOOR',
        address: 'شارع النخيل، بجانب المركز الطبي',
        phone: '011-8976543',
        color: '#1BA6B5',
        is_main: false
      }
    ],
    license: INITIAL_LICENSES[0],
    created_at: '2026-01-01'
  },
  {
    id: 'edition-amal',
    branding: {
      name: 'صيدلية الأمل النموذجية',
      logo_icon: 'heart',
      tagline: 'دواؤك بأمان وأسعار موثوقة',
      tax_no: '310887766500003',
      commercial_reg_no: '1020443322',
      address: 'شارع التحرير، عمارة النصر',
      phone: '011-3322110',
      currency: 'ر.س',
      receipt_footer: 'صحتكم أمانة لدينا. نسعد بخدمتكم دائمًا.'
    },
    branches: [
      {
        id: 'br-amal-1',
        name: 'فرع الصالة المركزية',
        code: 'AMAL-01',
        address: 'شارع التحرير، عمارة النصر',
        phone: '011-3322110',
        color: '#2563EB',
        is_main: true
      }
    ],
    license: INITIAL_LICENSES[1],
    created_at: '2026-03-15'
  }
];

interface PharmacyContextType {
  // App state
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  activeBranch: Branch;
  branches: Branch[];
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUserName: string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  colorTheme: 'teal' | 'blue' | 'emerald' | 'slate';
  setColorTheme: (colorTheme: 'teal' | 'blue' | 'emerald' | 'slate') => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;

  // Branding & Multi-Pharmacy Editions
  pharmacyBranding: PharmacyBranding;
  setPharmacyBranding: (b: PharmacyBranding) => void;
  clientEditions: ClientEdition[];
  deployClientEdition: (editionId: string) => void;
  createNewClientEdition: (edition: Omit<ClientEdition, 'id' | 'created_at'>) => void;

  // Shortcuts modal
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (val: boolean) => void;

  // Offline & Sync
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  pendingSyncCount: number;
  triggerSync: () => Promise<void>;
  isSyncing: boolean;

  // License state (Current system)
  currentLicense: License;
  currentDeviceHwid: string;
  isClockTampered: boolean;
  simulateClockTamper: () => void;
  resetClockTamper: () => void;
  licenseValidationStatus: {
    isCompliant: boolean;
    message: string;
    violations: string[];
  };
  generateBoundLicense: (params: {
    pharmacyName: string;
    logoIcon: string;
    address: string;
    taxNo: string;
    phone: string;
    branches: { id: string; name: string }[];
    maxDevices: number;
    durationMonths: number;
    modules?: string[];
  }) => License;
  activateBoundLicense: (license: License, syncBrandingAndBranches?: boolean) => {
    success: boolean;
    message: string;
  };

  // Developer Portal state & actions
  allLicenses: License[];
  updateLicenseStatus: (licenseId: string, status: License['status']) => void;
  renewLicense: (licenseId: string, additionalMonths: number) => void;
  revokeDevice: (licenseId: string, hwFingerprint: string) => void;
  createNewLicense: (newLic: Partial<License>) => void;

  // Products & Batches & Stock
  products: Product[];
  batches: Batch[];
  stockLevels: StockLevel[];
  stockMovements: StockMovement[];
  getProductStockUnits: (productId: string, branchId?: string) => number;
  getProductStockBreakdown: (productId: string, branchId?: string) => {
    boxes: number;
    strips: number;
    units: number;
    displayString: string;
  };
  getBatchesForProduct: (productId: string) => (Batch & { stockUnits: number })[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;

  // POS & Sales
  activeShift: Shift | null;
  openShift: (openingCash: number) => void;
  closeShift: (countedCash: number) => Shift;
  sales: Sale[];
  heldSales: HeldSale[];
  holdCurrentSale: (lines: SaleLine[], note: string, customerName?: string) => void;
  restoreHeldSale: (heldSaleId: string) => HeldSale | undefined;
  deleteHeldSale: (heldSaleId: string) => void;
  executeSale: (saleData: {
    lines: SaleLine[];
    customerId?: string;
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    paidAmount: number;
    changeAmount: number;
    controlledInfo?: ControlledDrugInfo;
  }) => Promise<Sale>;
  returnSaleLine: (saleId: string, lineId: string, qtyUnits: number, reason: string) => void;

  // Suppliers & Purchasing
  suppliers: Supplier[];
  goodsReceipts: GoodsReceipt[];
  receiveGoods: (receipt: Omit<GoodsReceipt, 'id' | 'doc_no'>) => void;
  paySupplier: (supplierId: string, amount: number, paymentAccountId: string) => void;

  // Customers (No insurance needed)
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'current_balance'>) => void;
  payCustomerDebt: (customerId: string, amount: number) => void;

  // Inventory Operations: Stocktake, Damage/Writeoff, Transfers
  settleStocktake: (adjustments: { batch_id: string; product_id: string; diff_units: number; cost_per_unit: number; reason: string }[]) => void;
  writeOffBatch: (batchId: string, qtyUnits: number, reason: 'EXPIRED' | 'DAMAGED' | 'SPOILED') => void;
  transferStockBetweenBranches: (fromBranchId: string, toBranchId: string, batchId: string, productId: string, qtyUnits: number) => void;
  missedDemands: MissedDemand[];
  logMissedDemand: (productName: string, requestedQty: number, notes?: string) => void;

  // Expiry Notifications Dismissal
  dismissedExpiryBatchIds: string[];
  dismissExpiryAlert: (batchId: string) => void;

  // Accounting & Expenses
  accounts: Account[];
  journalEntries: JournalEntry[];
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  calculateProfitMetrics: () => {
    grossRevenue: number;
    cogs: number;
    grossProfit: number;
    totalExpenses: number;
    writeoffLosses: number;
    netProfit: number;
    profitMarginPct: number;
  };

  // HR & Payroll
  employees: Employee[];
  payrollRuns: PayrollRun[];
  createPayrollRun: (month: string) => PayrollRun;
  approvePayrollRun: (runId: string) => void;

  // Analytics & Reorder Metrics
  reorderMetrics: ReorderMetric[];

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entity: string, entityId: string, details: string) => void;
}

const PharmacyContext = createContext<PharmacyContextType | null>(null);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Client Editions & Branding state
  const [clientEditions, setClientEditions] = useState<ClientEdition[]>(INITIAL_EDITIONS);
  const [pharmacyBranding, setPharmacyBranding] = useState<PharmacyBranding>(DEFAULT_BRANDING);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState<string>('br-1');
  const [currentRole, setCurrentRole] = useState<Role>('PHARMACIST');
  const [currentUserName] = useState<string>('د. أحمد سامي الشريف');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [colorTheme, setColorTheme] = useState<'teal' | 'blue' | 'emerald' | 'slate'>(() => {
    try {
      const saved = localStorage.getItem('pharmasys_color_theme');
      return (saved as 'teal' | 'blue' | 'emerald' | 'slate') || 'teal';
    } catch {
      return 'teal';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pharmasys_color_theme', colorTheme);
      document.documentElement.setAttribute('data-color-theme', colorTheme);
    } catch {
      // Ignore storage errors
    }
  }, [colorTheme]);

  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Offline & Sync
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Licenses & Dev Portal
  const [allLicenses, setAllLicenses] = useState<License[]>(INITIAL_LICENSES);
  const [currentLicense, setCurrentLicense] = useState<License>(INITIAL_LICENSES[0]);
  const currentDeviceHwid = 'HWID-WIN11-D7F4-9901-MAIN';
  const [isClockTampered, setIsClockTampered] = useState<boolean>(false);

  // Entities state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>(INITIAL_STOCK_LEVELS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [missedDemands, setMissedDemands] = useState<MissedDemand[]>(INITIAL_MISSED_DEMANDS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dismissedExpiryBatchIds, setDismissedExpiryBatchIds] = useState<string[]>([]);

  // Shift & POS Sales
  const [activeShift, setActiveShift] = useState<Shift | null>({
    id: 'shift-1001',
    branch_id: 'br-1',
    cashier_id: 'emp-1',
    cashier_name: 'د. أحمد سامي الشريف',
    opened_at: '2026-10-05 07:00',
    opening_cash: 500,
    cash_sales: 340,
    card_sales: 620,
    credit_sales: 0,
    status: 'OPEN'
  });
  const [sales, setSales] = useState<Sale[]>([]);
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0] || {
    id: 'br-main',
    name: pharmacyBranding.name,
    address: pharmacyBranding.address,
    phone: pharmacyBranding.phone,
    is_main: true
  };

  // Deploy / activate custom client edition from Developer Portal
  const deployClientEdition = (editionId: string) => {
    const edition = clientEditions.find((e) => e.id === editionId);
    if (!edition) return;

    setPharmacyBranding(edition.branding);
    setBranches(
      edition.branches.map((b) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        is_main: b.is_main
      }))
    );
    setActiveBranchId(edition.branches[0]?.id || 'br-1');
    setCurrentLicense(edition.license);

    addAuditLog('CLIENT_EDITION_DEPLOY', 'SYSTEM', edition.id, `تثبيت وتفعيل نسخة الصيدلية: ${edition.branding.name}`);
  };

  const createNewClientEdition = (newEdition: Omit<ClientEdition, 'id' | 'created_at'>) => {
    const id = `edition-${Date.now()}`;
    const edition: ClientEdition = {
      ...newEdition,
      id,
      created_at: new Date().toISOString().split('T')[0]
    };
    setClientEditions((prev) => [edition, ...prev]);
    addAuditLog('CLIENT_EDITION_CREATE', 'VENDOR', id, `إنشاء حزمة صيدلية جديدة: ${newEdition.branding.name}`);
  };

  // Audit log helper
  const addAuditLog = (action: string, entity: string, entityId: string, details: string) => {
    const prevHash = auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].hash : 'GENESIS-0000';
    const timestamp = new Date().toISOString();
    const hash = `HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36)}`;
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      user_id: 'usr-current',
      user_name: currentUserName,
      action,
      entity,
      entity_id: entityId,
      details,
      timestamp,
      hash,
      prev_hash: prevHash
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Clock tampering simulation
  const simulateClockTamper = () => {
    setIsClockTampered(true);
    addAuditLog('SECURITY_ALERT', 'LICENSE', currentLicense.id, 'كشف محاولة تراجع بساعة النظام المحلي (System Clock Rollback Detected)');
  };

  const resetClockTamper = () => {
    setIsClockTampered(false);
    addAuditLog('SECURITY_RESTORE', 'LICENSE', currentLicense.id, 'تمت إعادة مزامنة وقت النظام مع مخدّم الوقت الموثوق');
  };

  // Dismiss near-expiry alert
  const dismissExpiryAlert = (batchId: string) => {
    setDismissedExpiryBatchIds((prev) => [...prev, batchId]);
  };

  // License validation & enforcement
  const validateCurrentLicense = () => {
    const violations: string[] = [];

    // Check 1: Pharmacy Name Binding
    if (currentLicense.pharmacy_name && pharmacyBranding.name.trim() !== currentLicense.pharmacy_name.trim()) {
      violations.push(`عدم تطابق اسم الصيدلية: المرخص (${currentLicense.pharmacy_name}) ≠ الفعلي (${pharmacyBranding.name})`);
    }

    // Check 2: Branch ID enforcement
    if (currentLicense.allowed_branch_ids && currentLicense.allowed_branch_ids.length > 0) {
      if (!currentLicense.allowed_branch_ids.includes(activeBranchId)) {
        violations.push(`الفرع الحالي (${activeBranch?.name || activeBranchId} [${activeBranchId}]) غير مصرّح به في مفتاح الترخيص المعتمد`);
      }
    }

    // Check 3: Expiry Date
    const now = new Date();
    const expiry = new Date(currentLicense.expires_at);
    if (now > expiry) {
      violations.push(`انتهت صلاحية مفتاح الترخيص بتاريخ ${currentLicense.expires_at}`);
    }

    // Check 4: Clock Tamper
    if (isClockTampered) {
      violations.push('كشف تراجع بساعة النظام المحلي (Clock Tamper Security Alert)');
    }

    const isCompliant = violations.length === 0;
    const message = isCompliant
      ? 'الترخيص متطابق وموثّق رسمياً مع هوية الصيدلية والفروع المسجلة.'
      : violations.join(' · ');

    return { isCompliant, message, violations };
  };

  const licenseValidationStatus = validateCurrentLicense();

  // Generator for Bound License
  const generateBoundLicense = (params: {
    pharmacyName: string;
    logoIcon: string;
    address: string;
    taxNo: string;
    phone: string;
    branches: { id: string; name: string }[];
    maxDevices: number;
    durationMonths: number;
    modules?: string[];
  }): License => {
    const startsAt = new Date().toISOString().split('T')[0];
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + params.durationMonths);
    const expiresAt = expDate.toISOString().split('T')[0];

    // Cryptographic-style deterministic Key based on Pharmacy Name + Branch IDs + Expiry
    const brandCode = Math.abs(params.pharmacyName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 9999).toString().padStart(4, '0');
    const branchHash = Math.abs(params.branches.map((b) => b.id).join('-').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 9999).toString().padStart(4, '0');
    const randomSalt = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `PHARM-${brandCode}-${branchHash}-${randomSalt}-${expDate.getFullYear()}`;

    const newLic: License = {
      id: `lic-${Date.now()}`,
      client_name: params.pharmacyName,
      license_key: licenseKey,
      pharmacy_name: params.pharmacyName,
      pharmacy_logo_icon: params.logoIcon,
      pharmacy_address: params.address,
      pharmacy_tax_no: params.taxNo,
      pharmacy_phone: params.phone,
      allowed_branch_ids: params.branches.map((b) => b.id),
      allowed_branch_names: params.branches.map((b) => b.name),
      signature_hash: `SIG-${brandCode}-${branchHash}-${Date.now().toString(36).toUpperCase()}`,
      max_devices: params.maxDevices,
      max_branches: params.branches.length,
      max_users: params.maxDevices * 3,
      starts_at: startsAt,
      expires_at: expiresAt,
      grace_days: 14,
      status: 'ACTIVE',
      devices: [
        {
          hw_fingerprint: currentDeviceHwid,
          device_name: 'جهاز محطة البيع المركزية 1',
          activated_at: startsAt,
          last_seen: new Date().toLocaleString('ar-SA'),
          status: 'ACTIVE'
        }
      ],
      modules: params.modules || ['POS', 'INVENTORY_FEFO', 'PURCHASING', 'PAYROLL', 'ACCOUNTING', 'ABC_ANALYSIS']
    };

    setAllLicenses((prev) => [newLic, ...prev]);
    addAuditLog(
      'LICENSE_KEY_GENERATED',
      'SECURITY',
      newLic.id,
      `توليد مفتاح ترخيص مقيّد للصيدلية: (${params.pharmacyName}) للفروع: [${newLic.allowed_branch_ids.join(', ')}]`
    );
    return newLic;
  };

  // Activate Bound License on current system
  const activateBoundLicense = (license: License, syncBrandingAndBranches: boolean = true) => {
    setCurrentLicense(license);

    if (syncBrandingAndBranches) {
      setPharmacyBranding((prev) => ({
        ...prev,
        name: license.pharmacy_name || prev.name,
        logo_icon: license.pharmacy_logo_icon || prev.logo_icon,
        address: license.pharmacy_address || prev.address,
        tax_no: license.pharmacy_tax_no || prev.tax_no,
        phone: license.pharmacy_phone || prev.phone
      }));

      if (license.allowed_branch_ids && license.allowed_branch_ids.length > 0) {
        const newBranches = license.allowed_branch_ids.map((id, idx) => ({
          id,
          name: license.allowed_branch_names?.[idx] || `فرع ${id}`,
          address: license.pharmacy_address || 'العنوان المسجل بالترخيص',
          phone: license.pharmacy_phone || '011-0000000',
          is_main: idx === 0
        }));
        setBranches(newBranches);
        setActiveBranchId(license.allowed_branch_ids[0]);
      }
    }

    addAuditLog(
      'LICENSE_ACTIVATED',
      'SYSTEM',
      license.id,
      `تفعيل وإنفاذ مفتاح الترخيص: ${license.license_key} على الصيدلية: ${license.pharmacy_name}`
    );

    return {
      success: true,
      message: `تم تفعيل الترخيص وإنفاذ المعرفات الفريدة للصيدلية (${license.pharmacy_name}) بنجاح.`
    };
  };

  // Stock helpers
  const getProductStockUnits = (productId: string, branchId = activeBranchId): number => {
    const productBatches = batches.filter((b) => b.product_id === productId);
    const batchIds = new Set(productBatches.map((b) => b.id));
    return stockLevels
      .filter((sl) => batchIds.has(sl.batch_id) && sl.branch_id === branchId)
      .reduce((sum, sl) => sum + sl.qty_units, 0);
  };

  const getProductStockBreakdown = (productId: string, branchId = activeBranchId) => {
    const prod = products.find((p) => p.id === productId);
    const totalUnits = getProductStockUnits(productId, branchId);
    if (!prod) return { boxes: 0, strips: 0, units: 0, displayString: '0' };

    const unitsPerBox = prod.packing.units_per_box || 1;
    const unitsPerStrip = prod.packing.units_per_strip || 1;

    const boxes = Math.floor(totalUnits / unitsPerBox);
    const remainderAfterBoxes = totalUnits % unitsPerBox;
    const strips = Math.floor(remainderAfterBoxes / unitsPerStrip);
    const units = remainderAfterBoxes % unitsPerStrip;

    const parts: string[] = [];
    if (boxes > 0) parts.push(`${boxes} علبة`);
    if (strips > 0) parts.push(`${strips} شريط`);
    if (units > 0 || parts.length === 0) parts.push(`${units} حبة`);

    return {
      boxes,
      strips,
      units,
      displayString: parts.join(' + ')
    };
  };

  const getBatchesForProduct = (productId: string) => {
    const prodBatches = batches.filter((b) => b.product_id === productId);
    return prodBatches.map((batch) => {
      const stock = stockLevels.find((sl) => sl.batch_id === batch.id && sl.branch_id === activeBranchId);
      return {
        ...batch,
        stockUnits: stock ? stock.qty_units : 0
      };
    });
  };

  // Add Product
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = { ...newProd, id };
    setProducts((prev) => [product, ...prev]);
    addAuditLog('CREATE', 'PRODUCT', id, `إضافة صنف جديد: ${product.trade_name}`);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addAuditLog('UPDATE', 'PRODUCT', updated.id, `تعديل صنف: ${updated.trade_name}`);
  };

  // Shift Management
  const openShift = (openingCash: number) => {
    const shift: Shift = {
      id: `shift-${Date.now()}`,
      branch_id: activeBranchId,
      cashier_id: 'emp-1',
      cashier_name: currentUserName,
      opened_at: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      opening_cash: openingCash,
      cash_sales: 0,
      card_sales: 0,
      credit_sales: 0,
      status: 'OPEN'
    };
    setActiveShift(shift);
    addAuditLog('OPEN_SHIFT', 'SHIFT', shift.id, `فتح وردية جديدة بمبلغ افتتاحي ${openingCash} ر.س`);
  };

  const closeShift = (countedCash: number): Shift => {
    if (!activeShift) throw new Error('لا توجد وردية مفتوحة');
    const expected = activeShift.opening_cash + activeShift.cash_sales;
    const diff = countedCash - expected;
    const closed: Shift = {
      ...activeShift,
      closed_at: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      counted_cash: countedCash,
      expected_cash: expected,
      status: 'CLOSED'
    };
    setActiveShift(null);
    addAuditLog('CLOSE_SHIFT', 'SHIFT', closed.id, `إغلاق الوردية. الفرق: ${diff} ر.س`);
    return closed;
  };

  // Double-entry helper
  const addJournalEntry = (
    refType: string,
    refId: string,
    description: string,
    lines: { accountId?: string; account_id?: string; accountName?: string; account_name?: string; debit: number; credit: number }[]
  ) => {
    const formattedLines = lines.map((l) => ({
      account_id: l.account_id || l.accountId || '',
      account_name: l.account_name || l.accountName || '',
      debit: l.debit,
      credit: l.credit
    }));

    const totalDebit = formattedLines.reduce((acc, l) => acc + l.debit, 0);
    const totalCredit = formattedLines.reduce((acc, l) => acc + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      console.error('Unbalanced Journal Entry Attempted:', formattedLines);
    }
    const entry: JournalEntry = {
      id: `je-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      ref_type: refType,
      ref_id: refId,
      description,
      lines: formattedLines,
      total: totalDebit
    };
    setJournalEntries((prev) => [entry, ...prev]);

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        const line = formattedLines.find((l) => l.account_id === acc.id);
        if (!line) return acc;
        const delta =
          acc.type === 'ASSET' || acc.type === 'EXPENSE'
            ? line.debit - line.credit
            : line.credit - line.debit;
        return { ...acc, balance: acc.balance + delta };
      })
    );
  };

  // POS Complete Sale
  const executeSale = async (saleData: {
    lines: SaleLine[];
    customerId?: string;
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    paidAmount: number;
    changeAmount: number;
    controlledInfo?: ControlledDrugInfo;
  }): Promise<Sale> => {
    if (!activeShift) {
      throw new Error('POS-01: لا يمكن إتمام عملية البيع بدون وردية مفتوحة.');
    }

    // Verify stock and check expiry on all lines
    const today = new Date().toISOString().split('T')[0];
    for (const line of saleData.lines) {
      const batch = batches.find((b) => b.id === line.batch_id);
      if (!batch) throw new Error(`الدفعة غير موجودة للصنف ${line.product_id}`);
      if (batch.expiry_date < today) {
        throw new Error(`INV-05: يُمنع تمامًا بيع الصنف منتهي الصلاحية! الدفعة: ${batch.batch_no}`);
      }
      const sl = stockLevels.find((s) => s.batch_id === line.batch_id && s.branch_id === activeBranchId);
      if (!sl || sl.qty_units < line.qty_units) {
        throw new Error(`الرصيد غير كافٍ للدفعة ${batch.batch_no}`);
      }
    }

    const saleId = `sale-${Date.now()}`;
    const docNo = `INV-${activeBranchId.toUpperCase()}-${sales.length + 1001}`;

    const newSale: Sale = {
      id: saleId,
      doc_no: docNo,
      branch_id: activeBranchId,
      customer_id: saleData.customerId,
      shift_id: activeShift.id,
      cashier_name: currentUserName,
      created_at: new Date().toLocaleString('ar-SA'),
      lines: saleData.lines,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      tax: 0,
      total: saleData.total,
      payment_method: saleData.paymentMethod,
      paid_amount: saleData.paidAmount,
      change_amount: saleData.changeAmount,
      controlled_info: saleData.controlledInfo,
      status: 'COMPLETED'
    };

    // 1. Deduct Stock Levels & Create Stock Movements
    let totalCogs = 0;
    const newMovements: StockMovement[] = [];

    setStockLevels((prev) =>
      prev.map((sl) => {
        const soldInThisBatch = saleData.lines
          .filter((l) => l.batch_id === sl.batch_id && sl.branch_id === activeBranchId)
          .reduce((sum, l) => sum + l.qty_units, 0);

        if (soldInThisBatch > 0) {
          return { ...sl, qty_units: sl.qty_units - soldInThisBatch };
        }
        return sl;
      })
    );

    saleData.lines.forEach((l) => {
      const lineCost = l.unit_cost * l.qty_units;
      totalCogs += lineCost;

      newMovements.push({
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batch_id: l.batch_id,
        product_id: l.product_id,
        branch_id: activeBranchId,
        type: 'SALE',
        qty_units: -l.qty_units,
        unit_cost: l.unit_cost,
        ref_type: 'SALE',
        ref_id: saleId,
        reason: `فاتورة مبيعات ${docNo}`,
        user_id: activeShift.cashier_id,
        timestamp: new Date().toISOString()
      });
    });

    setStockMovements((prev) => [...newMovements, ...prev]);

    // 2. Accounting Journal Entry (ACC-01)
    const journalLines: { account_id: string; account_name: string; debit: number; credit: number }[] = [];

    // Debit payment method
    if (saleData.paymentMethod === 'CASH') {
      journalLines.push({
        account_id: 'acc-101',
        account_name: 'الصندوق الرئيسي',
        debit: saleData.total,
        credit: 0
      });
    } else if (saleData.paymentMethod === 'CARD') {
      journalLines.push({
        account_id: 'acc-102',
        account_name: 'البنك - الحساب الجاري',
        debit: saleData.total,
        credit: 0
      });
    } else if (saleData.paymentMethod === 'CREDIT' && saleData.customerId) {
      journalLines.push({
        account_id: 'acc-104',
        account_name: 'ذمم العملاء المدينة (الآجل)',
        debit: saleData.total,
        credit: 0
      });
      // update customer debt
      setCustomers((prev) =>
        prev.map((c) => (c.id === saleData.customerId ? { ...c, current_balance: c.current_balance + saleData.total } : c))
      );
    }

    // Credit Sales Revenue
    journalLines.push({
      account_id: 'acc-401',
      account_name: 'إيرادات مبيعات الأدوية',
      debit: 0,
      credit: saleData.total
    });

    // Debit COGS & Credit Stock Inventory
    journalLines.push({
      account_id: 'acc-501',
      account_name: 'تكلفة البضاعة المباعة (COGS)',
      debit: totalCogs,
      credit: 0
    });
    journalLines.push({
      account_id: 'acc-103',
      account_name: 'مخزون الأدوية والمستلزمات',
      debit: 0,
      credit: totalCogs
    });

    addJournalEntry('SALE', saleId, `قيد مبيعات الفاتورة ${docNo}`, journalLines);

    // 3. Update shift sales stats
    setActiveShift((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        cash_sales: saleData.paymentMethod === 'CASH' ? prev.cash_sales + saleData.total : prev.cash_sales,
        card_sales: saleData.paymentMethod === 'CARD' ? prev.card_sales + saleData.total : prev.card_sales,
        credit_sales: saleData.paymentMethod === 'CREDIT' ? prev.credit_sales + saleData.total : prev.credit_sales
      };
    });

    // 4. Save sale
    setSales((prev) => [newSale, ...prev]);

    // Handle offline queue count
    if (isOffline) {
      setPendingSyncCount((prev) => prev + 1);
    }

    addAuditLog('SALE', 'SALE', saleId, `إتمام فاتورة مبيعات ${docNo} بإجمالي ${saleData.total} ر.س`);
    return newSale;
  };

  // Return sale line (POS-03)
  const returnSaleLine = (saleId: string, lineId: string, qtyUnits: number, reason: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    const line = sale.lines.find((l) => l.id === lineId);
    if (!line) return;

    // Return to same batch (POS-03)
    setStockLevels((prev) =>
      prev.map((sl) => (sl.batch_id === line.batch_id && sl.branch_id === sale.branch_id ? { ...sl, qty_units: sl.qty_units + qtyUnits } : sl))
    );

    // Record movement
    const movement: StockMovement = {
      id: `mov-ret-${Date.now()}`,
      batch_id: line.batch_id,
      product_id: line.product_id,
      branch_id: sale.branch_id,
      type: 'SALE_RETURN',
      qty_units: qtyUnits,
      unit_cost: line.unit_cost,
      ref_type: 'SALE_RETURN',
      ref_id: saleId,
      reason: `مرتجع مبيعات: ${reason}`,
      user_id: 'usr-1',
      timestamp: new Date().toISOString()
    };
    setStockMovements((prev) => [movement, ...prev]);

    const refundAmount = (line.line_total / line.qty_units) * qtyUnits;
    const costRefund = line.unit_cost * qtyUnits;

    // Reverse journal entry
    addJournalEntry('SALE_RETURN', saleId, `قيد مرتجع مبيعات للفاتورة ${sale.doc_no}`, [
      { account_id: 'acc-401', account_name: 'مردودات مبيعات الأدوية', debit: refundAmount, credit: 0 },
      { account_id: 'acc-101', account_name: 'الصندوق الرئيسي', debit: 0, credit: refundAmount },
      { account_id: 'acc-103', account_name: 'مخزون الأدوية والمستلزمات', debit: costRefund, credit: 0 },
      { account_id: 'acc-501', account_name: 'تكلفة البضاعة المباعة', debit: 0, credit: costRefund }
    ]);

    addAuditLog('RETURN', 'SALE', saleId, `مرتجع ${qtyUnits} حبة للصنف ${line.product_id}`);
  };

  // Held sales
  const holdCurrentSale = (lines: SaleLine[], note: string, customerName?: string) => {
    const held: HeldSale = {
      id: `held-${Date.now()}`,
      held_at: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      note: note || 'فاتورة معلقة',
      cashier_name: currentUserName,
      customer_name: customerName,
      lines
    };
    setHeldSales((prev) => [held, ...prev]);
    addAuditLog('HOLD_SALE', 'SALE', held.id, `تعليق فاتورة تتضمن ${lines.length} صنف`);
  };

  const restoreHeldSale = (heldSaleId: string): HeldSale | undefined => {
    const item = heldSales.find((h) => h.id === heldSaleId);
    if (item) {
      setHeldSales((prev) => prev.filter((h) => h.id !== heldSaleId));
    }
    return item;
  };

  const deleteHeldSale = (heldSaleId: string) => {
    setHeldSales((prev) => prev.filter((h) => h.id !== heldSaleId));
  };

  // Goods receipt (Purchasing)
  const receiveGoods = (receiptData: Omit<GoodsReceipt, 'id' | 'doc_no'>) => {
    const receiptId = `gr-${Date.now()}`;
    const docNo = `GR-${receiptData.branch_id.toUpperCase()}-${goodsReceipts.length + 101}`;

    const newBatches: Batch[] = [];
    const newMovements: StockMovement[] = [];

    receiptData.lines.forEach((line) => {
      const prod = products.find((p) => p.id === line.product_id);
      const unitsPerBox = prod?.packing.units_per_box || 1;
      const totalBoxes = line.qty_boxes + line.bonus_boxes;
      const totalUnits = totalBoxes * unitsPerBox;

      let existingBatch = batches.find(
        (b) => b.product_id === line.product_id && b.batch_no === line.batch_no && b.expiry_date === line.expiry_date
      );

      let batchId = existingBatch?.id;
      if (!batchId) {
        batchId = `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const batch: Batch = {
          id: batchId,
          product_id: line.product_id,
          batch_no: line.batch_no,
          mfg_date: new Date().toISOString().split('T')[0],
          expiry_date: line.expiry_date,
          cost_per_box: line.cost_per_box,
          supplier_id: receiptData.supplier_id,
          received_at: receiptData.receipt_date,
          status: 'ACTIVE'
        };
        newBatches.push(batch);
      }

      newMovements.push({
        id: `mov-gr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batch_id: batchId,
        product_id: line.product_id,
        branch_id: receiptData.branch_id,
        type: 'PURCHASE',
        qty_units: totalUnits,
        unit_cost: line.cost_per_box / unitsPerBox,
        ref_type: 'GOODS_RECEIPT',
        ref_id: receiptId,
        reason: `استلام بضاعة ${docNo}`,
        user_id: 'usr-1',
        timestamp: new Date().toISOString()
      });

      // Update Stock level
      setStockLevels((prev) => {
        const idx = prev.findIndex((sl) => sl.batch_id === batchId && sl.branch_id === receiptData.branch_id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], qty_units: updated[idx].qty_units + totalUnits };
          return updated;
        } else {
          return [...prev, { batch_id: batchId!, branch_id: receiptData.branch_id, qty_units: totalUnits, reserved_units: 0 }];
        }
      });
    });

    if (newBatches.length > 0) {
      setBatches((prev) => [...prev, ...newBatches]);
    }
    setStockMovements((prev) => [...newMovements, ...prev]);

    // Update supplier balance
    setSuppliers((prev) =>
      prev.map((s) => (s.id === receiptData.supplier_id ? { ...s, balance: s.balance + receiptData.total_amount } : s))
    );

    // Journal Entry
    addJournalEntry('PURCHASE', receiptId, `قيد فاتورة شراء واستلام بضاعة ${docNo}`, [
      { account_id: 'acc-103', account_name: 'مخزون الأدوية والمستلزمات', debit: receiptData.total_amount, credit: 0 },
      { account_id: 'acc-201', account_name: 'ذمم الموردين الدائنة', debit: 0, credit: receiptData.total_amount }
    ]);

    const fullReceipt: GoodsReceipt = {
      ...receiptData,
      id: receiptId,
      doc_no: docNo
    };

    setGoodsReceipts((prev) => [fullReceipt, ...prev]);
    addAuditLog('PURCHASE', 'GOODS_RECEIPT', receiptId, `استلام شحنة أدوية ${docNo} بقيمة ${receiptData.total_amount} ر.س`);
  };

  // Pay Supplier
  const paySupplier = (supplierId: string, amount: number, paymentAccountId: string) => {
    setSuppliers((prev) => prev.map((s) => (s.id === supplierId ? { ...s, balance: Math.max(0, s.balance - amount) } : s)));
    const supplier = suppliers.find((s) => s.id === supplierId);

    addJournalEntry('SUPPLIER_PAYMENT', `sp-${Date.now()}`, `سداد دفعة للمورد: ${supplier?.name}`, [
      { account_id: 'acc-201', account_name: 'ذمم الموردين الدائنة', debit: amount, credit: 0 },
      { account_id: paymentAccountId, account_name: 'الصندوق / البنك', debit: 0, credit: amount }
    ]);

    addAuditLog('PAYMENT', 'SUPPLIER', supplierId, `سداد مبلغ ${amount} ر.س للمورد ${supplier?.name}`);
  };

  // Customer debt payment
  const payCustomerDebt = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, current_balance: Math.max(0, c.current_balance - amount) } : c))
    );
    const customer = customers.find((c) => c.id === customerId);

    addJournalEntry('CUSTOMER_PAYMENT', `cp-${Date.now()}`, `سداد دين من العميل: ${customer?.name}`, [
      { account_id: 'acc-101', account_name: 'الصندوق الرئيسي', debit: amount, credit: 0 },
      { account_id: 'acc-104', account_name: 'ذمم العملاء المدينة (الآجل)', debit: 0, credit: amount }
    ]);

    addAuditLog('PAYMENT', 'CUSTOMER', customerId, `استلام دفعة سداد دين ${amount} ر.س من العميل ${customer?.name}`);
  };

  // Add customer
  const addCustomer = (newCust: Omit<Customer, 'id' | 'current_balance'>) => {
    const id = `cust-${Date.now()}`;
    const cust: Customer = { ...newCust, id, current_balance: 0 };
    setCustomers((prev) => [cust, ...prev]);
    addAuditLog('CREATE', 'CUSTOMER', id, `إضافة ملف عميل: ${cust.name}`);
  };

  // Stocktake settlement
  const settleStocktake = (adjustments: { batch_id: string; product_id: string; diff_units: number; cost_per_unit: number; reason: string }[]) => {
    let totalCostImpact = 0;
    const movements: StockMovement[] = [];

    adjustments.forEach((adj) => {
      setStockLevels((prev) =>
        prev.map((sl) => (sl.batch_id === adj.batch_id && sl.branch_id === activeBranchId ? { ...sl, qty_units: sl.qty_units + adj.diff_units } : sl))
      );

      const impact = adj.diff_units * adj.cost_per_unit;
      totalCostImpact += impact;

      movements.push({
        id: `mov-adj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batch_id: adj.batch_id,
        product_id: adj.product_id,
        branch_id: activeBranchId,
        type: 'ADJUSTMENT',
        qty_units: adj.diff_units,
        unit_cost: adj.cost_per_unit,
        ref_type: 'STOCKTAKE',
        ref_id: `st-${Date.now()}`,
        reason: adj.reason || 'تسوية جرد دوري معتمد',
        user_id: 'usr-1',
        timestamp: new Date().toISOString()
      });
    });

    setStockMovements((prev) => [...movements, ...prev]);

    if (Math.abs(totalCostImpact) > 0) {
      if (totalCostImpact < 0) {
        addJournalEntry('STOCK_ADJUSTMENT', `st-${Date.now()}`, 'تسوية عجز جرد مخزني', [
          { account_id: 'acc-604', account_name: 'خسائر تسوية جرد وعجز المخزون', debit: Math.abs(totalCostImpact), credit: 0 },
          { account_id: 'acc-103', account_name: 'مخزون الأدوية والمستلزمات', debit: 0, credit: Math.abs(totalCostImpact) }
        ]);
      } else {
        addJournalEntry('STOCK_ADJUSTMENT', `st-${Date.now()}`, 'تسوية فائض جرد مخزني', [
          { account_id: 'acc-103', account_name: 'مخزون الأدوية والمستلزمات', debit: totalCostImpact, credit: 0 },
          { account_id: 'acc-401', account_name: 'أرباح تسويات المخزون (فائض)', debit: 0, credit: totalCostImpact }
        ]);
      }
    }

    addAuditLog('STOCKTAKE', 'INVENTORY', `st-${Date.now()}`, `اعتماد محضر تسوية جرد لـ ${adjustments.length} صنف`);
  };

  // Write off batch (Damage / Expiry)
  const writeOffBatch = (batchId: string, qtyUnits: number, reason: 'EXPIRED' | 'DAMAGED' | 'SPOILED') => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;
    const prod = products.find((p) => p.id === batch.product_id);
    const unitsPerBox = prod?.packing.units_per_box || 1;
    const unitCost = batch.cost_per_box / unitsPerBox;
    const totalLoss = unitCost * qtyUnits;

    // Deduct stock
    setStockLevels((prev) =>
      prev.map((sl) => {
        if (sl.batch_id === batchId && sl.branch_id === activeBranchId) {
          const newQty = Math.max(0, sl.qty_units - qtyUnits);
          return { ...sl, qty_units: newQty };
        }
        return sl;
      })
    );

    // Update batch status
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: reason === 'EXPIRED' ? 'EXPIRED' : 'QUARANTINE' } : b))
    );

    // Record movement
    const movement: StockMovement = {
      id: `mov-wo-${Date.now()}`,
      batch_id: batchId,
      product_id: batch.product_id,
      branch_id: activeBranchId,
      type: reason === 'EXPIRED' ? 'EXPIRED_WRITEOFF' : 'DAMAGE',
      qty_units: -qtyUnits,
      unit_cost: unitCost,
      ref_type: 'WRITEOFF',
      ref_id: `wo-${Date.now()}`,
      reason: `محضر إتلاف رسمي: ${reason === 'EXPIRED' ? 'انتهاء الصلاحية' : 'تلف فيزيائي/كسر'}`,
      user_id: 'usr-1',
      timestamp: new Date().toISOString()
    };
    setStockMovements((prev) => [movement, ...prev]);

    // Financial entry: Debit Write-off Loss (604), Credit Inventory (103)
    addJournalEntry('WRITEOFF', `wo-${Date.now()}`, `قيد خسائر إتلاف أدوية (${reason})`, [
      { account_id: 'acc-604', account_name: 'خسائر إتلاف الأدوية المنتهية والتالفة', debit: totalLoss, credit: 0 },
      { account_id: 'acc-103', account_name: 'مخزون الأدوية والمستلزمات', debit: 0, credit: totalLoss }
    ]);

    addAuditLog('WRITEOFF', 'BATCH', batchId, `إتلاف ${qtyUnits} حبة من الدفعة ${batch.batch_no} بقيمة خسارة ${totalLoss} ر.س`);
  };

  // Inter-branch stock transfer
  const transferStockBetweenBranches = (
    fromBranchId: string,
    toBranchId: string,
    batchId: string,
    productId: string,
    qtyUnits: number
  ) => {
    setStockLevels((prev) =>
      prev.map((sl) => (sl.batch_id === batchId && sl.branch_id === fromBranchId ? { ...sl, qty_units: Math.max(0, sl.qty_units - qtyUnits) } : sl))
    );

    setStockLevels((prev) => {
      const idx = prev.findIndex((sl) => sl.batch_id === batchId && sl.branch_id === toBranchId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty_units: updated[idx].qty_units + qtyUnits };
        return updated;
      } else {
        return [...prev, { batch_id: batchId, branch_id: toBranchId, qty_units: qtyUnits, reserved_units: 0 }];
      }
    });

    const transferId = `tr-${Date.now()}`;
    const batch = batches.find((b) => b.id === batchId);
    const prod = products.find((p) => p.id === productId);
    const unitCost = (batch?.cost_per_box || 0) / (prod?.packing.units_per_box || 1);

    const movOut: StockMovement = {
      id: `mov-tro-${Date.now()}`,
      batch_id: batchId,
      product_id: productId,
      branch_id: fromBranchId,
      type: 'TRANSFER_OUT',
      qty_units: -qtyUnits,
      unit_cost: unitCost,
      ref_type: 'TRANSFER',
      ref_id: transferId,
      reason: `تحويل صادر إلى ${branches.find((b) => b.id === toBranchId)?.name}`,
      user_id: 'usr-1',
      timestamp: new Date().toISOString()
    };
    const movIn: StockMovement = {
      id: `mov-tri-${Date.now()}`,
      batch_id: batchId,
      product_id: productId,
      branch_id: toBranchId,
      type: 'TRANSFER_IN',
      qty_units: qtyUnits,
      unit_cost: unitCost,
      ref_type: 'TRANSFER',
      ref_id: transferId,
      reason: `تحويل وارد من ${branches.find((b) => b.id === fromBranchId)?.name}`,
      user_id: 'usr-1',
      timestamp: new Date().toISOString()
    };

    setStockMovements((prev) => [movIn, movOut, ...prev]);
    addAuditLog('TRANSFER', 'STOCK', transferId, `تحويل مخزني: ${qtyUnits} حبة من ${fromBranchId} إلى ${toBranchId}`);
  };

  // Missed demand logging
  const logMissedDemand = (productName: string, requestedQty: number, notes?: string) => {
    const item: MissedDemand = {
      id: `md-${Date.now()}`,
      product_name: productName,
      requested_qty: requestedQty,
      timestamp: new Date().toLocaleString('ar-SA'),
      notes,
      branch_id: activeBranchId
    };
    setMissedDemands((prev) => [item, ...prev]);
    addAuditLog('MISSED_DEMAND', 'PRODUCT', productName, `تسجيل طلب ضائع: ${productName} (الكمية: ${requestedQty})`);
  };

  // Expenses
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const expense: Expense = { ...expenseData, id: `exp-${Date.now()}` };
    setExpenses((prev) => [expense, ...prev]);

    addJournalEntry('EXPENSE', expense.id, `سند صرف: ${expense.category} - ${expense.description}`, [
      { account_id: 'acc-602', account_name: `مصروفات تشغيلية (${expense.category})`, debit: expense.amount, credit: 0 },
      { account_id: expense.payment_account, account_name: 'الصندوق / البنك', debit: 0, credit: expense.amount }
    ]);

    addAuditLog('EXPENSE', 'EXPENSE', expense.id, `تسجيل سند صرف بقيمة ${expense.amount} ر.س (${expense.category})`);
  };

  // Profit Metrics calculation
  const calculateProfitMetrics = () => {
    const grossRevenue = sales.reduce((sum, s) => sum + s.total, 0) + 48600;
    let cogs = 32100;
    sales.forEach((s) => {
      s.lines.forEach((l) => {
        cogs += l.unit_cost * l.qty_units;
      });
    });
    const grossProfit = grossRevenue - cogs;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) + 32900;
    const writeoffLosses = 950;
    const netProfit = grossProfit - totalExpenses - writeoffLosses;
    const profitMarginPct = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      cogs,
      grossProfit,
      totalExpenses,
      writeoffLosses,
      netProfit,
      profitMarginPct
    };
  };

  // HR Payroll
  const createPayrollRun = (month: string): PayrollRun => {
    const lines = employees.map((emp) => {
      const allowances = 500;
      const overtime = 350;
      const deductions = 100;
      const advances = 250;
      const net = emp.base_salary + allowances + overtime - deductions - advances;
      return {
        employee_id: emp.id,
        employee_name: emp.full_name,
        base_salary: emp.base_salary,
        allowances,
        overtime,
        deductions,
        advances,
        net_salary: net
      };
    });
    const totalNet = lines.reduce((sum, l) => sum + l.net_salary, 0);
    const run: PayrollRun = {
      id: `pr-${Date.now()}`,
      month,
      status: 'DRAFT',
      total_net: totalNet,
      lines
    };
    setPayrollRuns((prev) => [run, ...prev]);
    return run;
  };

  const approvePayrollRun = (runId: string) => {
    const run = payrollRuns.find((r) => r.id === runId);
    if (!run) return;

    setPayrollRuns((prev) => prev.map((r) => (r.id === runId ? { ...r, status: 'APPROVED', approved_at: new Date().toISOString() } : r)));

    addJournalEntry('PAYROLL', runId, `اعتماد مسير رواتب شهر ${run.month}`, [
      { account_id: 'acc-603', account_name: 'مصروفات الرواتب والأجور', debit: run.total_net, credit: 0 },
      { account_id: 'acc-102', account_name: 'البنك - الحساب الجاري', debit: 0, credit: run.total_net }
    ]);

    addAuditLog('PAYROLL', 'HR', runId, `اعتماد مسير رواتب شهر ${run.month} بإجمالي ${run.total_net} ر.س`);
  };

  // Developer Portal License Operations
  const updateLicenseStatus = (licenseId: string, status: License['status']) => {
    setAllLicenses((prev) => prev.map((lic) => (lic.id === licenseId ? { ...lic, status } : lic)));
    if (currentLicense.id === licenseId) {
      setCurrentLicense((prev) => ({ ...prev, status }));
    }
    addAuditLog('LICENSE_STATUS_CHANGE', 'LICENSE', licenseId, `تغيير حالة الترخيص إلى ${status}`);
  };

  const renewLicense = (licenseId: string, additionalMonths: number) => {
    setAllLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id === licenseId) {
          const currentExp = new Date(lic.expires_at);
          currentExp.setMonth(currentExp.getMonth() + additionalMonths);
          const updated = { ...lic, expires_at: currentExp.toISOString().split('T')[0], status: 'ACTIVE' as const };
          if (currentLicense.id === licenseId) setCurrentLicense(updated);
          return updated;
        }
        return lic;
      })
    );
    addAuditLog('LICENSE_RENEWAL', 'LICENSE', licenseId, `تجديد ترخيص العميل لمدة ${additionalMonths} شهر`);
  };

  const revokeDevice = (licenseId: string, hwFingerprint: string) => {
    setAllLicenses((prev) =>
      prev.map((lic) => {
        if (lic.id === licenseId) {
          const updated = {
            ...lic,
            devices: lic.devices.map((d) => (d.hw_fingerprint === hwFingerprint ? { ...d, status: 'REVOKED' as const } : d))
          };
          if (currentLicense.id === licenseId) setCurrentLicense(updated);
          return updated;
        }
        return lic;
      })
    );
    addAuditLog('DEVICE_REVOKED', 'LICENSE', licenseId, `إلغاء تفعيل وتجريد الجهاز ${hwFingerprint}`);
  };

  const createNewLicense = (newLic: Partial<License>) => {
    const id = `lic-${Date.now()}`;
    const lic: License = {
      id,
      client_name: newLic.client_name || 'صيدلية جديدة',
      pharmacy_name: newLic.pharmacy_name || newLic.client_name || 'صيدلية جديدة',
      pharmacy_logo_icon: newLic.pharmacy_logo_icon || 'pill',
      pharmacy_address: newLic.pharmacy_address || 'المملكة العربية السعودية',
      pharmacy_tax_no: newLic.pharmacy_tax_no || '300000000000003',
      pharmacy_phone: newLic.pharmacy_phone || '011-0000000',
      allowed_branch_ids: newLic.allowed_branch_ids || ['BR-01', 'BR-02'],
      allowed_branch_names: newLic.allowed_branch_names || ['الفرع الرئيسي'],
      license_key: `PHARM-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`,
      max_devices: newLic.max_devices || 3,
      max_branches: newLic.max_branches || 1,
      max_users: newLic.max_users || 5,
      starts_at: new Date().toISOString().split('T')[0],
      expires_at: newLic.expires_at || '2027-10-01',
      grace_days: 14,
      status: 'ACTIVE',
      devices: [],
      modules: newLic.modules || ['POS', 'INVENTORY_FEFO', 'PURCHASING', 'ACCOUNTING']
    };
    setAllLicenses((prev) => [lic, ...prev]);
    addAuditLog('LICENSE_ISSUED', 'LICENSE', id, `إصدار ترخيص جديد للعميل: ${lic.client_name}`);
  };

  // Trigger offline sync
  const triggerSync = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPendingSyncCount(0);
    setIsSyncing(false);
    addAuditLog('SYNC', 'SYSTEM', 'central-server', 'تمت مزامنة العمليات المحلية مع السيرفر المركزي بنجاح');
  };

  // Reorder metrics & ABC classification
  const reorderMetrics: ReorderMetric[] = products.map((prod) => {
    const stockUnits = getProductStockUnits(prod.id, activeBranchId);
    const unitsPerBox = prod.packing.units_per_box || 1;

    let ads = 8;
    if (prod.id === 'prod-1') ads = 26;
    if (prod.id === 'prod-2') ads = 12;
    if (prod.id === 'prod-3') ads = 15;
    if (prod.id === 'prod-4') ads = 22;

    const coverDays = ads > 0 ? Math.floor(stockUnits / ads) : 999;
    const safetyDays = 5;
    const safetyStockUnits = ads * safetyDays;
    const ropUnits = ads * prod.lead_time_days + safetyStockUnits;
    const targetCycleDays = 30;
    const targetStock = ads * targetCycleDays + safetyStockUnits;
    const deficitUnits = Math.max(0, targetStock - stockUnits);
    const suggestedBoxes = Math.ceil(deficitUnits / unitsPerBox);

    let abcClass: 'A' | 'B' | 'C' = 'C';
    if (ads >= 20 || prod.id === 'prod-1' || prod.id === 'prod-4') abcClass = 'A';
    else if (ads >= 10 || prod.id === 'prod-2' || prod.id === 'prod-3') abcClass = 'B';

    return {
      product_id: prod.id,
      abc_class: abcClass,
      ads,
      current_stock_units: stockUnits,
      cover_days: coverDays,
      safety_stock_units: safetyStockUnits,
      rop_units: ropUnits,
      suggested_order_boxes: suggestedBoxes
    };
  });

  return (
    <PharmacyContext.Provider
      value={{
        activeBranchId,
        setActiveBranchId,
        activeBranch,
        branches,
        currentRole,
        setCurrentRole,
        currentUserName,
        theme,
        setTheme,
        colorTheme,
        setColorTheme,
        lang,
        setLang,
        pharmacyBranding,
        setPharmacyBranding,
        clientEditions,
        deployClientEdition,
        createNewClientEdition,
        isShortcutsOpen,
        setIsShortcutsOpen,
        isOffline,
        setIsOffline,
        pendingSyncCount,
        triggerSync,
        isSyncing,
        currentLicense,
        currentDeviceHwid,
        isClockTampered,
        simulateClockTamper,
        resetClockTamper,
        licenseValidationStatus,
        generateBoundLicense,
        activateBoundLicense,
        allLicenses,
        updateLicenseStatus,
        renewLicense,
        revokeDevice,
        createNewLicense,
        products,
        batches,
        stockLevels,
        stockMovements,
        getProductStockUnits,
        getProductStockBreakdown,
        getBatchesForProduct,
        addProduct,
        updateProduct,
        activeShift,
        openShift,
        closeShift,
        sales,
        heldSales,
        holdCurrentSale,
        restoreHeldSale,
        deleteHeldSale,
        executeSale,
        returnSaleLine,
        suppliers,
        goodsReceipts,
        receiveGoods,
        paySupplier,
        customers,
        addCustomer,
        payCustomerDebt,
        settleStocktake,
        writeOffBatch,
        transferStockBetweenBranches,
        missedDemands,
        logMissedDemand,
        dismissedExpiryBatchIds,
        dismissExpiryAlert,
        accounts,
        journalEntries,
        expenses,
        addExpense,
        calculateProfitMetrics,
        employees,
        payrollRuns,
        createPayrollRun,
        approvePayrollRun,
        reorderMetrics,
        auditLogs,
        addAuditLog
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
