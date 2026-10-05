export type UnitLevel = 'box' | 'strip' | 'unit';

export type ProductType = 'normal' | 'prescription' | 'controlled';

export type BatchStatus = 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED' | 'QUARANTINE';

export type StockMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'SALE_RETURN'
  | 'PURCHASE_RETURN'
  | 'ADJUSTMENT'
  | 'DAMAGE'
  | 'EXPIRED_WRITEOFF'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'OPENING';

export type LicenseStatus = 'ACTIVE' | 'GRACE' | 'READ_ONLY' | 'EXPIRED' | 'SUSPENDED';

export type Role = 'OWNER' | 'BRANCH_MANAGER' | 'PHARMACIST' | 'CASHIER' | 'STOREKEEPER' | 'ACCOUNTANT';

export interface ProductPacking {
  strips_per_box: number;
  units_per_strip: number;
  units_per_box: number; // calculated: strips_per_box * units_per_strip
  price_box: number;
  price_strip: number;
  price_unit: number;
  allow_sell_box: boolean;
  allow_sell_strip: boolean;
  allow_sell_unit: boolean;
}

export interface Product {
  id: string;
  trade_name: string;
  generic_name: string;
  active_ingredient: string;
  strength: string;
  form: string; // أقراص, شراب, حقن, كبسولات, مرهم
  category: string;
  manufacturer: string;
  product_type: ProductType;
  shelf_location: string;
  min_qty_boxes: number;
  max_qty_boxes: number;
  lead_time_days: number;
  packing: ProductPacking;
  barcode: string;
  is_active: boolean;
}

export interface Batch {
  id: string;
  product_id: string;
  batch_no: string;
  mfg_date: string;
  expiry_date: string; // YYYY-MM-DD
  cost_per_box: number;
  sell_price_override?: number;
  supplier_id: string;
  received_at: string;
  status: BatchStatus;
}

export interface StockLevel {
  batch_id: string;
  branch_id: string;
  qty_units: number; // Smallest unit: pills / tablets
  reserved_units: number;
}

export interface StockMovement {
  id: string;
  batch_id: string;
  product_id: string;
  branch_id: string;
  type: StockMovementType;
  qty_units: number; // positive or negative
  unit_cost: number;
  ref_type: string; // 'SALE', 'PURCHASE', 'TRANSFER', 'ADJUSTMENT', etc.
  ref_id: string;
  reason?: string;
  user_id: string;
  timestamp: string;
}

export interface SaleLine {
  id: string;
  product_id: string;
  batch_id: string;
  unit_level: UnitLevel;
  qty_input: number; // e.g. 2 strips or 1 box
  qty_units: number; // total smallest units sold
  price_per_input_unit: number;
  discount: number;
  line_total: number;
  unit_cost: number; // cost of actual batch at sale time
  batch_no: string;
  expiry_date: string;
}

