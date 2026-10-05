import {
  Product,
  Batch,
  StockLevel,
  Supplier,
  Customer,
  InsuranceCompany,
  Employee,
  Account,
  Branch,
  License,
  Expense,
  MissedDemand
} from '../types/pharmacy';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-1',
    name: 'الفرع الرئيسي - شارع الجامعة',
    address: 'شارع الملك فهد، مقابل المستشفى التخصصي',
    phone: '011-4567890',
    is_main: true
  },
  {
    id: 'br-2',
    name: 'فرع 2 - حي النور',
    address: 'شارع النخيل، بجانب المركز الطبي',
    phone: '011-8976543',
    is_main: false
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    trade_name: 'بنادول إكسترا (Panadol Extra)',
    generic_name: 'Paracetamol + Caffeine',
    active_ingredient: 'Paracetamol 500mg, Caffeine 65mg',
    strength: '500mg/65mg',
    form: 'أقراص مغلفة',
    category: 'مسكنات وخافض حرارة',
    manufacturer: 'GSK',
    product_type: 'normal',
    shelf_location: 'رف A-12',
    min_qty_boxes: 10,
    max_qty_boxes: 100,
    lead_time_days: 2,
    barcode: '628100100101',
    is_active: true,
    packing: {
      strips_per_box: 2,
      units_per_strip: 12,
      units_per_box: 24,
      price_box: 18.0,
      price_strip: 9.5,
      price_unit: 1.0,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: true
    }
  },
  {
    id: 'prod-2',
    trade_name: 'أوجمنتين 1 جم (Augmentin 1g)',
    generic_name: 'Amoxicillin + Clavulanate Potassium',
    active_ingredient: 'Amoxicillin 875mg, Clavulanic Acid 125mg',
    strength: '1000mg',
    form: 'أقراص قابلة للبلع',
    category: 'مضادات حيوية',
    manufacturer: 'GlaxoSmithKline',
    product_type: 'prescription',
    shelf_location: 'رف B-04',
    min_qty_boxes: 8,
    max_qty_boxes: 60,
    lead_time_days: 3,
    barcode: '628100200202',
    is_active: true,
    packing: {
      strips_per_box: 2,
      units_per_strip: 7,
      units_per_box: 14,
      price_box: 62.0,
      price_strip: 32.0,
      price_unit: 5.0,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: false
    }
  },
  {
    id: 'prod-3',
    trade_name: 'كونكور 5 مجم (Concor 5mg)',
    generic_name: 'Bisoprolol Fumarate',
    active_ingredient: 'Bisoprolol',
    strength: '5mg',
    form: 'أقراص',
    category: 'أدوية القلب والضغط',
    manufacturer: 'Merck Serono',
    product_type: 'prescription',
    shelf_location: 'رف C-01 (أمراض مزمنة)',
    min_qty_boxes: 15,
    max_qty_boxes: 80,
    lead_time_days: 4,
    barcode: '628100300303',
    is_active: true,
    packing: {
      strips_per_box: 3,
      units_per_strip: 10,
      units_per_box: 30,
      price_box: 41.5,
      price_strip: 14.5,
      price_unit: 1.5,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: true
    }
  },
  {
    id: 'prod-4',
    trade_name: 'جلوكوفاج 1000 مجم (Glucophage 1000mg)',
    generic_name: 'Metformin Hydrochloride',
    active_ingredient: 'Metformin',
    strength: '1000mg',
    form: 'أقراص ممتدة المفعول',
    category: 'أدوية السكري',
    manufacturer: 'Merck',
    product_type: 'prescription',
    shelf_location: 'رف C-05 (أمراض مزمنة)',
    min_qty_boxes: 20,
    max_qty_boxes: 120,
    lead_time_days: 2,
    barcode: '628100400404',
    is_active: true,
    packing: {
      strips_per_box: 3,
      units_per_strip: 10,
      units_per_box: 30,
      price_box: 28.0,
      price_strip: 10.0,
      price_unit: 1.0,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: false
    }
  },
  {
    id: 'prod-5',
    trade_name: 'نيكسيوم 40 مجم (Nexium 40mg)',
    generic_name: 'Esomeprazole Magnesium',
    active_ingredient: 'Esomeprazole',
    strength: '40mg',
    form: 'أقراص مقاومة لإفراز المعدة',
    category: 'الجهاز الهضمي والمعدة',
    manufacturer: 'AstraZeneca',
    product_type: 'normal',
    shelf_location: 'رف D-09',
    min_qty_boxes: 10,
    max_qty_boxes: 70,
    lead_time_days: 3,
    barcode: '628100500505',
    is_active: true,
    packing: {
      strips_per_box: 2,
      units_per_strip: 14,
      units_per_box: 28,
      price_box: 84.0,
      price_strip: 44.0,
      price_unit: 3.5,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: true
    }
  },
  {
    id: 'prod-6',
    trade_name: 'ترامادول هيدروكلورايد 50 مجم (Tramadol 50mg)',
    generic_name: 'Tramadol Hydrochloride',
    active_ingredient: 'Tramadol',
    strength: '50mg',
    form: 'كبسولات',
    category: 'أدوية مراقبة ومخدرة',
    manufacturer: 'Grünenthal',
    product_type: 'controlled',
    shelf_location: 'خزنة الأدوية المراقبة (مقفل)',
    min_qty_boxes: 3,
    max_qty_boxes: 20,
    lead_time_days: 7,
    barcode: '628100600606',
    is_active: true,
    packing: {
      strips_per_box: 2,
      units_per_strip: 10,
      units_per_box: 20,
      price_box: 48.0,
      price_strip: 25.0,
      price_unit: 3.0,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: false
    }
  },
  {
    id: 'prod-7',
    trade_name: 'أنسولين لانتوس سولوستار (Lantus SoloStar)',
    generic_name: 'Insulin Glargine',
    active_ingredient: 'Insulin Glargine 100 U/ml',
    strength: '100 units/ml (5 أقلام)',
    form: 'أقلام حقن مسبقة التعبئة',
    category: 'أدوية السكري - تبريد',
    manufacturer: 'Sanofi',
    product_type: 'prescription',
    shelf_location: 'ثلاجة الأدوية (2-8 مئوية)',
    min_qty_boxes: 5,
    max_qty_boxes: 30,
    lead_time_days: 3,
    barcode: '628100700707',
    is_active: true,
    packing: {
      strips_per_box: 1,
      units_per_strip: 5,
      units_per_box: 5,
      price_box: 215.0,
      price_strip: 215.0,
      price_unit: 45.0,
      allow_sell_box: true,
      allow_sell_strip: false,
      allow_sell_unit: true
    }
  },
  {
    id: 'prod-8',
    trade_name: 'فنتولين بخاخ استنشاق (Ventolin Inhaler)',
    generic_name: 'Salbutamol Sulphate',
    active_ingredient: 'Salbutamol 100mcg',
    strength: '100mcg / 200 جرعة',
    form: 'بخاخ استنشاق فموي',
    category: 'أمراض الجهاز التنفسي والربو',
    manufacturer: 'GlaxoSmithKline',
    product_type: 'normal',
    shelf_location: 'رف E-02',
    min_qty_boxes: 12,
    max_qty_boxes: 90,
    lead_time_days: 2,
    barcode: '628100800808',
    is_active: true,
    packing: {
      strips_per_box: 1,
      units_per_strip: 1,
      units_per_box: 1,
      price_box: 16.5,
      price_strip: 16.5,
      price_unit: 16.5,
      allow_sell_box: true,
      allow_sell_strip: false,
      allow_sell_unit: false
    }
  },
  {
    id: 'prod-9',
    trade_name: 'كتافلام 50 مجم (Cataflam 50mg)',
    generic_name: 'Diclofenac Potassium',
    active_ingredient: 'Diclofenac Potassium',
    strength: '50mg',
    form: 'أقراص سريعة المفعول',
    category: 'مسكنات ومضادات التهاب',
    manufacturer: 'Novartis',
    product_type: 'normal',
    shelf_location: 'رف A-08',
    min_qty_boxes: 15,
    max_qty_boxes: 80,
    lead_time_days: 2,
    barcode: '628100900909',
    is_active: true,
    packing: {
      strips_per_box: 2,
      units_per_strip: 10,
      units_per_box: 20,
      price_box: 24.0,
      price_strip: 12.5,
      price_unit: 1.5,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: true
    }
  },
  {
    id: 'prod-10',
    trade_name: 'أموريكس 1 جم (Amoxil / Amoxicillin)',
    generic_name: 'Amoxicillin Trihydrate',
    active_ingredient: 'Amoxicillin 875mg',
    strength: '1000mg',
    form: 'كبسولات',
    category: 'مضادات حيوية',
    manufacturer: 'Sandoz',
    product_type: 'prescription',
    shelf_location: 'رف B-06 (بديل أوجمنتين)',
    min_qty_boxes: 5,
    max_qty_boxes: 40,
    lead_time_days: 3,
    barcode: '628101001010',
    is_active: true,
    packing: {
      strips_per_box: 2,
      units_per_strip: 8,
      units_per_box: 16,
      price_box: 38.0,
      price_strip: 20.0,
      price_unit: 2.5,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: false
    }
  }
];

