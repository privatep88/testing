
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
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 py-4 flex items-center justify-between border-b border-slate-200/60 print:hidden transition-all duration-300">
        
        {/* Search Bar */}
        <div className="flex items-center flex-1 max-w-2xl">
            <div className="relative w-full group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="ابحث عن رخصة، عقد، رقم، أو ملاحظة..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="w-full pr-11 pl-4 py-3 bg-slate-100/50 border-none rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 shadow-inner"
                />
            </div>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-4 mr-6">
             {/* Action Buttons */}
             <div className="flex items-center gap-2">
                <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1">
                    <button
                        onClick={onBackup}
                        className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all tooltip-trigger relative group"
                        title="نسخ احتياطي للبيانات"
                    >
                        <BackupIcon />
                    </button>

                    <button
                        onClick={handleRestoreClick}
                        className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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

                    <div className="w-px bg-slate-200 my-1 mx-1"></div>

                    <button
                        onClick={() => window.print()}
                        className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="طباعة"
                    >
                        <PrintIcon />
                    </button>
                </div>
            </div>
        </div>
    </header>
  );
};

export default Header;
