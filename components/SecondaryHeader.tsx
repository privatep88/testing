
import React from 'react';
import { Tab } from '../types';
import { TABS } from '../constants';

interface SecondaryHeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    counts: Record<string, number>;
}

const SaherLogo: React.FC = () => (
    <div className="flex items-center gap-3 px-2 mb-8">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <span className="text-xl font-bold text-white relative z-10">S</span>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-white tracking-tight leading-none">SAHER</span>
        <span className="text-[9px] font-bold text-blue-400 tracking-widest uppercase">Smart Services</span>
      </div>
    </div>
  );

const SecondaryHeader: React.FC<SecondaryHeaderProps> = ({ activeTab, onTabChange, counts }) => {
    return (
        <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-full border-l border-slate-800 flex-shrink-0 transition-all duration-300">
            <div className="p-6">
                <SaherLogo />
                <div className="space-y-1">
                    <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">القائمة الرئيسية</p>
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab.id === tab.id;
                        const count = counts[tab.id] || 0;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab)}
                                className={`
                                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                        <Icon />
                                    </span>
                                    <span className="truncate max-w-[120px]">{tab.name}</span>
                                </div>
                                
                                {count > 0 && (
                                    <span className={`
                                        inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px]
                                        ${isActive 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                                        }
                                    `}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="mt-auto p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        AD
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Admin User</p>
                        <p className="text-[10px] text-slate-400">System Administrator</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SecondaryHeader;
