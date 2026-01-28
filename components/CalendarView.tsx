
import React, { useState, useMemo } from 'react';
import { RecordStatus } from '../types';

interface CalendarViewProps {
    items: any[];
    onEdit: (item: any) => void;
}

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const CalendarView: React.FC<CalendarViewProps> = ({ items, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

    // Adjust for Arabic week start (Sunday is standard usually, let's assume Sunday start for simplicity or adjust)
    // The provided UI is RTL (Arabic).
    // In RTL, the calendar grid usually still flows Su-Mo-Tu... but displayed RTL?
    // Let's stick to standard layout logic and let CSS grid dir="rtl" handle the flow.

    const monthNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];

    const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const getItemsForDate = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return items.filter(item => {
            const expiry = item.expiryDate || item.documentedExpiryDate || item.internalExpiryDate;
            return expiry === dateStr;
        });
    };

    const renderCells = () => {
        const cells = [];
        
        // Empty cells for days before start of month
        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 border border-gray-100/50"></div>);
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayItems = getItemsForDate(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            cells.push(
                <div key={day} className={`h-24 border border-gray-100 p-1 relative group hover:bg-slate-50 transition-colors flex flex-col ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}>
                    <span className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                        {day}
                    </span>
                    <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                        {dayItems.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => onEdit(item)}
                                className={`
                                    text-[10px] px-1.5 py-0.5 rounded cursor-pointer truncate font-medium border-r-2 shadow-sm hover:opacity-80 transition-opacity
                                    ${item.status === RecordStatus.Expired ? 'bg-red-50 text-red-700 border-red-500' : 
                                      item.status === RecordStatus.SoonToExpire ? 'bg-yellow-50 text-yellow-700 border-yellow-500' : 
                                      'bg-green-50 text-green-700 border-green-500'}
                                `}
                                title={`${item.name} (${item.status})`}
                            >
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#f8fafc]">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span>{monthNames[month]}</span>
                        <span className="text-gray-400 font-normal">{year}</span>
                    </h2>
                    <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 text-gray-600 border-l border-gray-100">
                            <ChevronRightIcon /> {/* RTL: Right is Prev logically for time? No, usually Left is Prev in RTL calendars too depending on impl, but let's assume standard icon direction */}
                        </button>
                        <button onClick={handleToday} className="px-3 text-xs font-bold text-gray-600 hover:bg-gray-100">
                            اليوم
                        </button>
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 text-gray-600 border-r border-gray-100">
                            <ChevronLeftIcon />
                        </button>
                    </div>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-gray-600">نشط</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span className="text-gray-600">قريب</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-gray-600">منتهي</span>
                    </div>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-bold text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-gray-200 gap-px border-b border-gray-200">
                {renderCells()}
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default CalendarView;