export const INITIAL_BATCHES: Batch[] = [
  // Panadol Extra: 2 batches (one earlier expiry for FEFO demonstration)
  {
    id: 'batch-101',
    product_id: 'prod-1',
    batch_no: 'PA-2024-08',
    mfg_date: '2024-08-01',
    expiry_date: '2026-11-15', // Near expiry (~40 days)
    cost_per_box: 13.5,
    supplier_id: 'sup-1',
    received_at: '2024-09-01',
    status: 'NEAR_EXPIRY'
  },
  {
    id: 'batch-102',
    product_id: 'prod-1',
    batch_no: 'PA-2025-02',
    mfg_date: '2025-02-01',
    expiry_date: '2027-08-30', // Safe expiry
    cost_per_box: 14.0,
    supplier_id: 'sup-1',
    received_at: '2025-03-01',
    status: 'ACTIVE'
  },

  // Augmentin 1g: 2 batches (one expired to test INV-05 blocking!)
  {
    id: 'batch-201',
    product_id: 'prod-2',
    batch_no: 'AUG-23-EXP',
    mfg_date: '2023-01-10',
    expiry_date: '2025-05-01', // EXPIRED!
    cost_per_box: 48.0,
    supplier_id: 'sup-2',
    received_at: '2023-02-15',
    status: 'EXPIRED'
  },
  {
    id: 'batch-202',
    product_id: 'prod-2',
    batch_no: 'AUG-25-FRESH',
    mfg_date: '2025-01-15',
    expiry_date: '2027-04-20',
    cost_per_box: 50.0,
    supplier_id: 'sup-2',
    received_at: '2025-02-10',
    status: 'ACTIVE'
  },

  // Concor 5mg:
  {
    id: 'batch-301',
    product_id: 'prod-3',
    batch_no: 'CON-24-11',
    mfg_date: '2024-11-01',
    expiry_date: '2027-10-10',
    cost_per_box: 32.0,
    supplier_id: 'sup-3',
    received_at: '2024-12-05',
    status: 'ACTIVE'
  },

  // Glucophage 1000mg:
  {
    id: 'batch-401',
    product_id: 'prod-4',
    batch_no: 'GLU-25-01',
    mfg_date: '2025-01-05',
    expiry_date: '2028-01-01',
    cost_per_box: 21.0,
    supplier_id: 'sup-1',
    received_at: '2025-01-20',
    status: 'ACTIVE'
  },

  // Nexium 40mg:
  {
    id: 'batch-501',
    product_id: 'prod-5',
    batch_no: 'NEX-24-09',
    mfg_date: '2024-09-01',
    expiry_date: '2026-12-01',
    cost_per_box: 66.0,
    supplier_id: 'sup-2',
    received_at: '2024-10-01',
    status: 'NEAR_EXPIRY'
  },

  // Tramadol 50mg (Controlled):
  {
    id: 'batch-601',
    product_id: 'prod-6',
    batch_no: 'TRM-CONTROL-9',
    mfg_date: '2025-02-01',
    expiry_date: '2027-06-30',
    cost_per_box: 34.0,
    supplier_id: 'sup-1',
    received_at: '2025-02-15',
    status: 'ACTIVE'
  },

  // Lantus Insulin:
  {
    id: 'batch-701',
    product_id: 'prod-7',
    batch_no: 'LAN-COLD-01',
    mfg_date: '2025-03-01',
    expiry_date: '2027-01-15',
    cost_per_box: 180.0,
    supplier_id: 'sup-3',
    received_at: '2025-03-10',
    status: 'ACTIVE'
  },

  // Ventolin Inhaler:
  {
    id: 'batch-801',
    product_id: 'prod-8',
    batch_no: 'VEN-25-03',
    mfg_date: '2025-03-01',
    expiry_date: '2027-09-01',
    cost_per_box: 12.0,
    supplier_id: 'sup-2',
    received_at: '2025-03-15',
    status: 'ACTIVE'
  },

  // Cataflam 50mg:
  {
    id: 'batch-901',
    product_id: 'prod-9',
    batch_no: 'CAT-24-12',
    mfg_date: '2024-12-01',
    expiry_date: '2027-05-25',
    cost_per_box: 17.5,
    supplier_id: 'sup-1',
    received_at: '2025-01-10',
    status: 'ACTIVE'
  },

  // Amoxil 1g (Alternative):
  {
    id: 'batch-1001',
    product_id: 'prod-10',
    batch_no: 'AMX-25-02',
    mfg_date: '2025-02-10',
    expiry_date: '2027-07-20',
    cost_per_box: 28.0,
    supplier_id: 'sup-2',
    received_at: '2025-03-01',
    status: 'ACTIVE'
  }
];

