
import React, { useMemo } from 'react';
import type { License, Contract, Procedure } from '../types';
import { RecordStatus } from '../types';
import { DashboardIcon, LicenseIcon, ContractIcon, AgencyIcon, SupplierIcon, OtherTopicsIcon, ProcedureIcon, TrademarkIcon } from './icons/TabIcons';
import { formatCost } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
    commercialLicenses: License[];
    operationalLicenses: License[];
    civilDefenseCerts: License[];
    leaseContracts: Contract[];
    generalContracts: License[];
    specialAgencies: License[];
    trademarkCerts: License[];
    otherTopics: License[];
    procedures: Procedure[];
}

const COLORS = {
    active: '#10b981', // green
    soon: '#f59e0b',   // amber
    expired: '#ef4444', // red
    blue: '#3b82f6'
};

const Dashboard: React.FC<DashboardProps> = ({
    commercialLicenses,
    operationalLicenses,
    civilDefenseCerts,
    leaseContracts,
    generalContracts,
    specialAgencies,
    trademarkCerts,
    otherTopics,
    procedures
}) => {

    const calculateCategoryStats = (items: (License | Contract)[]) => {
        const total = items.length;
        const active = items.filter(i => i.status === RecordStatus.Active).length;
        const soon = items.filter(i => i.status === RecordStatus.SoonToExpire).length;
        const expired = items.filter(i => i.status === RecordStatus.Expired).length;
        return { total, active, soon, expired };
    };

    const stats = useMemo(() => {
        const allLicenses = [
            ...commercialLicenses,
            ...operationalLicenses,
            ...civilDefenseCerts,
            ...generalContracts,
            ...specialAgencies,
            ...trademarkCerts,
            ...otherTopics
        ];

        const totalContractCost = leaseContracts.reduce((sum, c) => sum + (c.documentedCost || 0) + (c.internalCost || 0), 0);
        const totalLicenseCost = allLicenses.reduce((sum, l) => sum + (l.cost || 0), 0);
        
        const allItemsWithStatus = [...allLicenses, ...leaseContracts];
        const totalRecords = allItemsWithStatus.length + procedures.length;
        const activeCount = allItemsWithStatus.filter(i => i.status === RecordStatus.Active).length;
        const soonCount = allItemsWithStatus.filter(i => i.status === RecordStatus.SoonToExpire).length;
        const expiredCount = allItemsWithStatus.filter(i => i.status === RecordStatus.Expired).length;

        const complianceBase = allItemsWithStatus.length;
        const complianceRate = complianceBase > 0 ? Math.round((activeCount / complianceBase) * 100) : 0;

        return {
            totalRecords,
            complianceRate,
            activeCount,
            soonCount,
            expiredCount,
            totalCost: totalContractCost + totalLicenseCost,
            categories: {
                commercial: calculateCategoryStats(commercialLicenses),
                operational: calculateCategoryStats(operationalLicenses),
                civilDefense: calculateCategoryStats(civilDefenseCerts),
                lease: calculateCategoryStats(leaseContracts),
                general: calculateCategoryStats(generalContracts),
                agency: calculateCategoryStats(specialAgencies),
                trademark: calculateCategoryStats(trademarkCerts),
                other: calculateCategoryStats(otherTopics),
            }
        };
    }, [commercialLicenses, operationalLicenses, civilDefenseCerts, leaseContracts, generalContracts, specialAgencies, trademarkCerts, otherTopics, procedures]);

    const pieData = [
        { name: 'نشط', value: stats.activeCount, color: COLORS.active },
        { name: 'قارب على الانتهاء', value: stats.soonCount, color: COLORS.soon },
        { name: 'منتهي', value: stats.expiredCount, color: COLORS.expired },
    ].filter(d => d.value > 0);

    // Modern Stat Card Component
    const InfoCard: React.FC<{ title: string; value: string | number; colorClass: string; bgClass: string; icon?: React.ReactNode }> = ({ title, value, colorClass, bgClass, icon }) => (
        <div className={`rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden bg-white group`}>
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${bgClass} rounded-bl-full opacity-20 transition-transform group-hover:scale-110`}></div>
            
            <h3 className="text-slate-500 font-bold mb-3 text-xs uppercase tracking-wider z-10">{title}</h3>
            <span className={`text-4xl font-black ${colorClass} z-10 tracking-tight`}>{value}</span>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            
            <div className="flex items-center gap-3 mb-8 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                    <DashboardIcon />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">لوحة المعلومات</h1>
                    <p className="text-slate-400 text-sm mt-1">نظرة شاملة على أداء وإحصائيات النظام</p>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                <InfoCard title="إجمالي السجلات" value={stats.totalRecords} colorClass="text-slate-800" bgClass="bg-slate-300" />
                <InfoCard title="نسبة الامتثال" value={`${stats.complianceRate}%`} colorClass={stats.complianceRate > 80 ? 'text-emerald-500' : 'text-amber-500'} bgClass={stats.complianceRate > 80 ? 'bg-emerald-200' : 'bg-amber-200'} />
                <InfoCard title="سجلات نشطة" value={stats.activeCount} colorClass="text-emerald-600" bgClass="bg-emerald-300" />
                <InfoCard title="قارب على الانتهاء" value={stats.soonCount} colorClass="text-amber-500" bgClass="bg-amber-300" />
                <InfoCard title="سجلات منتهية" value={stats.expiredCount} colorClass="text-rose-500" bgClass="bg-rose-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Cost Summary - Glassy effect */}
                 <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-8 shadow-xl text-white flex flex-col justify-center items-center relative overflow-hidden col-span-1 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-900/20 rounded-full blur-2xl"></div>
                    
                    <h3 className="text-indigo-100 font-bold mb-4 relative z-10 text-sm uppercase tracking-wide">التكلفة التقديرية الإجمالية</h3>
                    <span className="text-5xl font-black relative z-10 tracking-tight">{formatCost(stats.totalCost)}</span>
                    <span className="text-sm text-indigo-200 mt-2 font-medium bg-white/10 px-3 py-1 rounded-full relative z-10">درهم إماراتي</span>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 col-span-1 lg:col-span-2 flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-6 md:mb-0 md:mr-6">
                        <h3 className="text-slate-800 font-bold text-xl mb-2">تحليل الحالة</h3>
                        <p className="text-slate-500 text-sm max-w-xs">توزيع السجلات بناءً على حالة الصلاحية الحالية.</p>
                        
                        <div className="mt-6 space-y-3">
                            {pieData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                    <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{entry.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{entry.value} سجل</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-64 w-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={8}
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-800">{stats.activeCount + stats.soonCount + stats.expiredCount}</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">المجموع</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Cards Grid */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-slate-800">تفاصيل الفئات</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <CategoryDetailCard title="الرخص التجارية" icon={<LicenseIcon />} stats={stats.categories.commercial} />
                    <CategoryDetailCard title="الرخص التشغيلية" icon={<LicenseIcon />} stats={stats.categories.operational} />
                    <CategoryDetailCard title="الدفاع المدني" icon={<LicenseIcon />} stats={stats.categories.civilDefense} />
                    <CategoryDetailCard title="العقود الايجارية" icon={<ContractIcon />} stats={stats.categories.lease} />
                    <CategoryDetailCard title="عقود الموردين" icon={<SupplierIcon />} stats={stats.categories.general} />
                    <CategoryDetailCard title="الوكالات الخاصة" icon={<AgencyIcon />} stats={stats.categories.agency} />
                    <CategoryDetailCard title="العلامات التجارية" icon={<TrademarkIcon />} stats={stats.categories.trademark} />
                    <CategoryDetailCard title="مواضيع أخرى" icon={<OtherTopicsIcon />} stats={stats.categories.other} />
                </div>
            </div>
            
        </div>
    );
};

const CategoryDetailCard: React.FC<{ title: string; icon: React.ReactNode; stats: { total: number; active: number; soon: number; expired: number } }> = ({ title, icon, stats }) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all duration-300 hover:border-blue-100 group">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {icon}
                </div>
                <span className="font-bold text-slate-700 text-sm">{title}</span>
            </div>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg min-w-[30px] text-center">{stats.total}</span>
        </div>
        
        {/* Progress Bar Visual */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3">
            <div style={{ width: `${(stats.active / stats.total) * 100}%` }} className="bg-emerald-500 h-full"></div>
            <div style={{ width: `${(stats.soon / stats.total) * 100}%` }} className="bg-amber-400 h-full"></div>
            <div style={{ width: `${(stats.expired / stats.total) * 100}%` }} className="bg-rose-500 h-full"></div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                 <span className="font-medium">{stats.active}</span>
            </div>
            <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                 <span className="font-medium">{stats.soon}</span>
            </div>
            <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                 <span className="font-medium">{stats.expired}</span>
            </div>
        </div>
    </div>
);

export default Dashboard;
