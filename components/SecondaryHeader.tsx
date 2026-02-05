
import React from 'react';
import { Tab } from '../types';
import { TABS } from '../constants';

interface SecondaryHeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    counts: Record<string, number>;
}

const SecondaryHeader: React.FC<SecondaryHeaderProps> = ({ activeTab, onTabChange, counts }) => {
    return (
        <aside className="hidden md:flex flex-col w-72 h-screen bg-slate-900 text-white shadow-2xl z-30 flex-shrink-0 transition-all duration-300 relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 relative z-10">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                    <span className="text-2xl font-black text-white">S</span>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-slate-900"></span>
                    </span>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">SAHER</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Smart Services</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar relative z-10">
                <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">القائمة الرئيسية</p>
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab.id === tab.id;
                    const count = counts[tab.id] || 0;
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab)}
                            className={`
                                w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden
                                ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 translate-x-1'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <span className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                                    <Icon />
                                </span>
                                <span className="font-bold tracking-wide">{tab.name}</span>
                            </div>
                            
                            {count > 0 && (
                                <span className={`
                                    relative z-10 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-md min-w-[20px] transition-all duration-300
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

            {/* User Profile / Bottom Section */}
            <div className="p-4 border-t border-slate-800/50 bg-slate-800/20 relative z-10">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">مدير النظام</p>
                        <p className="text-xs text-slate-500 truncate">admin@saher.ae</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SecondaryHeader;