// Initial stock levels (in smallest unit: pills/units)
export const INITIAL_STOCK_LEVELS: StockLevel[] = [
  // Panadol batch-101: 5 boxes = 120 pills
  { batch_id: 'batch-101', branch_id: 'br-1', qty_units: 120, reserved_units: 0 },
  // Panadol batch-102: 25 boxes = 600 pills
  { batch_id: 'batch-102', branch_id: 'br-1', qty_units: 600, reserved_units: 0 },
  // Panadol in Branch 2: 10 boxes = 240 pills
  { batch_id: 'batch-102', branch_id: 'br-2', qty_units: 240, reserved_units: 0 },

  // Augmentin expired: 3 boxes = 42 pills (kept for write-off test)
  { batch_id: 'batch-201', branch_id: 'br-1', qty_units: 42, reserved_units: 0 },
  // Augmentin fresh: 18 boxes = 252 pills
  { batch_id: 'batch-202', branch_id: 'br-1', qty_units: 252, reserved_units: 0 },

  // Concor: 30 boxes = 900 pills
  { batch_id: 'batch-301', branch_id: 'br-1', qty_units: 900, reserved_units: 0 },

  // Glucophage: 45 boxes = 1350 pills
  { batch_id: 'batch-401', branch_id: 'br-1', qty_units: 1350, reserved_units: 0 },

  // Nexium: 15 boxes = 420 pills
  { batch_id: 'batch-501', branch_id: 'br-1', qty_units: 420, reserved_units: 0 },

  // Tramadol: 6 boxes = 120 capsules
  { batch_id: 'batch-601', branch_id: 'br-1', qty_units: 120, reserved_units: 0 },

  // Lantus Insulin: 12 boxes (60 pens)
  { batch_id: 'batch-701', branch_id: 'br-1', qty_units: 60, reserved_units: 0 },

  // Ventolin: 28 inhalers
  { batch_id: 'batch-801', branch_id: 'br-1', qty_units: 28, reserved_units: 0 },

  // Cataflam: 35 boxes = 700 pills
  { batch_id: 'batch-901', branch_id: 'br-1', qty_units: 700, reserved_units: 0 },

  // Amoxil: 10 boxes = 160 pills
  { batch_id: 'batch-1001', branch_id: 'br-1', qty_units: 160, reserved_units: 0 }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'الشركة المتحدة لتوزيع الأدوية (UCD)',
    phone: '011-2233445',
    contact_person: 'د. خالد العمري',
    payment_terms_days: 45,
    credit_limit: 150000,
    balance: 34500
  },
  {
    id: 'sup-2',
    name: 'مجموعة ابن سينا فارما',
    phone: '011-7788990',
    contact_person: 'أ. مروان السعيد',
    payment_terms_days: 30,
    credit_limit: 100000,
    balance: 18200
  },
  {
    id: 'sup-3',
    name: 'مستودع الشرق للأدوية والمستلزمات',
    phone: '011-5544332',
    contact_person: 'د. هند المنصور',
    payment_terms_days: 60,
    credit_limit: 80000,
    balance: 7500
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'عبدالله بن سعد الدوسري',
    phone: '0501234567',
    national_id: '1089234512',
    credit_limit: 2000,
    current_balance: 340,
    insurance_id: 'ins-1',
    insurance_card_no: 'BUPA-992144',
    chronic_diseases: ['السكري من النوع الثاني', 'ارتفاع ضغط الدم'],
    chronic_meds: [
      { product_id: 'prod-3', daily_dose_units: 1, last_refill_date: '2026-09-10' },
      { product_id: 'prod-4', daily_dose_units: 2, last_refill_date: '2026-09-10' }
    ]
  },
  {
    id: 'cust-2',
    name: 'فاطمة محمد القحطاني',
    phone: '0559876543',
    national_id: '1098765432',
    credit_limit: 1500,
    current_balance: 0,
    insurance_id: 'ins-2',
    insurance_card_no: 'TAW-55412',
    chronic_diseases: ['الربو القصبي'],
    chronic_meds: [
      { product_id: 'prod-8', daily_dose_units: 1, last_refill_date: '2026-09-20' }
    ]
  },
  {
    id: 'cust-3',
    name: 'سليمان خالد العتيبي',
    phone: '0543322110',
    national_id: '1023456789',
    credit_limit: 500,
    current_balance: 180,
    chronic_diseases: [],
    chronic_meds: []
  }
];

