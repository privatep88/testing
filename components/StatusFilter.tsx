
import React from 'react';
import { RecordStatus } from '../types';

interface StatusFilterProps {
  value: RecordStatus | 'all';
  onChange: (newValue: RecordStatus | 'all') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const options = [
    { value: 'all', label: 'الكل', activeClass: 'bg-slate-800 text-white shadow-md' },
    { value: RecordStatus.Active, label: RecordStatus.Active, activeClass: 'bg-emerald-500 text-white shadow-md' },
    { value: RecordStatus.SoonToExpire, label: RecordStatus.SoonToExpire, activeClass: 'bg-amber-500 text-white shadow-md' },
    { value: RecordStatus.Expired, label: RecordStatus.Expired, activeClass: 'bg-rose-500 text-white shadow-md' },
  ];

  const baseClass = "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border";
  const inactiveClass = "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-500 ml-2">تصفية حسب الحالة:</span>
      <div className="flex items-center gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value as RecordStatus | 'all')}
            className={`${baseClass} ${value === opt.value ? `${opt.activeClass} border-transparent` : inactiveClass}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
