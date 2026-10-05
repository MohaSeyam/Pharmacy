import React, { useState, useRef, useEffect } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  Product,
  Batch,
  SaleLine,
  UnitLevel,
  PaymentMethod,
  ControlledDrugInfo,
  Sale
} from '../types/pharmacy';
import {
  Search,
  ScanBarcode,
  Trash2,
  PauseCircle,
  PlayCircle,
  CreditCard,
  Banknote,
  ShieldAlert,
  Printer,
  X,
  Layers,
  Sparkles,
  Building2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  FileDown
} from 'lucide-react';

export const POSView: React.FC = () => {
  const {
    products,
    batches,
    stockLevels,
    activeBranchId,
    branches,
    customers,
    activeShift,
    openShift,
    closeShift,
    executeSale,
    heldSales,
    holdCurrentSale,
    restoreHeldSale,
    deleteHeldSale,
    getProductStockUnits,
    getProductStockBreakdown,
    logMissedDemand,
    pharmacyBranding,
    activeBranch,
    colorTheme
  } = usePharmacy();

  const getThemeButtonClass = () => {
    switch (colorTheme) {
      case 'blue': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'slate': return 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600';
      default: return 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white';
    }
  };

  const getThemeTextClass = () => {
    switch (colorTheme) {
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
      case 'slate': return 'text-[#F8FAFC]';
      default: return 'text-[#0EA5E9] dark:text-[#0EA5E9]';
    }
  };

  // Search & Cart state
  const [searchQuery, setSearchQuery] = useState('');
  const [cartLines, setCartLines] = useState<SaleLine[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidCashInput, setPaidCashInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftOpeningCashInput, setShiftOpeningCashInput] = useState('500');
  const [shiftCountedCashInput, setShiftCountedCashInput] = useState('');
  const [showControlledModal, setShowControlledModal] = useState(false);
  const [controlledInfo, setControlledInfo] = useState<ControlledDrugInfo>({
    patient_name: '',
    national_id: '',
    doctor_name: '',
    prescription_no: '',
    phone: ''
  });
  const [pendingControlledItem, setPendingControlledItem] = useState<{
    product: Product;
    unitLevel: UnitLevel;
  } | null>(null);

  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptFormat, setReceiptFormat] = useState<'80mm' | 'A4'>('80mm');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Keep focus on search input for fast barcode scanning
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Keyboard shortcut listener for POS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        handleHoldSale();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (heldSales.length > 0) {
          const restored = restoreHeldSale(heldSales[0].id);
          if (restored) setCartLines(restored.lines);
        }
      } else if (e.key === 'F9') {
        e.preventDefault();
        const query = prompt('أدخل اسم الصنف غير المتوفر لتسجيله كالطلب ضائع:');
        if (query) logMissedDemand(query, 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartLines, heldSales]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Filtered products for search
  const filteredProducts = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.trade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.active_ingredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode === searchQuery.trim()
        )
        .slice(0, 8)
    : [];

  // FEFO Batch selection engine
  const findBestFefoBatch = (productId: string, requiredUnits: number): { batch: Batch; availableUnits: number } | null => {
    const today = new Date().toISOString().split('T')[0];
    const productBatches = batches
      .filter((b) => b.product_id === productId && b.status !== 'EXPIRED' && b.expiry_date >= today)
      .sort((a, b) => (a.expiry_date > b.expiry_date ? 1 : -1));

    for (const batch of productBatches) {
      const sl = stockLevels.find((s) => s.batch_id === batch.id && s.branch_id === activeBranchId);
      if (sl && sl.qty_units > 0) {
        return { batch, availableUnits: sl.qty_units };
      }
    }
    return null;
  };

  // Add item to cart
  const handleAddItem = (product: Product, unitLevel: UnitLevel = 'box') => {
    setErrorMessage(null);

    // Controlled Drug check
    if (product.product_type === 'controlled' && !controlledInfo.patient_name) {
      setPendingControlledItem({ product, unitLevel });
      setShowControlledModal(true);
      return;
    }

    const unitsPerBox = product.packing.units_per_box || 1;
    const unitsPerStrip = product.packing.units_per_strip || 1;

    let unitsMultiplier = 1;
    let inputPrice = product.packing.price_unit;
    if (unitLevel === 'box') {
      unitsMultiplier = unitsPerBox;
      inputPrice = product.packing.price_box;
    } else if (unitLevel === 'strip') {
      unitsMultiplier = unitsPerStrip;
      inputPrice = product.packing.price_strip;
    }

    // Check FEFO batch
    const fefoMatch = findBestFefoBatch(product.id, unitsMultiplier);
    if (!fefoMatch) {
      setErrorMessage(`لا يوجد رصيد صالح للاستخدام من الصنف (${product.trade_name}). تم استبعاد الدفعات المنتهية.`);
      return;
    }

    const { batch, availableUnits } = fefoMatch;
    const unitCost = batch.cost_per_box / unitsPerBox;

    // Check if already in cart with same batch
    const existingIndex = cartLines.findIndex((l) => l.batch_id === batch.id && l.unit_level === unitLevel);
    if (existingIndex >= 0) {
      const currentLine = cartLines[existingIndex];
      const newQtyInput = currentLine.qty_input + 1;
      const newQtyUnits = newQtyInput * unitsMultiplier;

      if (newQtyUnits > availableUnits) {
        setErrorMessage(`تجاوزت الكمية المتاحة في الدفعة (${batch.batch_no}). المتبقي: ${availableUnits} حبة`);
        return;
      }

      const updated = [...cartLines];
      updated[existingIndex] = {
        ...currentLine,
        qty_input: newQtyInput,
        qty_units: newQtyUnits,
        line_total: newQtyInput * currentLine.price_per_input_unit
      };
      setCartLines(updated);
    } else {
      if (unitsMultiplier > availableUnits) {
        setErrorMessage(`الرصيد المتاح في الدفعة الحالية (${batch.batch_no}) لا يكفي لوحدة ${unitLevel === 'box' ? 'علبة' : 'شريط'}`);
        return;
      }

      const newLine: SaleLine = {
        id: `line-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product_id: product.id,
        batch_id: batch.id,
        unit_level: unitLevel,
        qty_input: 1,
        qty_units: unitsMultiplier,
        price_per_input_unit: inputPrice,
        discount: 0,
        line_total: inputPrice,
        unit_cost: unitCost,
        batch_no: batch.batch_no,
        expiry_date: batch.expiry_date
      };
      setCartLines((prev) => [...prev, newLine]);
    }

    setSearchQuery('');
    barcodeInputRef.current?.focus();
  };

  // Change unit level in cart
  const handleUnitLevelChange = (lineIndex: number, newLevel: UnitLevel) => {
    const line = cartLines[lineIndex];
    const prod = products.find((p) => p.id === line.product_id);
    if (!prod) return;

    let multiplier = 1;
    let price = prod.packing.price_unit;
    if (newLevel === 'box') {
      multiplier = prod.packing.units_per_box;
      price = prod.packing.price_box;
    } else if (newLevel === 'strip') {
      multiplier = prod.packing.units_per_strip;
      price = prod.packing.price_strip;
    }

    const newUnits = line.qty_input * multiplier;
    const sl = stockLevels.find((s) => s.batch_id === line.batch_id && s.branch_id === activeBranchId);
    if (sl && newUnits > sl.qty_units) {
      setErrorMessage(`الرصيد المتاح في الدفعة لا يكفي للتحويل إلى ${newLevel}`);
      return;
    }

    const updated = [...cartLines];
    updated[lineIndex] = {
      ...line,
      unit_level: newLevel,
      qty_units: newUnits,
      price_per_input_unit: price,
      line_total: line.qty_input * price
    };
    setCartLines(updated);
  };

  // Update line quantity
  const handleUpdateQty = (lineIndex: number, delta: number) => {
    const line = cartLines[lineIndex];
    const prod = products.find((p) => p.id === line.product_id);
    if (!prod) return;

    let multiplier = 1;
    if (line.unit_level === 'box') multiplier = prod.packing.units_per_box;
    else if (line.unit_level === 'strip') multiplier = prod.packing.units_per_strip;

    const newQty = line.qty_input + delta;
    if (newQty <= 0) {
      handleRemoveLine(lineIndex);
      return;
    }

    const newUnits = newQty * multiplier;
    const sl = stockLevels.find((s) => s.batch_id === line.batch_id && s.branch_id === activeBranchId);
    if (sl && newUnits > sl.qty_units) {
      setErrorMessage(`الرصيد المتاح في الدفعة ${line.batch_no} هو ${sl.qty_units} حبة فقط.`);
      return;
    }

    const updated = [...cartLines];
    updated[lineIndex] = {
      ...line,
      qty_input: newQty,
      qty_units: newUnits,
      line_total: newQty * line.price_per_input_unit
    };
    setCartLines(updated);
    setErrorMessage(null);
  };

  const handleRemoveLine = (lineIndex: number) => {
    setCartLines((prev) => prev.filter((_, idx) => idx !== lineIndex));
  };

  // Totals calculations
  const subtotal = cartLines.reduce((sum, l) => sum + l.line_total, 0);
  const total = Math.max(0, subtotal - discountAmount);

  // Complete Checkout
  const handleCheckout = async () => {
    if (!activeShift) {
      setShowShiftModal(true);
      return;
    }

    if (cartLines.length === 0) {
      setErrorMessage('سلة البيع فارغة');
      return;
    }

    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      setErrorMessage('يجب اختيار عميل للبيع الآجل');
      return;
    }

    try {
      const paidNum = parseFloat(paidCashInput) || total;
      const changeNum = Math.max(0, paidNum - total);

      const sale = await executeSale({
        lines: cartLines,
        customerId: selectedCustomerId || undefined,
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod,
        paidAmount: paidNum,
        changeAmount: changeNum,
        controlledInfo: controlledInfo.patient_name ? controlledInfo : undefined
      });

      setCompletedSale(sale);
      setShowReceiptModal(true);

      // Reset cart
      setCartLines([]);
      setDiscountAmount(0);
      setSelectedCustomerId('');
      setPaidCashInput('');
      setControlledInfo({
        patient_name: '',
        national_id: '',
        doctor_name: '',
        prescription_no: '',
        phone: ''
      });
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشلت عملية البيع');
    }
  };

  // Hold Sale
  const handleHoldSale = () => {
    if (cartLines.length === 0) return;
    holdCurrentSale(cartLines, `فاتورة ${new Date().toLocaleTimeString('ar-SA')}`, selectedCustomer?.name);
    setCartLines([]);
    setErrorMessage(null);
  };

  // Export receipt as formatted printable PDF / HTML document
  const handleExportPDF = () => {
    if (!completedSale) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>فاتورة ضريبية - ${completedSale.doc_no}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; margin: 20px; line-height: 1.4; color: #111; }
          .receipt-container { max-width: 320px; margin: 0 auto; padding: 10px; border: 1px dashed #ccc; }
          .header { text-align: center; border-bottom: 1px dashed #999; padding-bottom: 8px; margin-bottom: 8px; }
          .header h2 { margin: 0; font-size: 16px; font-weight: bold; }
          .header p { margin: 2px 0; font-size: 11px; color: #555; }
          .meta { font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed #ccc; padding-bottom: 6px; }
          .meta div { display: flex; justify-content: space-between; margin: 2px 0; }
          .items table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .items th, .items td { text-align: right; padding: 4px 0; }
          .items th { border-bottom: 1px solid #ddd; }
          .totals { margin-top: 8px; border-top: 1px dashed #999; padding-top: 6px; font-size: 12px; }
          .totals div { display: flex; justify-content: space-between; margin: 3px 0; }
          .totals .grand-total { font-size: 14px; font-weight: bold; border-top: 1px solid #222; padding-top: 4px; }
          .footer { text-align: center; margin-top: 12px; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h2>${pharmacyBranding.name}</h2>
            <p>${activeBranch.name}</p>
            <p>هاتف: ${activeBranch.phone || pharmacyBranding.phone}</p>
            <p>الرقم الضريبي: ${pharmacyBranding.tax_no}</p>
            <p style="font-weight:bold; margin-top:4px;">فاتورة ضريبية مبسطة</p>
          </div>
          <div class="meta">
            <div><span>رقم الفاتورة:</span><span style="font-weight:bold;">${completedSale.doc_no}</span></div>
            <div><span>التاريخ والوقت:</span><span>${completedSale.created_at}</span></div>
            <div><span>الكاشير:</span><span>${completedSale.cashier_name}</span></div>
            <div><span>طريقة الدفع:</span><span>${completedSale.payment_method === 'CASH' ? 'نقدي' : completedSale.payment_method === 'CARD' ? 'بطاقة/شبكة' : 'آجل'}</span></div>
          </div>
          <div class="items">
            <table>
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${completedSale.lines.map((l) => {
                  const prod = products.find((p) => p.id === l.product_id);
                  return `
                    <tr>
                      <td style="font-weight:bold;">${prod?.trade_name || 'دواء'}<br><span style="font-size:9px; color:#666;">دفعة: ${l.batch_no}</span></td>
                      <td>${l.qty_input} ${l.unit_level === 'box' ? 'علبة' : 'شريط'}</td>
                      <td>${l.price_per_input_unit.toFixed(2)}</td>
                      <td style="font-weight:bold;">${l.line_total.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="totals">
            <div><span>المجموع الفرعي:</span><span>${completedSale.subtotal.toFixed(2)} ${pharmacyBranding.currency}</span></div>
            ${completedSale.discount > 0 ? `<div><span>الخصم:</span><span>-${completedSale.discount.toFixed(2)} ${pharmacyBranding.currency}</span></div>` : ''}
            <div class="grand-total"><span>الإجمالي الصافي:</span><span>${completedSale.total.toFixed(2)} ${pharmacyBranding.currency}</span></div>
          </div>
          <div class="footer">
            <p>${pharmacyBranding.receipt_footer}</p>
            <p style="font-weight:bold;">نتمنى لكم دوام الصحة والعافية</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    }
  };

  // Download digital json archive of the sale
  const handleDownloadRecord = () => {
    if (!completedSale) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(completedSale, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${completedSale.doc_no}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      {/* LEFT/RIGHT MAIN: Cart & Barcode Scanner */}
      <div className="flex-1 flex flex-col p-4 border-b lg:border-b-0 lg:border-l border-[#334155] overflow-y-auto">
        {/* Error notification bar */}
        {errorMessage && (
          <div className="mb-3 p-3 bg-rose-950/80 border border-rose-800 rounded-md flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Barcode & Quick Search Input */}
        <div className="relative mb-3">
          <div className="flex items-center gap-2 bg-[#1E293B] p-2.5 rounded-lg border border-[#334155] shadow-xs focus-within:border-[#0EA5E9] focus-within:ring-1 focus-within:ring-[#0EA5E9]">
            <ScanBarcode className={`w-5 h-5 ${getThemeTextClass()} shrink-0`} />
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredProducts.length > 0) {
                  handleAddItem(filteredProducts[0]);
                }
              }}
              placeholder="ابحث باسم الدواء، المادة الفعالة، أو امسح الباركود [F2]"
              className="w-full bg-transparent text-xs text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#94A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="kbd-shortcut text-[10px]">F2</kbd>
          </div>

          {/* Autocomplete Dropdown */}
          {filteredProducts.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-40 bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl overflow-hidden divide-y divide-[#334155]">
              {filteredProducts.map((p) => {
                const stock = getProductStockBreakdown(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddItem(p, 'box')}
                    className="p-3 hover:bg-[#0F172A] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#F8FAFC]">{p.trade_name}</span>
                        {p.product_type === 'controlled' && (
                          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-semibold">
                            دواء مراقب
                          </span>
                        )}
                        {p.shelf_location && (
                          <span className="text-[10px] text-[#94A3B8]">({p.shelf_location})</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {p.active_ingredient} · {p.strength}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className={`font-bold text-xs ${getThemeTextClass()} font-mono`}>
                        {p.packing.price_box.toFixed(2)} {pharmacyBranding.currency}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">
                        المتوفر: {stock.displayString}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Items Table */}
        <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] flex flex-col overflow-hidden shadow-xs">
          <div className="p-3 border-b border-[#334155] flex items-center justify-between text-xs font-semibold text-[#94A3B8]">
            <span>بنود الفاتورة الحالية ({cartLines.length})</span>
            {heldSales.length > 0 && (
              <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                <PauseCircle className="w-3.5 h-3.5" />
                <span>{heldSales.length} فواتير معلقة</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#334155]">
            {cartLines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[#94A3B8]">
                <ScanBarcode className="w-10 h-10 mb-2 stroke-1 text-[#334155]" />
                <p className="text-xs font-medium text-[#F8FAFC]">سلة البيع فارغة</p>
                <p className="text-[11px] text-[#94A3B8] mt-1 font-mono">
                  جاهز للمسح الضوئي [F2] أو البحث السريع
                </p>
              </div>
            ) : (
              cartLines.map((line, idx) => {
                const prod = products.find((p) => p.id === line.product_id);
                return (
                    <div key={line.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-[#0F172A]/80 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F8FAFC] truncate">
                          {prod?.trade_name}
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                          FEFO: دفعة {line.batch_no} (انتهاء: {line.expiry_date})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">
                        سعر الوحدة: <span className="font-mono text-[#F8FAFC]">{line.price_per_input_unit.toFixed(2)}</span> {pharmacyBranding.currency}
                      </div>
                    </div>

                    {/* Unit Level Selector (Box / Strip / Pill) */}
                    <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-md border border-[#334155]">
                      {prod?.packing.allow_sell_box && (
                        <button
                          onClick={() => handleUnitLevelChange(idx, 'box')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            line.unit_level === 'box'
                              ? 'bg-[#0EA5E9] text-white shadow-xs'
                              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                          }`}
                        >
                          علبة
                        </button>
                      )}
                      {prod?.packing.allow_sell_strip && (
                        <button
                          onClick={() => handleUnitLevelChange(idx, 'strip')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            line.unit_level === 'strip'
                              ? 'bg-[#0EA5E9] text-white shadow-xs'
                              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                          }`}
                        >
                          شريط
                        </button>
                      )}
                      {prod?.packing.allow_sell_unit && (
                        <button
                          onClick={() => handleUnitLevelChange(idx, 'unit')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            line.unit_level === 'unit'
                              ? 'bg-[#0EA5E9] text-white shadow-xs'
                              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                          }`}
                        >
                          حبة
                        </button>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[#334155] rounded-md overflow-hidden font-mono bg-[#0F172A]">
                        <button
                          onClick={() => handleUpdateQty(idx, -1)}
                          className="px-2.5 py-1 hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 text-[#F8FAFC] font-semibold">
                          {line.qty_input}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(idx, 1)}
                          className="px-2.5 py-1 hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="w-24 text-left font-bold text-[#F8FAFC] font-mono">
                        {line.line_total.toFixed(2)} {pharmacyBranding.currency}
                      </div>

                      <button
                        onClick={() => handleRemoveLine(idx)}
                        className="text-[#94A3B8] hover:text-rose-400 p-1 transition-colors"
                        title="حذف السطر (Del)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="p-2.5 bg-[#0F172A] border-t border-[#334155] flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleHoldSale}
                disabled={cartLines.length === 0}
                className="flex items-center gap-1.5 bg-[#1E293B] border border-[#334155] px-2.5 py-1.5 rounded-md text-[#F8FAFC] hover:bg-[#334155] transition-colors disabled:opacity-40"
                title="تعليق الفاتورة (F3)"
              >
                <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>تعليق</span>
                <kbd className="kbd-shortcut text-[9px]">F3</kbd>
              </button>

              {heldSales.length > 0 && (
                <button
                  onClick={() => {
                    const restored = restoreHeldSale(heldSales[0].id);
                    if (restored) setCartLines(restored.lines);
                  }}
                  className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-800 px-2.5 py-1.5 rounded-md text-amber-300 font-medium hover:bg-amber-900/80 transition-colors"
                  title="استرجاع الفاتورة المعلقة (F4)"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>استرجاع المعلقة</span>
                  <kbd className="kbd-shortcut text-[9px] bg-amber-900 border-amber-700">F4</kbd>
                </button>
              )}

              <button
                onClick={() => {
                  const query = prompt('أدخل اسم الصنف غير المتوفر لتسجيله كالطلب ضائع:');
                  if (query) logMissedDemand(query, 1);
                }}
                className="flex items-center gap-1.5 bg-[#1E293B] border border-[#334155] px-2.5 py-1.5 rounded-md text-[#F8FAFC] hover:bg-[#334155] transition-colors"
                title="تسجيل صنف طلبه زبون ولم يتوفر (F9)"
              >
                <FileText className="w-3.5 h-3.5 text-[#0EA5E9]" />
                <span>طلب ضائع</span>
                <kbd className="kbd-shortcut text-[9px]">F9</kbd>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShiftModal(true)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] text-[11px] font-medium"
              >
                إدارة الوردية
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT/LEFT SIDEBAR: Customer, Payment & Checkout */}
      <div className="w-full lg:w-96 p-4 flex flex-col justify-between bg-[#1E293B] border-r border-[#334155] shrink-0 overflow-y-auto">
        <div className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
              العميل / الحساب
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-md p-2 text-xs text-[#F8FAFC] outline-none focus:border-[#0EA5E9]"
            >
              <option value="">عميل نقدي عام (Cash Customer)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>

            {/* Selected Customer Information */}
            {selectedCustomer && (
              <div className="mt-2 p-2.5 rounded-md bg-[#0F172A] border border-[#334155] text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">رصيد المديونية:</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {selectedCustomer.current_balance} {pharmacyBranding.currency} / سقف {selectedCustomer.credit_limit} {pharmacyBranding.currency}
                  </span>
                </div>
                {selectedCustomer.chronic_diseases.length > 0 && (
                  <div className="text-emerald-400">
                    <span className="font-semibold">الأمراض المزمنة:</span> {selectedCustomer.chronic_diseases.join('، ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selector (Direct: Cash, Card, Credit) */}
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-md border text-xs font-medium transition-colors ${
                  paymentMethod === 'CASH'
                    ? 'bg-[#0EA5E9]/20 border-[#0EA5E9] text-[#0EA5E9]'
                    : 'bg-[#0F172A] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>نقدي (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-md border text-xs font-medium transition-colors ${
                  paymentMethod === 'CARD'
                    ? 'bg-[#0EA5E9]/20 border-[#0EA5E9] text-[#0EA5E9]'
                    : 'bg-[#0F172A] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#0EA5E9]" />
                <span>شبكة / مدى</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT')}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-md border text-xs font-medium transition-colors ${
                  paymentMethod === 'CREDIT'
                    ? 'bg-[#0EA5E9]/20 border-[#0EA5E9] text-[#0EA5E9]'
                    : 'bg-[#0F172A] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>آجل (ذمم)</span>
              </button>
            </div>
          </div>

          {/* Discount Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#94A3B8]">الخصم المسموح</label>
              <span className="text-[10px] text-[#94A3B8]">بصلاحية الكاشير</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0F172A] border border-[#334155] rounded-md px-2.5 py-1.5 focus-within:border-[#0EA5E9]">
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="w-full bg-transparent text-xs font-mono outline-none text-[#F8FAFC]"
              />
              <span className="text-xs text-[#94A3B8]">{pharmacyBranding.currency}</span>
            </div>
          </div>

          {/* Cash Received & Change Calculator */}
          {paymentMethod === 'CASH' && (
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">
                المبلغ المستلم من الزبون
              </label>
              <div className="flex items-center gap-2 bg-[#0F172A] border border-[#334155] rounded-md px-2.5 py-1.5 focus-within:border-[#0EA5E9]">
                <input
                  type="number"
                  value={paidCashInput}
                  onChange={(e) => setPaidCashInput(e.target.value)}
                  placeholder={total.toFixed(2)}
                  className="w-full bg-transparent text-xs font-mono outline-none text-[#F8FAFC]"
                />
                <span className="text-xs text-[#94A3B8]">{pharmacyBranding.currency}</span>
              </div>
              {parseFloat(paidCashInput) > total && (
                <div className="mt-1 text-xs text-emerald-400 flex justify-between font-mono">
                  <span>المتبقي للعميل (الباقي):</span>
                  <span className="font-bold">{(parseFloat(paidCashInput) - total).toFixed(2)} {pharmacyBranding.currency}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bill Summary and Checkout Button */}
        <div className="border-t border-[#334155] pt-4 mt-4 space-y-2">
          <div className="flex justify-between text-xs text-[#94A3B8]">
            <span>المجموع الفرعي:</span>
            <span className="font-mono">{subtotal.toFixed(2)} {pharmacyBranding.currency}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-rose-400">
              <span>الخصم:</span>
              <span className="font-mono">-{discountAmount.toFixed(2)} {pharmacyBranding.currency}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold text-[#F8FAFC] pt-2 border-t border-[#334155]">
            <span>الإجمالي المستحق:</span>
            <span className={`text-xl font-mono ${getThemeTextClass()}`}>
              {total.toFixed(2)} {pharmacyBranding.currency}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cartLines.length === 0}
            className="w-full mt-3 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-md font-bold text-xs shadow-xs transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>إتمام البيع وطباعة الإيصال</span>
            <kbd className="kbd-shortcut bg-white/20 text-white border-white/20 text-[10px]">Enter / F2</kbd>
          </button>
        </div>
      </div>

      {/* MODAL 1: Shift Open / Close */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-md w-full p-5 shadow-2xl border border-[#334155] text-[#F8FAFC]">
            <h3 className="font-bold text-sm text-[#F8FAFC] mb-1">
              {activeShift ? 'إغلاق الوردية الحالية' : 'فتح وردية كاشير جديدة'}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              {activeShift
                ? 'قم بعدّ النقدية الموجودة في الدرج لإغلاق الوردية وتوليد تقرير الفروقات.'
                : 'أدخل عهدة الصندوق الافتتاحية لبدء عمليات البيع.'}
            </p>

            {activeShift ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#0F172A] rounded-md border border-[#334155] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">افتتاحية الوردية:</span>
                    <span className="font-mono text-[#F8FAFC]">{activeShift.opening_cash} {pharmacyBranding.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">مبيعات نقدي:</span>
                    <span className="font-mono text-[#F8FAFC]">{activeShift.cash_sales} {pharmacyBranding.currency}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-[#334155]">
                    <span>المتوقع بالدرج:</span>
                    <span className="font-mono">{activeShift.opening_cash + activeShift.cash_sales} {pharmacyBranding.currency}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">المبلغ الفعلي المعدود بالدرج</label>
                  <input
                    type="number"
                    value={shiftCountedCashInput}
                    onChange={(e) => setShiftCountedCashInput(e.target.value)}
                    placeholder="أدخل المبلغ بعدّ الدرج"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md text-xs font-mono outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                  <button
                    onClick={() => setShowShiftModal(false)}
                    className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] rounded-md"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      const counted = parseFloat(shiftCountedCashInput) || 0;
                      closeShift(counted);
                      setShowShiftModal(false);
                      setShiftCountedCashInput('');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors"
                  >
                    تأكيد إغلاق الوردية
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">الرصيد الافتتاحي بالصندوق (العهدة)</label>
                  <input
                    type="number"
                    value={shiftOpeningCashInput}
                    onChange={(e) => setShiftOpeningCashInput(e.target.value)}
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md text-xs font-mono outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                  <button
                    onClick={() => setShowShiftModal(false)}
                    className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] rounded-md"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      const opening = parseFloat(shiftOpeningCashInput) || 0;
                      openShift(opening);
                      setShowShiftModal(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-md transition-colors"
                  >
                    فتح الوردية
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Controlled Drug Register Prompt */}
      {showControlledModal && pendingControlledItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-md w-full p-5 shadow-2xl border border-rose-800 text-[#F8FAFC]">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-sm">سجل الأدوية المراقبة والمخدرة</h3>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4">
              الصنف ({pendingControlledItem.product.trade_name}) يخضع لرقابة وزارة الصحة. يرجى توثيق بيانات الوصفة والمريض بدقة.
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-medium text-[#94A3B8] mb-1">اسم المريض الكامل</label>
                <input
                  type="text"
                  value={controlledInfo.patient_name}
                  onChange={(e) => setControlledInfo({ ...controlledInfo, patient_name: e.target.value })}
                  placeholder="محمد أحمد الزهراني"
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#94A3B8] mb-1">رقم الهوية الوطنية / الإقامة</label>
                <input
                  type="text"
                  value={controlledInfo.national_id}
                  onChange={(e) => setControlledInfo({ ...controlledInfo, national_id: e.target.value })}
                  placeholder="10XXXXXXXX"
                  className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md outline-none font-mono text-[#F8FAFC] focus:border-[#0EA5E9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-[#94A3B8] mb-1">اسم الطبيب المعالج</label>
                  <input
                    type="text"
                    value={controlledInfo.doctor_name}
                    onChange={(e) => setControlledInfo({ ...controlledInfo, doctor_name: e.target.value })}
                    placeholder="د. ماجد السالم"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md outline-none text-[#F8FAFC] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#94A3B8] mb-1">رقم الوصفة الطبية</label>
                  <input
                    type="text"
                    value={controlledInfo.prescription_no}
                    onChange={(e) => setControlledInfo({ ...controlledInfo, prescription_no: e.target.value })}
                    placeholder="RX-98214"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-md outline-none font-mono text-[#F8FAFC] focus:border-[#0EA5E9]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#334155] mt-4">
              <button
                onClick={() => {
                  setShowControlledModal(false);
                  setPendingControlledItem(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] rounded-md"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!controlledInfo.patient_name || !controlledInfo.national_id) {
                    alert('يرجى ملء اسم المريض ورقم الهوية');
                    return;
                  }
                  setShowControlledModal(false);
                  if (pendingControlledItem) {
                    handleAddItem(pendingControlledItem.product, pendingControlledItem.unitLevel);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-md transition-colors"
              >
                اعتماد وإضافة للصرف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Thermal Receipt (80mm) & PDF Export */}
      {showReceiptModal && completedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-sm w-full p-5 shadow-2xl border border-[#334155] max-h-[90vh] flex flex-col text-[#F8FAFC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0EA5E9]" />
                <h3 className="font-bold text-sm text-[#F8FAFC]">إيصال الفاتورة ومعاينة الطباعة</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Receipt Paper representation */}
            <div className="flex-1 overflow-y-auto my-3 p-4 bg-white text-slate-900 font-mono text-xs rounded border border-slate-300 shadow-inner">
              <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-0.5">
                <div className="font-bold text-sm">{pharmacyBranding.name}</div>
                <div className="text-[11px]">{activeBranch.name}</div>
                <div className="text-[10px] text-slate-600">هاتف: {activeBranch.phone || pharmacyBranding.phone}</div>
                <div className="text-[10px] text-slate-600">الرقم الضريبي: {pharmacyBranding.tax_no}</div>
                <div className="text-[10px] font-bold text-slate-700 mt-1">فاتورة ضريبية مبسطة</div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>رقم الفاتورة:</span>
                  <span className="font-bold">{completedSale.doc_no}</span>
                </div>
                <div className="flex justify-between">
                  <span>التاريخ والوقت:</span>
                  <span>{completedSale.created_at}</span>
                </div>
                <div className="flex justify-between">
                  <span>الكاشير:</span>
                  <span>{completedSale.cashier_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>طريقة الدفع:</span>
                  <span className="font-bold">
                    {completedSale.payment_method === 'CASH'
                      ? 'نقدي'
                      : completedSale.payment_method === 'CARD'
                      ? 'شبكة / مدى'
                      : 'آجل'}
                  </span>
                </div>
                {completedSale.controlled_info && (
                  <div className="mt-1 pt-1 border-t border-slate-300 text-red-700">
                    <div>المريض: {completedSale.controlled_info.patient_name}</div>
                    <div>الهوية: {completedSale.controlled_info.national_id}</div>
                    <div>الوصفة: {completedSale.controlled_info.prescription_no}</div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5 text-[11px]">
                {completedSale.lines.map((l) => {
                  const prod = products.find((p) => p.id === l.product_id);
                  return (
                    <div key={l.id}>
                      <div className="font-bold">{prod?.trade_name}</div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>
                          {l.qty_input} × {l.price_per_input_unit.toFixed(2)} ({l.unit_level === 'box' ? 'علبة' : 'شريط'})
                        </span>
                        <span className="font-bold text-slate-900">{l.line_total.toFixed(2)} {pharmacyBranding.currency}</span>
                      </div>
                      <div className="text-[9px] text-slate-500">
                        دفعة: {l.batch_no} | انتهاء: {l.expiry_date}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="py-2 border-b border-dashed border-slate-400 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>المجموع:</span>
                  <span>{completedSale.subtotal.toFixed(2)} {pharmacyBranding.currency}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>الخصم:</span>
                    <span>-{completedSale.discount.toFixed(2)} {pharmacyBranding.currency}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                  <span>الإجمالي الصافي:</span>
                  <span>{completedSale.total.toFixed(2)} {pharmacyBranding.currency}</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-3 text-[10px] text-slate-600 space-y-1">
                <p>{pharmacyBranding.receipt_footer}</p>
                <p className="font-bold">نتمنى لكم دوام الصحة والعافية</p>
              </div>
            </div>

            {/* Actions: Print & Export PDF */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الإيصال</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>تصدير PDF</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleDownloadRecord}
                className="flex-1 py-1.5 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] rounded-md text-[11px] flex items-center justify-center gap-1 transition-colors"
                title="تنزيل نسخة أرشفة رقمية"
              >
                <Download className="w-3.5 h-3.5" />
                <span>حفظ كملف أرشيف رقمي (.json)</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-3 py-1.5 border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] rounded-md text-[11px] transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