export const INITIAL_INSURANCE_COMPANIES: InsuranceCompany[] = [
  {
    id: 'ins-1',
    name: 'شركة بوبا العربية للتأمين (Bupa)',
    copay_percentage: 20, // 20% patient pays
    ceiling_per_prescription: 500,
    pending_claims_total: 14200
  },
  {
    id: 'ins-2',
    name: 'شركة التعاونية للتأمين (Tawuniya)',
    copay_percentage: 10, // 10% patient pays
    ceiling_per_prescription: 600,
    pending_claims_total: 8900
  },
  {
    id: 'ins-3',
    name: 'ميدغلف للتأمين الصحي (Medgulf)',
    copay_percentage: 25,
    ceiling_per_prescription: 400,
    pending_claims_total: 4150
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    full_name: 'د. أحمد سامي الشريف',
    role: 'PHARMACIST',
    branch_id: 'br-1',
    phone: '0561122334',
    hire_date: '2023-01-15',
    salary_type: 'MONTHLY',
    base_salary: 8500,
    is_active: true
  },
  {
    id: 'emp-2',
    full_name: 'عمر ياسين كاشير',
    role: 'CASHIER',
    branch_id: 'br-1',
    phone: '0548877665',
    hire_date: '2023-08-01',
    salary_type: 'MONTHLY',
    base_salary: 4500,
    is_active: true
  },
  {
    id: 'emp-3',
    full_name: 'يوسف العبدالله (أمين مستودع)',
    role: 'STOREKEEPER',
    branch_id: 'br-1',
    phone: '0503344556',
    hire_date: '2024-03-10',
    salary_type: 'MONTHLY',
    base_salary: 5000,
    is_active: true
  },
  {
    id: 'emp-4',
    full_name: 'محمود عبدالحميد (محاسب عام)',
    role: 'ACCOUNTANT',
    branch_id: 'br-1',
    phone: '0556677889',
    hire_date: '2022-11-01',
    salary_type: 'MONTHLY',
    base_salary: 7000,
    is_active: true
  }
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc-101', code: '101', name: 'الصندوق الرئيسي (نقدية بالصندوق)', type: 'ASSET', balance: 14850 },
  { id: 'acc-102', code: '102', name: 'البنك - الحساب الجاري (الأهلي)', type: 'ASSET', balance: 89400 },
  { id: 'acc-103', code: '103', name: 'مخزون الأدوية والمستلزمات', type: 'ASSET', balance: 125600 },
  { id: 'acc-104', code: '104', name: 'ذمم العملاء المدينة (الآجل)', type: 'ASSET', balance: 520 },
  { id: 'acc-105', code: '105', name: 'مطالبات شركات التأمين المستحقة', type: 'ASSET', balance: 27250 },
  { id: 'acc-201', code: '201', name: 'ذمم الموردين الدائنة', type: 'LIABILITY', balance: 60200 },
  { id: 'acc-301', code: '301', name: 'رأس مال الصيدلية', type: 'EQUITY', balance: 200000 },
  { id: 'acc-401', code: '401', name: 'إيرادات مبيعات الأدوية', type: 'REVENUE', balance: 48600 },
  { id: 'acc-501', code: '501', name: 'تكلفة البضاعة المباعة (COGS)', type: 'EXPENSE', balance: 32100 },
  { id: 'acc-601', code: '601', name: 'مصروفات الإيجار', type: 'EXPENSE', balance: 6500 },
  { id: 'acc-602', code: '602', name: 'مصروفات الكهرباء والمرافق', type: 'EXPENSE', balance: 1400 },
  { id: 'acc-603', code: '603', name: 'مصروفات الرواتب والأجور', type: 'EXPENSE', balance: 25000 },
  { id: 'acc-604', code: '604', name: 'خسائر إتلاف الأدوية المنتهية', type: 'EXPENSE', balance: 950 }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    branch_id: 'br-1',
    category: 'كهرباء ومرافق',
    amount: 1400,
    date: '2026-10-01',
    description: 'فاتورة كهرباء فرع شارع الجامعة عن شهر سبتمبر',
    payment_account: 'acc-101'
  },
  {
    id: 'exp-2',
    branch_id: 'br-1',
    category: 'نظافة ومستهلكات',
    amount: 280,
    date: '2026-10-03',
    description: 'أكياس صيدلية ومطبوعات باركود رول حراري',
    payment_account: 'acc-101'
  }
];

