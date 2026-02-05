
import React, { useRef } from 'react';
import { SearchIcon, PrintIcon, BackupIcon, RestoreIcon } from './icons/ActionIcons';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBackup: () => void;
    onRestore: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onBackup, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shadow-sm relative z-20 print:hidden">
        
        {/* Left Side: Search */}
        <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="ابحث عن رخصة، عقد، أو رقم..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                />
            </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
             <div className="h-6 w-px bg-slate-200 mx-2"></div>

             {/* Action Buttons */}
             <div className="flex items-center gap-2">
                <button
                    onClick={onBackup}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="نسخ احتياطي للبيانات"
                >
                    <BackupIcon />
                </button>

                <button
                    onClick={handleRestoreClick}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="استعادة البيانات"
                >
                    <RestoreIcon />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".json"
                />

                <button
                    onClick={() => window.print()}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="طباعة"
                >
                    <PrintIcon />
                </button>
            </div>
        </div>
    </header>
  );
};

export default Header;
