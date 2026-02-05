
import React from 'react';
import { RecordStatus } from '../types';

interface StatusFilterProps {
  value: RecordStatus | 'all';
  onChange: (newValue: RecordStatus | 'all') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const options = [
    { value: 'all', label: 'الكل' },
    { value: RecordStatus.Active, label: RecordStatus.Active },
    { value: RecordStatus.SoonToExpire, label: RecordStatus.SoonToExpire },
    { value: RecordStatus.Expired, label: RecordStatus.Expired },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 ml-2">تصفية حسب الحالة:</span>
      <div className="flex items-center gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value as RecordStatus | 'all')}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${value === opt.value 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