export const INITIAL_LICENSES: License[] = [
  {
    id: 'lic-demo-1',
    client_name: 'مجموعة صيدليات الشفاء التخصصية',
    license_key: 'PHARM-8821-X99B-44A1-2026',
    pharmacy_name: 'مجموعة صيدليات الشفاء التخصصية',
    pharmacy_logo_icon: 'pill',
    pharmacy_address: 'شارع الملك فهد، مقابل المستشفى التخصصي',
    pharmacy_tax_no: '300987654300003',
    pharmacy_phone: '011-4567890',
    allowed_branch_ids: ['br-1', 'br-2'],
    allowed_branch_names: ['الفرع الرئيسي - شارع الجامعة', 'فرع 2 - حي النور'],
    signature_hash: 'SIG-SHA256-SHIFA-8821-ENFORCED',
    max_devices: 3,
    max_branches: 2,
    max_users: 10,
    starts_at: '2026-01-01',
    expires_at: '2027-01-01',
    grace_days: 15,
    status: 'ACTIVE',
    devices: [
      {
        hw_fingerprint: 'HWID-WIN11-D7F4-9901-MAIN',
        device_name: 'كاشير 1 - الفرع الرئيسي',
        activated_at: '2026-01-02',
        last_seen: '2026-10-05 07:40',
        status: 'ACTIVE'
      },
      {
        hw_fingerprint: 'HWID-WIN11-E4A2-1188-STORE',
        device_name: 'جهاز أمين المستودع والجرد',
        activated_at: '2026-01-10',
        last_seen: '2026-10-04 19:15',
        status: 'ACTIVE'
      }
    ],
    modules: ['POS', 'INVENTORY_FEFO', 'PURCHASING', 'PAYROLL', 'ACCOUNTING', 'ABC_ANALYSIS']
  },
  {
    id: 'lic-client-2',
    client_name: 'صيدلية الأمل النموذجية',
    license_key: 'PHARM-4412-C11D-88Z9-2025',
    pharmacy_name: 'صيدلية الأمل النموذجية',
    pharmacy_logo_icon: 'heart',
    pharmacy_address: 'شارع التحرير، عمارة النصر',
    pharmacy_tax_no: '310887766500003',
    pharmacy_phone: '011-3322110',
    allowed_branch_ids: ['br-amal-1'],
    allowed_branch_names: ['فرع الصالة المركزية'],
    signature_hash: 'SIG-SHA256-AMAL-4412-ENFORCED',
    max_devices: 2,
    max_branches: 1,
    max_users: 4,
    starts_at: '2025-05-01',
    expires_at: '2026-10-15', // Near expiry in 10 days!
    grace_days: 7,
    status: 'ACTIVE',
    devices: [
      {
        hw_fingerprint: 'HWID-WIN10-88A1-0022-POS1',
        device_name: 'نقطة بيع الصالة',
        activated_at: '2025-05-02',
        last_seen: '2026-10-05 02:00',
        status: 'ACTIVE'
      }
    ],
    modules: ['POS', 'INVENTORY_FEFO', 'PURCHASING']
  }
];

export const INITIAL_MISSED_DEMANDS: MissedDemand[] = [
  {
    id: 'md-1',
    product_name: 'أدول شراب أطفال 120 مجم',
    requested_qty: 3,
    timestamp: '2026-10-04 18:30',
    notes: 'طلبته زبونة ولم يتوفر بديل أطفال',
    branch_id: 'br-1'
  },
  {
    id: 'md-2',
    product_name: 'فيتامين د3 50,000 وحدة دولية',
    requested_qty: 5,
    timestamp: '2026-10-05 06:15',
    notes: 'وصفة طبية من طبيب عظام',
    branch_id: 'br-1'
  }
];
