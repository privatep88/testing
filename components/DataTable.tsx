
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { RecordStatus, Attachment } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentIcon, PdfIcon, WordIcon, ExcelIcon, PowerPointIcon, ExportIcon, SortIcon, SortAscIcon, SortDescIcon, ExcelSheetIcon, ChevronDownIcon } from './icons/ActionIcons';
import { getStatusClass, calculateRemainingPeriod, getRemainingPeriodClass, calculateRemainingDays, getStatusWeight } from '../utils';

interface Column<T> {
  key: keyof T | 'actions' | 'remaining' | 'attachments' | 'serial';
  header: string;
  render?: (item: T) => React.ReactNode;
  exportValue?: (item: T) => string | number | null | undefined;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  title: React.ReactNode;
  exportFileName: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  filterComponent?: React.ReactNode;
  disableSorting?: boolean;
  hideSortIcons?: boolean;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

const getReadableFileType = (name: string, type: string): string => {
    const n = (name || '').toLowerCase();
    const t = (type || '').toLowerCase();
    
    if (t.includes('pdf') || n.endsWith('.pdf')) return 'PDF';
    if (t.includes('word') || t.includes('document') || n.match(/\.(doc|docx)$/)) return 'Word';
    if (t.includes('excel') || t.includes('sheet') || t.includes('spreadsheet') || n.match(/\.(xls|xlsx|csv)$/)) return 'Excel';
    if (t.includes('powerpoint') || t.includes('presentation') || n.match(/\.(ppt|pptx)$/)) return 'PPT';
    if (t.startsWith('image/') || n.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'صورة';
    
    return 'ملف';
};

const DataTable = <T extends { id: number; status?: RecordStatus; expiryDate?: string; documentedExpiryDate?: string; attachments?: Attachment[]; }>({ title, exportFileName, data, columns, onAdd, onEdit, onDelete, filterComponent, disableSorting = false, hideSortIcons = false, isCollapsible = false, defaultOpen = true }: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const sortedData = useMemo(() => {
    if (disableSorting) {
      return data;
    }

    let activeKey = sortConfig.key;
    let activeDirection = sortConfig.direction;

    if (!activeKey) {
        if (data.length > 0 && (data[0] as any).status) {
            activeKey = 'status';
            activeDirection = 'asc'; 
        } else {
            return data;
        }
    }

    const sortableItems = [...data];
    sortableItems.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      const key = activeKey as keyof T | 'remaining';

      if (key === 'remaining') {
        aValue = calculateRemainingDays(a.expiryDate || a.documentedExpiryDate);
        bValue = calculateRemainingDays(b.expiryDate || b.documentedExpiryDate);
      } else {
        aValue = a[key as keyof T];
        bValue = b[key as keyof T];
      }
      
      if (aValue === null || typeof aValue === 'undefined') return 1;
      if (bValue === null || typeof bValue === 'undefined') return -1;
      
      let comparison = 0;
      
      const isDateKey = ['expiryDate', 'documentedExpiryDate', 'internalExpiryDate', 'registrationDate'].includes(key as string);
      const isStatusKey = key === 'status';

      if (isStatusKey) {
          const weightA = getStatusWeight(aValue);
          const weightB = getStatusWeight(bValue);
          comparison = weightA - weightB;

          if (comparison === 0) {
              const getDate = (item: any) => item.expiryDate || item.documentedExpiryDate || item.internalExpiryDate || item.registrationDate;
              const dateAStr = getDate(a);
              const dateBStr = getDate(b);
              const dateA = dateAStr ? new Date(dateAStr).getTime() : 9999999999999;
              const dateB = dateBStr ? new Date(dateBStr).getTime() : 9999999999999;
              comparison = dateA - dateB;
          }
      }
      else if (isDateKey && typeof aValue === 'string' && typeof bValue === 'string') {
          const dateA = new Date(aValue).getTime();
          const dateB = new Date(bValue).getTime();
          if (dateA < dateB) comparison = -1;
          if (dateA > dateB) comparison = 1;
      } 
      else if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;
      }
      else {
          comparison = String(aValue).localeCompare(String(bValue), 'ar');
      }

      return activeDirection === 'desc' ? comparison * -1 : comparison;
    });

    return sortableItems;
  }, [data, sortConfig, disableSorting]);

  const requestSort = (key: string) => {
    if (disableSorting) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const exportableColumns = columns.filter(
      (col) => col.key !== 'actions' && col.key !== 'attachments'
    );

    const exportData = sortedData.map((item, index) => {
        const row: { [key: string]: any } = {};
        exportableColumns.forEach((col) => {
            let value;
            if (col.exportValue) {
                value = col.exportValue(item);
            } else if (col.key === 'remaining') {
                value = calculateRemainingDays(item.expiryDate || item.documentedExpiryDate);
            } else if (col.key === 'serial') {
                value = index + 1;
            } else {
                value = item[col.key as keyof T];
            }
            row[col.header] = value ?? '';
        });
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const colWidths = exportableColumns.map(col => {
        const key = String(col.key);
        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('notes')) return { wch: 45 };
        if (key.toLowerCase().includes('number')) return { wch: 20 };
        if (key.toLowerCase().includes('date')) return { wch: 15 };
        if (String(col.key) === 'serial') return { wch: 5 };
        return { wch: 20 };
    });
    ws['!cols'] = colWidths;
    if(!ws['!views']) ws['!views'] = [];
    ws['!views'].push({ rightToLeft: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "البيانات");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${isOpen ? 'mb-6' : 'mb-3'} transition-all duration-300`}>
      {/* Table Header / Toolbar */}
      <div className="px-6 py-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
             <div 
                onClick={() => isCollapsible && setIsOpen(!isOpen)} 
                className={`flex items-center gap-3 ${isCollapsible ? 'cursor-pointer select-none hover:opacity-80 transition-opacity' : ''}`}
            >
                <div className="flex items-center gap-2">
                    {title}
                    {isCollapsible && (
                        <div className={`text-slate-400 p-1 rounded-full hover:bg-slate-100 transition-transform duration-200 transform ${isOpen ? 'rotate-180' : ''}`}>
                            <ChevronDownIcon />
                        </div>
                    )}
                </div>
            </div>
            {/* Filter Component Slot */}
            {filterComponent && (
                <div className="sm:pr-4 sm:border-r sm:border-slate-100">
                    {filterComponent}
                </div>
            )}
        </div>
        
        {/* Actions */}
        <div className={`flex items-center gap-3 w-full sm:w-auto transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium shadow-sm hover:shadow-md"
            >
              <ExcelSheetIcon />
              <span>تصدير</span>
            </button>
            {onAdd && (
                <button
                  onClick={onAdd}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all text-sm font-bold hover:-translate-y-0.5"
                >
                  <PlusIcon />
                  <span>إضافة</span>
                </button>
            )}
        </div>
      </div>
      
      {isOpen && (
      <div className="overflow-x-auto animate-fade-in custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-50">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col) => {
                 const isSortable = !disableSorting && !['actions', 'attachments', 'serial'].includes(String(col.key));
                 return (
                    <th key={String(col.key)} className={col.headerClassName || "whitespace-nowrap px-6 py-4 text-center font-bold text-slate-500 text-xs uppercase tracking-wider"}>
                      {isSortable ? (
                         <button onClick={() => requestSort(String(col.key))} className="flex items-center justify-center gap-1.5 group w-full focus:outline-none hover:text-blue-600 transition-colors">
                            <span>{col.header}</span>
                            {!hideSortIcons && (
                                <span className={`text-blue-500 transition-opacity ${sortConfig.key === String(col.key) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                                    {sortConfig.key === String(col.key)
                                      ? (sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />)
                                      : <SortIcon />}
                                </span>
                            )}
                         </button>
                      ) : (
                        <span>{col.header}</span>
                      )}
                    </th>
                 )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    {columns.map((col) => {
                    // Default Styling refined
                    const defaultTdClass = 'whitespace-nowrap px-6 py-4 text-slate-600 align-middle text-sm text-center font-medium';
                    const tdClass = col.cellClassName || defaultTdClass;

                    return (
                        <td key={`${item.id}-${String(col.key)}`} className={tdClass}>
                        {col.render ? (
                            col.render(item)
                        ) : col.key === 'actions' ? (
                            <div className="flex gap-2 justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل"><PencilIcon /></button>
                                <button onClick={() => onDelete(item)} className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors" title="حذف"><TrashIcon /></button>
                            </div>
                        ) : col.key === 'serial' ? (
                            <span className="font-bold text-slate-400 text-xs">{index + 1}</span>
                        ) : col.key === 'status' && item.status ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(item.status)}`}>
                                {item.status}
                            </span>
                        ) : col.key === 'remaining' ? (
                            <span className={getRemainingPeriodClass(item.expiryDate || item.documentedExpiryDate)}>
                                {calculateRemainingPeriod(item.expiryDate || item.documentedExpiryDate)}
                            </span>
                        ) : col.key === 'attachments' ? (
                            item.attachments && item.attachments.length > 0 ? (
                                <div className="flex items-center gap-1 justify-center flex-wrap max-w-[150px] mx-auto">
                                    {item.attachments.map((att, index) => (
                                        <a href={att.data} key={index} target="_blank" rel="noopener noreferrer" title={`${att.name || 'عرض الملف'} (${getReadableFileType(att.name, att.type)})`} className="hover:scale-110 transition-transform">
                                            {(() => {
                                                const type = (att.type || '').toLowerCase();
                                                const name = (att.name || '').toLowerCase();
                                                
                                                if (type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                                                    return <img src={att.data} alt="file" className="h-8 w-8 object-cover rounded-lg shadow-sm border border-slate-200" />;
                                                }
                                                if (type.includes('pdf') || name.endsWith('.pdf')) return <div className="h-8 w-8"><PdfIcon /></div>;
                                                if (type.includes('word') || type.includes('document') || name.match(/\.(doc|docx)$/)) return <div className="h-8 w-8"><WordIcon /></div>;
                                                if (type.includes('excel') || type.includes('sheet') || type.includes('spreadsheet') || name.match(/\.(xls|xlsx|csv)$/)) return <div className="h-8 w-8"><ExcelIcon /></div>;
                                                if (type.includes('powerpoint') || type.includes('presentation') || name.match(/\.(ppt|pptx)$/)) return <div className="h-8 w-8"><PowerPointIcon /></div>;
                                                
                                                return <div className="h-8 w-8"><DocumentIcon /></div>;
                                            })()}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-slate-300 text-xs">-</span>
                            )
                        ) : (
                            <span>{String(item[col.key as keyof T] ?? '')}</span>
                        )}
                        </td>
                    );
                    })}
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 bg-slate-50/50">
                        <div className="flex flex-col items-center justify-center gap-2">
                             <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             <p>لا توجد بيانات للعرض</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DataTable;
