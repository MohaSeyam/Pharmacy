import React from 'react';
import { Keyboard, X, Sparkles, Check } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'التنقل العام في النظام',
      shortcuts: [
        { key: 'F1', description: 'فتح نافذة دليل اختصارات لوحة المفاتيح' },
        { key: 'F2', description: 'فتح نقطة البيع السريعة (POS) مباشرة من أي شاشة' },
        { key: 'Esc', description: 'إغلاق النوافذ المنبثقة، التنبيهات، والمعاينات' }
      ]
    },
    {
      title: 'عمليات نقطة البيع السريعة (POS)',
      shortcuts: [
        { key: 'Enter', description: 'إضافة أول نتيجة بحث / اعتماد الحقل' },
        { key: 'F3', description: 'تعليق الفاتورة الحالية مؤقتًا لخدمة زبون آخر' },
        { key: 'F4', description: 'استرجاع الفاتورة المعلّقة إلى سلة البيع' },
        { key: 'F9', description: 'تسجيل طلب دواء ضائع غير متوفر بنقرة سريعة' },
        { key: '+ / -', description: 'زيادة أو إنقاص كمية الصنف في السلة' },
        { key: 'Del', description: 'حذف السطر أو الصنف من سلة الفاتورة' },
        { key: 'Tab', description: 'التنقل السلس بين حقول الباركود والخصم وطرق الدفع' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E293B] rounded-lg max-w-lg w-full p-5 shadow-2xl border border-[#334155] flex flex-col text-[#F8FAFC]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0F172A] border border-[#334155] text-[#0EA5E9] flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F8FAFC]">
                دليل اختصارات لوحة المفاتيح
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                سرعة العمل المؤسسي والبيع السريع بالاستغناء الكامل عن الفأرة.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="my-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h4 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="divide-y divide-[#334155] border border-[#334155] rounded-md overflow-hidden bg-[#0F172A]">
                {group.shortcuts.map((sc, sIdx) => (
                  <div key={sIdx} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="text-[#F8FAFC] font-medium">
                      {sc.description}
                    </span>
                    <kbd className="kbd-shortcut text-[11px] font-bold shrink-0">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#334155] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>إغلاق</span>
            <kbd className="kbd-shortcut bg-white/20 text-white border-white/20 text-[10px]">Esc</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
