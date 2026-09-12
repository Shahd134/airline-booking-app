import React from 'react';
import { Plane } from 'lucide-react';

/**
 * الموتيف البصري المميز للتطبيق: خط رحلة منقط بين مطارين مع أيقونة طيارة.
 * بيتكرر في كروت الرحلات، صفحة التفاصيل، والـ hero.
 */
export default function RoutePath({ originCode, destinationCode, compact = false, bgClassName = 'bg-white' }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <span className={`font-display font-semibold text-ink ${compact ? 'text-base' : 'text-xl'}`}>
        {originCode}
      </span>
      <span className="relative flex-1 flex items-center" style={{ minWidth: compact ? 48 : 90 }}>
        <span className="h-px w-full border-t border-dashed border-ink/25" />
        <span className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 ${bgClassName} px-1 text-sky`}>
          <Plane size={compact ? 12 : 14} className="rotate-90" />
        </span>
      </span>
      <span className={`font-display font-semibold text-ink ${compact ? 'text-base' : 'text-xl'}`}>
        {destinationCode}
      </span>
    </div>
  );
}
