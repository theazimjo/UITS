import React, { useState, useEffect } from 'react';
import {
    FileText, Calendar, ChevronLeft, ChevronRight,
    Users, Search, User, MoreHorizontal,
    LayoutDashboard, RefreshCw, ArrowLeft, Info,
    Download, Printer, X, Eye, TrendingUp, Target,
    CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { getStaff, getMonthlyReports, getAllMonthlyReports } from '../services/api';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------
// Professional Report Detail Modal
// ----------------------------------------------------------------------
const ReportModal = ({ report, teacher, currentMonth, onClose }) => {
    if (!report) return null;

    const getPeriodLabel = (type) => {
        switch (type) {
            case '10_DAY': return "1-10 kunlik";
            case '20_DAY': return "11-20 kunlik";
            case 'END_MONTH': return "Oy yakuni";
            default: return type;
        }
    };

    const formatDateLabel = (monthStr) => {
        const [y, m] = monthStr.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1);
        return date.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-full max-h-[90vh] rounded-2xl shadow-xl relative z-10 flex flex-col border border-gray-200 dark:border-gray-800">
                {/* Modal Header */}
                <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Hujjat tafsilotlari</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors">
                            <Printer size={16} /> <span className="hidden sm:inline">Chop etish</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                            <Download size={16} /> <span className="hidden sm:inline">PDF yuklash</span>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden max-w-3xl mx-auto">

                        {/* Document Header */}
                        <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                            <div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
                                    Rasmiy Hisobot
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {getPeriodLabel(report.reportType)}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateLabel(currentMonth)} davri uchun audit ma'lumotlari</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hujjat Raqami</p>
                                <p className="font-medium text-gray-900 dark:text-white">#{report.id}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(report.createdAt).toLocaleString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 space-y-8">
                            {/* Teacher Info */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                    {teacher.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">Mas'ul O'qituvchi</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{teacher.name}</p>
                                </div>
                            </div>

                            {/* Summary */}
                            {report.summary && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <Info size={16} className="text-blue-500" /> O'qituvchi xulosasi
                                    </h4>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                        "{report.summary}"
                                    </div>
                                </div>
                            )}

                            {/* Table */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Users size={16} className="text-blue-500" /> O'quvchilar ro'yxati
                                    </h4>
                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">
                                        Jami: {report.items?.length || 0} nafar
                                    </span>
                                </div>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 text-[11px] uppercase tracking-wider">
                                                <th className="py-3 px-4 font-medium text-left">O'quvchi</th>
                                                <th className="py-3 px-4 font-medium text-left">Guruh</th>
                                                {report.reportType === 'EXAM' ? (
                                                    <>
                                                        <th className="py-3 px-2 font-medium text-center">Joriy</th>
                                                        <th className="py-3 px-2 font-medium text-center">Nazariy</th>
                                                        <th className="py-3 px-2 font-medium text-center">Amaliy</th>
                                                        <th className="py-3 px-2 font-medium text-center">Umumiy</th>
                                                        <th className="py-3 px-2 font-medium text-center">Foiz %</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="py-3 px-4 font-medium text-center">Davomat</th>
                                                        <th className="py-3 px-4 font-medium text-center">To'lov</th>
                                                        {report.reportType === 'END_MONTH' && <th className="py-3 px-4 font-medium text-center">Natija</th>}
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {report.items?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                                                        {item.studentName}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{item.groupName}</td>

                                                    {report.reportType === 'EXAM' ? (
                                                        <>
                                                            <td className="py-3 px-2 text-center font-bold text-blue-600 dark:text-blue-400">{item.currentAverage || 0}</td>
                                                            <td className="py-3 px-2 text-center text-gray-900 dark:text-gray-100">{item.theoryScore || 0}</td>
                                                            <td className="py-3 px-2 text-center text-gray-900 dark:text-gray-100">{item.practiceScore || 0}</td>
                                                            <td className="py-3 px-2 text-center font-bold text-gray-900 dark:text-gray-100">{item.totalScore || 0}</td>
                                                            <td className="py-3 px-2 text-center">
                                                                <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md font-bold">
                                                                    {item.percentage || 0}%
                                                                </span>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                                                    {item.attendanceCount} <span className="text-xs text-gray-400 font-normal">kun</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${item.paymentStatus === 'paid' || item.paymentStatus?.includes("To'langan")
                                                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                    }`}>
                                                                    {item.paymentStatus === 'paid' || item.paymentStatus?.includes("To'langan") ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                                    {item.paymentStatus === 'paid' || item.paymentStatus?.includes("To'langan") ? "To'langan" : "Qarz"}
                                                                </span>
                                                            </td>
                                                            {report.reportType === 'END_MONTH' && (
                                                                <td className="py-3 px-4 text-center">
                                                                    {item.examScore !== null ? (
                                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium">
                                                                            {item.examScore}
                                                                        </span>
                                                                    ) : <span className="text-gray-400">—</span>}
                                                                </td>
                                                            )}
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                            {(!report.items || report.items.length === 0) && (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                                        Ma'lumotlar topilmadi
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// Main AdminReports Component
// ----------------------------------------------------------------------
const AdminReports = () => {
    const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [staffList, setStaffList] = useState([]);
    const [selectedStaffId, setSelectedStaffId] = useState('ALL');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await getStaff();
            const teachers = (res.data || []).filter(s =>
                s.isActive && (s.role?.name?.toLowerCase().includes('o\'qituvchi') || s.role?.name?.toLowerCase().includes('teacher'))
            );
            setStaffList(teachers);
        } catch (err) {
            console.error(err);
            toast.error("Xodimlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async (staffId, month) => {
        setReportsLoading(true);
        try {
            const res = staffId === 'ALL'
                ? await getAllMonthlyReports(month)
                : await getMonthlyReports(staffId, month);
            setReports(res.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Hisobotlarni yuklashda xatolik");
        } finally {
            setReportsLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);
    useEffect(() => { fetchReports(selectedStaffId, currentMonth); }, [selectedStaffId, currentMonth]);

    const changeMonth = (delta) => {
        const [y, m] = currentMonth.split('-').map(Number);
        const d = new Date(y, m - 1 + delta, 1);
        setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatDateLabel = (monthStr) => {
        const [y, m] = monthStr.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1);
        return date.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });
    };

    const getPeriodLabel = (type) => {
        switch (type) {
            case '10_DAY': return "10-kunlik";
            case '20_DAY': return "20-kunlik";
            case 'END_MONTH': return "Oy yakuni";
            default: return type;
        }
    };

    const getRelativeTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMin = Math.floor((now - date) / 60000);
        if (diffInMin < 1) return "Hozirgina";
        if (diffInMin < 60) return `${diffInMin} daqiqa oldin`;
        if (diffInMin < 1440) return `${Math.floor(diffInMin / 60)} soat oldin`;
        return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="h-full w-full flex flex-col bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">

            {/* Header */}
            <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-tight">Hisobotlar Auditi</h2>
                        <p className="text-xs text-gray-500">O'qituvchilar tahlili</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm text-gray-600 dark:text-gray-300 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium w-32 text-center capitalize">{formatDateLabel(currentMonth)}</span>
                        <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm text-gray-600 dark:text-gray-300 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => fetchReports(selectedStaffId, currentMonth)}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                        title="Yangilash"
                    >
                        <RefreshCw size={18} className={reportsLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">

                {/* Sidebar */}
                <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setSelectedStaffId('ALL')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedStaffId === 'ALL'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <LayoutDashboard size={18} /> Barcha Hisobotlar
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-1">O'qituvchilar</p>
                        <div className="space-y-1">
                            {loading ? (
                                <div className="py-4 text-center text-sm text-gray-500">Yuklanmoqda...</div>
                            ) : staffList.map(staff => (
                                <button
                                    key={staff.id}
                                    onClick={() => setSelectedStaffId(staff.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${selectedStaffId === staff.id
                                        ? 'bg-gray-100 dark:bg-gray-800 font-medium text-gray-900 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold shrink-0">
                                        {staff.name?.charAt(0)}
                                    </div>
                                    <span className="truncate">{staff.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {reportsLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                            <RefreshCw size={32} className="animate-spin text-blue-500" />
                            <p className="text-sm font-medium">Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    ) : reports.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {reports.map((r) => {
                                const teacher = staffList.find(s => s.id === r.teacherId) || { name: 'Noma\'lum o\'qituvchi' };
                                const studentsCount = r.items?.length || 0;
                                const unpaidCount = r.items?.filter(i => i.paymentStatus !== 'paid').length || 0;

                                return (
                                    <div
                                        key={r.id}
                                        onClick={() => setSelectedReport(r)}
                                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all group flex flex-col"
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300">
                                                    {teacher.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{teacher.name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock size={12} /> {getRelativeTime(r.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[11px] font-medium border ${r.reportType === 'END_MONTH'
                                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                                : r.reportType === '20_DAY'
                                                    ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400'
                                                    : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                                }`}>
                                                {getPeriodLabel(r.reportType)}
                                            </span>
                                        </div>

                                        {/* Summary Text */}
                                        <div className="flex-1 mb-5">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {r.summary || <span className="italic opacity-60">Xulosa yozilmagan...</span>}
                                            </p>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className="text-center">
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">O'quvchilar</p>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{studentsCount}</p>
                                            </div>
                                            <div className="text-center border-l border-r border-gray-100 dark:border-gray-700">
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Davomat</p>
                                                <p className="font-semibold text-blue-600 dark:text-blue-400">Yaxshi</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Qarzdorlar</p>
                                                <p className={`font-semibold ${unpaidCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    {unpaidCount}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <FileText size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Hisobotlar topilmadi</h3>
                            <p className="text-sm text-gray-500">
                                Ushbu oy uchun yoki tanlangan o'qituvchiga tegishli hisobotlar hozircha tizimga kiritilmagan.
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Integration */}
            {selectedReport && (
                <ReportModal
                    report={selectedReport}
                    teacher={staffList.find(s => s.id === selectedReport.teacherId) || { name: 'Xodim' }}
                    currentMonth={currentMonth}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </div>
    );
};

export default AdminReports;