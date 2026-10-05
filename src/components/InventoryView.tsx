import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Product, Batch, UnitLevel, ProductType } from '../types/pharmacy';
import {
  Package,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  Layers,
  ShieldAlert,
  ChevronRight,
  Eye,
  Edit,
  X,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    batches,
    stockLevels,
    activeBranchId,
    getProductStockUnits,
    getProductStockBreakdown,
    getBatchesForProduct,
    addProduct
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LOW' | 'NEAR_EXPIRY' | 'CONTROLLED'>('ALL');
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newProd, setNewProd] = useState<Omit<Product, 'id'>>({
    trade_name: '',
    generic_name: '',
    active_ingredient: '',
    strength: '',
    form: 'أقراص',
    category: 'مسكنات وخافض حرارة',
    manufacturer: '',
    product_type: 'normal',
    shelf_location: 'رف A-01',
    min_qty_boxes: 10,
    max_qty_boxes: 100,
    lead_time_days: 3,
    barcode: '',
    is_active: true,
    packing: {
      strips_per_box: 2,
      units_per_strip: 10,
      units_per_box: 20,
      price_box: 25.0,
      price_strip: 13.0,
      price_unit: 1.5,
      allow_sell_box: true,
      allow_sell_strip: true,
      allow_sell_unit: true
    }
  });

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.trade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.active_ingredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    const totalStock = getProductStockUnits(p.id);
    const minUnits = p.min_qty_boxes * (p.packing.units_per_box || 1);
    const isLow = totalStock <= minUnits;

    const prodBatches = batches.filter((b) => b.product_id === p.id);
    const hasNearExpiry = prodBatches.some((b) => b.status === 'NEAR_EXPIRY' || b.status === 'EXPIRED');

    let matchesStatus = true;
    if (filterStatus === 'LOW') matchesStatus = isLow;
    else if (filterStatus === 'NEAR_EXPIRY') matchesStatus = hasNearExpiry;
    else if (filterStatus === 'CONTROLLED') matchesStatus = p.product_type === 'controlled';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.trade_name || !newProd.barcode) {
      alert('يرجى إدخال الاسم التجاري والباركود');
      return;
    }
    const unitsPerBox = newProd.packing.strips_per_box * newProd.packing.units_per_strip;
    addProduct({
      ...newProd,
      packing: {
        ...newProd.packing,
        units_per_box: unitsPerBox
      }
    });
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden bg-[#0F172A] text-[#F8FAFC]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0EA5E9]" />
            <span>إدارة المخزون والدفعات (FEFO)</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            متابعة هرم الوحدات (علبة / شريط / حبة)، وأرصدة الدفعات بحسب تاريخ الانتهاء، ومنع بيع المنتهي.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 py-2 rounded-md text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف دوائي جديد</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#1E293B] p-4 rounded-lg border border-[#334155] shadow-xs mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-1.5 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، المادة الفعالة، أو الباركود..."
            className="w-full bg-transparent text-[#F8FAFC] outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">الفئة:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] rounded-lg p-1.5 text-xs text-[#F8FAFC] outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'جميع الفئات' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Status segmented controls */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-[#0EA5E9] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            الكل ({products.length})
          </button>
          <button
            onClick={() => setFilterStatus('LOW')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterStatus === 'LOW'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            نواقص المخزون
          </button>
          <button
            onClick={() => setFilterStatus('NEAR_EXPIRY')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterStatus === 'NEAR_EXPIRY'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            تنبيه الصلاحية
          </button>
          <button
            onClick={() => setFilterStatus('CONTROLLED')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filterStatus === 'CONTROLLED'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            الأدوية المراقبة
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 bg-[#1E293B] rounded-lg border border-[#334155] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#0F172A]/80 border-b border-[#334155] text-slate-500 font-semibold sticky top-0 z-10">
              <tr>
                <th className="p-3">الصنف الدوائي</th>
                <th className="p-3">الباركود</th>
                <th className="p-3">الموقع / الرف</th>
                <th className="p-3">هرم التعبئة (الوحدات)</th>
                <th className="p-3">الرصيد المتاح (FEFO)</th>
                <th className="p-3">سعر البيع (علبة/شريط)</th>
                <th className="p-3">أقرب انتهاء</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/80">
              {filteredProducts.map((p) => {
                const stockBreakdown = getProductStockBreakdown(p.id);
                const totalUnits = getProductStockUnits(p.id);
                const minUnits = p.min_qty_boxes * (p.packing.units_per_box || 1);
                const isLow = totalUnits <= minUnits;

                const prodBatches = getBatchesForProduct(p.id);
                const nearestExpiryBatch = [...prodBatches]
                  .filter((b) => b.stockUnits > 0)
                  .sort((a, b) => (a.expiry_date > b.expiry_date ? 1 : -1))[0];

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                        <span>{p.trade_name}</span>
                        {p.product_type === 'controlled' && (
                          <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1 py-0.5 rounded font-semibold">
                            مراقب
                          </span>
                        )}
                        {p.product_type === 'prescription' && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1 py-0.5 rounded">
                            بوصفة
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.active_ingredient} · {p.manufacturer}
                      </div>
                    </td>

                    <td className="p-3 font-mono text-[#94A3B8]">
                      {p.barcode}
                    </td>

                    <td className="p-3 text-[#94A3B8]">
                      {p.shelf_location || 'غير محدد'}
                    </td>

                    <td className="p-3 text-[11px] text-[#94A3B8]">
                      1 علبة = {p.packing.strips_per_box} أشرطة × {p.packing.units_per_strip} حبات ({p.packing.units_per_box} حبة)
                    </td>

                    <td className="p-3">
                      <div className="font-bold font-mono text-[#F8FAFC]">
                        {stockBreakdown.displayString}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ({totalUnits} حبة)
                        {isLow && (
                          <span className="text-amber-600 font-semibold mr-1">
                            · تحت الحد الأدنى ({p.min_qty_boxes} علبة)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-mono">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {p.packing.price_box.toFixed(2)} ر.س
                      </div>
                      {p.packing.allow_sell_strip && (
                        <div className="text-[10px] text-slate-500">
                          الشريط: {p.packing.price_strip.toFixed(2)} ر.س
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      {nearestExpiryBatch ? (
                        <div className="font-mono">
                          <span
                            className={`font-semibold ${
                              nearestExpiryBatch.status === 'EXPIRED'
                                ? 'text-red-600'
                                : nearestExpiryBatch.status === 'NEAR_EXPIRY'
                                ? 'text-amber-600'
                                : 'text-[#F8FAFC]'
                            }`}
                          >
                            {nearestExpiryBatch.expiry_date}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            دفعة: {nearestExpiryBatch.batch_no}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">نفد الرصيد</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setInspectedProduct(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>كشف الدفعات ({prodBatches.length})</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Inspect Batches of a specific product */}
      {inspectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-2xl w-full p-6 shadow-2xl border border-[#334155] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <div>
                <h3 className="font-bold text-base text-[#F8FAFC]">
                  سجل دفعات: {inspectedProduct.trade_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectedProduct.active_ingredient} · {inspectedProduct.shelf_location}
                </p>
              </div>
              <button
                onClick={() => setInspectedProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4">
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    مبدأ الصرف: FEFO (الأقرب انتهاءً أولًا)
                  </span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    يتم استبعاد الدفعات المنتهية تلقائيًا ومنع صرفها وفق المعيار INV-05.
                  </p>
                </div>
                <div className="text-left font-mono">
                  <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    {getProductStockBreakdown(inspectedProduct.id).displayString}
                  </div>
                  <div className="text-[10px] text-emerald-600">إجمالي الرصيد الحالي</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#0F172A] text-slate-500 border-b border-[#334155]">
                    <tr>
                      <th className="p-2.5">رقم الدفعة</th>
                      <th className="p-2.5">تاريخ الإنتاج</th>
                      <th className="p-2.5">تاريخ الانتهاء</th>
                      <th className="p-2.5">سعر التكلفة (للعلبة)</th>
                      <th className="p-2.5">الرصيد المتبقي</th>
                      <th className="p-2.5">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {getBatchesForProduct(inspectedProduct.id).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-bold font-mono text-[#F8FAFC]">
                          {b.batch_no}
                        </td>
                        <td className="p-2.5 font-mono text-slate-500">{b.mfg_date}</td>
                        <td className="p-2.5 font-mono font-semibold">
                          <span
                            className={
                              b.status === 'EXPIRED'
                                ? 'text-red-600'
                                : b.status === 'NEAR_EXPIRY'
                                ? 'text-amber-600'
                                : 'text-[#F8FAFC]'
                            }
                          >
                            {b.expiry_date}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[#F8FAFC]">
                          {b.cost_per_box.toFixed(2)} ر.س
                        </td>
                        <td className="p-2.5 font-mono font-bold text-[#F8FAFC]">
                          {Math.floor(b.stockUnits / (inspectedProduct.packing.units_per_box || 1))} علبة ({b.stockUnits} حبة)
                        </td>
                        <td className="p-2.5">
                          {b.status === 'ACTIVE' && (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                              صالح للبيع
                            </span>
                          )}
                          {b.status === 'NEAR_EXPIRY' && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                              قارب الانتهاء
                            </span>
                          )}
                          {b.status === 'EXPIRED' && (
                            <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                              منتهي الصلاحية (محظور)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-[#334155] flex justify-end">
              <button
                onClick={() => setInspectedProduct(null)}
                className="px-4 py-2 bg-[#0F172A] hover:bg-slate-200 text-[#F8FAFC] text-xs font-semibold rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Medicine Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-lg max-w-xl w-full p-6 shadow-2xl border border-[#334155] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
              <h3 className="font-bold text-base text-[#F8FAFC]">
                بطاقة تعريف صنف دوائي جديد
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto my-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">الاسم التجاري</label>
                  <input
                    type="text"
                    required
                    value={newProd.trade_name}
                    onChange={(e) => setNewProd({ ...newProd, trade_name: e.target.value })}
                    placeholder="مثل: بروفين 400 مجم"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">الاسم العلمي</label>
                  <input
                    type="text"
                    value={newProd.generic_name}
                    onChange={(e) => setNewProd({ ...newProd, generic_name: e.target.value })}
                    placeholder="Ibuprofen"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المادة الفعالة والتركيز</label>
                  <input
                    type="text"
                    value={newProd.active_ingredient}
                    onChange={(e) => setNewProd({ ...newProd, active_ingredient: e.target.value })}
                    placeholder="Ibuprofen 400mg"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">الباركود الدولي (EAN)</label>
                  <input
                    type="text"
                    required
                    value={newProd.barcode}
                    onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                    placeholder="628100..."
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">مكان التخزين (الرف)</label>
                  <input
                    type="text"
                    value={newProd.shelf_location}
                    onChange={(e) => setNewProd({ ...newProd, shelf_location: e.target.value })}
                    placeholder="رف A-03"
                    className="w-full p-2 bg-[#0F172A] border border-[#334155] rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Units hierarchy definition */}
              <div className="p-3 bg-[#0F172A] rounded-lg border border-[#334155] space-y-2">
                <span className="font-bold text-[#F8FAFC]">
                  هرم الوحدات والتسعير (علبة ← شريط ← حبة)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-0.5">عدد الأشرطة بالعلبة</label>
                    <input
                      type="number"
                      min="1"
                      value={newProd.packing.strips_per_box}
                      onChange={(e) =>
                        setNewProd({
                          ...newProd,
                          packing: { ...newProd.packing, strips_per_box: parseInt(e.target.value) || 1 }
                        })
                      }
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md text-xs font-mono text-[#F8FAFC] focus:border-[#0EA5E9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-0.5">عدد الحبات بالشريط</label>
                    <input
                      type="number"
                      min="1"
                      value={newProd.packing.units_per_strip}
                      onChange={(e) =>
                        setNewProd({
                          ...newProd,
                          packing: { ...newProd.packing, units_per_strip: parseInt(e.target.value) || 1 }
                        })
                      }
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md text-xs font-mono text-[#F8FAFC] focus:border-[#0EA5E9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-0.5">سعر بيع العلبة (ر.س)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newProd.packing.price_box}
                      onChange={(e) =>
                        setNewProd({
                          ...newProd,
                          packing: { ...newProd.packing, price_box: parseFloat(e.target.value) || 0 }
                        })
                      }
                      className="w-full p-1.5 bg-[#0F172A] border border-[#334155] rounded-md text-xs font-mono text-[#F8FAFC] focus:border-[#0EA5E9] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#334155] border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] rounded-md transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-md transition-colors shadow-xs"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