export interface ControlledDrugInfo {
  patient_name: string;
  national_id: string;
  doctor_name: string;
  prescription_no: string;
  phone: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT';

export interface BranchInfo {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  color: string;
  is_main: boolean;
}

export interface PharmacyBranding {
  name: string;
  logo_icon: string; // 'pill' | 'cross' | 'shield' | 'heart' | 'building'
  tagline: string;
  tax_no: string;
  commercial_reg_no: string;
  address: string;
  phone: string;
  currency: string;
  receipt_footer: string;
}

export interface ClientEdition {
  id: string;
  branding: PharmacyBranding;
  branches: BranchInfo[];
  license: License;
  created_at: string;
}

export interface Sale {
  id: string;
  doc_no: string;
  branch_id: string;
  customer_id?: string;
  shift_id: string;
  cashier_name: string;
  created_at: string;
  lines: SaleLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  paid_amount: number;
  change_amount: number;
  controlled_info?: ControlledDrugInfo;
  status: 'COMPLETED' | 'RETURNED' | 'CANCELLED';
}

export interface HeldSale {
  id: string;
  held_at: string;
  note: string;
  cashier_name: string;
  customer_name?: string;
  lines: SaleLine[];
}

export interface Shift {
  id: string;
  branch_id: string;
  cashier_id: string;
  cashier_name: string;
  opened_at: string;
  closed_at?: string;
  opening_cash: number;
  counted_cash?: number;
  expected_cash?: number;
  cash_sales: number;
  card_sales: number;
  credit_sales: number;
  status: 'OPEN' | 'CLOSED';
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  contact_person: string;
  payment_terms_days: number;
  credit_limit: number;
  balance: number; // amount we owe
}

export interface GoodsReceiptLine {
  product_id: string;
  batch_no: string;
  expiry_date: string;
  qty_boxes: number;
  bonus_boxes: number;
  cost_per_box: number;
  total: number;
}

export interface GoodsReceipt {
  id: string;
  doc_no: string;
  supplier_id: string;
  branch_id: string;
  receipt_date: string;
  invoice_no: string;
  lines: GoodsReceiptLine[];
  total_amount: number;
  payment_status: 'PAID' | 'UNPAID' | 'PARTIAL';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  national_id?: string;
  credit_limit: number;
  current_balance: number; // amount they owe
  insurance_id?: string;
  insurance_card_no?: string;
  chronic_diseases: string[];
  chronic_meds: { product_id: string; daily_dose_units: number; last_refill_date: string }[];
}

export interface InsuranceCompany {
  id: string;
  name: string;
  copay_percentage: number; // e.g. 20%
  ceiling_per_prescription: number;
  pending_claims_total: number;
}

export interface MonthlyInsuranceClaim {
  id: string;
  insurance_id: string;
  month: string; // YYYY-MM
  total_claims_count: number;
  gross_amount: number;
  patient_copay: number;
  net_claim_amount: number;
  status: 'SUBMITTED' | 'APPROVED' | 'SETTLED' | 'REJECTED';
}

export interface Employee {
  id: string;
  full_name: string;
  role: Role;
  branch_id: string;
  phone: string;
  hire_date: string;
  salary_type: 'MONTHLY' | 'HOURLY';
  base_salary: number;
  is_active: boolean;
}

export interface PayrollLine {
  employee_id: string;
  employee_name: string;
  base_salary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  advances: number;
  net_salary: number;
}

export interface PayrollRun {
  id: string;
  month: string; // YYYY-MM
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  total_net: number;
  lines: PayrollLine[];
  approved_at?: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
}

export interface JournalEntryLine {
  account_id: string;
  account_name: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  ref_type: string;
  ref_id: string;
  description: string;
  lines: JournalEntryLine[];
  total: number;
}

export interface Expense {
  id: string;
  branch_id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  payment_account: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  is_main: boolean;
}

export interface MissedDemand {
  id: string;
  product_name: string;
  requested_qty: number;
  timestamp: string;
  notes?: string;
  branch_id: string;
}

export interface StocktakeItem {
  product_id: string;
  batch_id: string;
  system_units: number;
  counted_units: number;
  diff_units: number;
  cost_diff: number;
}

export interface LicenseDevice {
  hw_fingerprint: string;
  device_name: string;
  activated_at: string;
  last_seen: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface License {
  id: string;
  client_name: string;
  license_key: string;
  pharmacy_name: string;
  pharmacy_logo_icon?: string;
  pharmacy_address?: string;
  pharmacy_tax_no?: string;
  pharmacy_phone?: string;
  allowed_branch_ids: string[];
  allowed_branch_names?: string[];
  max_devices: number;
  max_branches: number;
  max_users: number;
  starts_at: string;
  expires_at: string;
  grace_days: number;
  status: LicenseStatus;
  devices: LicenseDevice[];
  modules: string[];
  signature_hash?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  timestamp: string;
  hash: string;
  prev_hash: string;
}

export interface ReorderMetric {
  product_id: string;
  abc_class: 'A' | 'B' | 'C';
  ads: number; // Average Daily Sales in pills
  current_stock_units: number;
  cover_days: number;
  safety_stock_units: number;
  rop_units: number; // Reorder point
  suggested_order_boxes: number;
}
