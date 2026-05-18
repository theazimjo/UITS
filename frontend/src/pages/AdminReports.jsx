import React, { useState, useEffect } from 'react';
import {
    FileText, Calendar, ChevronLeft, ChevronRight,
    Users, Search, User, MoreHorizontal,
    LayoutDashboard, RefreshCw, ArrowLeft, Info,
    Download, Printer, X, Eye, TrendingUp, Target,
    CheckCircle2, AlertCircle, Clock, Table as TableIcon, DownloadCloud
} from 'lucide-react';
import { getStaff, getMonthlyReports, getAllMonthlyReports } from '../services/api';
import useStore from '../store/useStore';
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
            case 'EXAM': return "Imtihon";
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
                                                        <th className="py-3 px-2 font-medium text-center">Natija</th>
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
                                                            <td className="py-3 px-2 text-center">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${item.examStatus === "O'tdi" || !item.examStatus
                                                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                    }`}>
                                                                    {item.examStatus || "O'tdi"}
                                                                </span>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                                                    {isNaN(Number(item.attendanceCount)) || !item.attendanceCount ? item.attendanceCount || '—' : `${item.attendanceCount} kun`}
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
    const [activeType, setActiveType] = useState('ALL');
    const { groups, refreshAllRows } = useStore();

    const flattenedExamData = () => {
        return reports
            .filter(r => r.reportType === 'EXAM')
            .flatMap(r => (r.items || []).map(item => ({
                ...item,
                createdAt: r.createdAt,
                teacherName: staffList.find(s => s.id === r.teacherId)?.name || '—'
            })));
    };

    const handleExportCSV = () => {
        const data = flattenedExamData();
        if (data.length === 0) return toast.error("Eksport qilish uchun ma'lumotlar yo'q");

        const headers = ["№", "O'quvchi", "O'qituvchi", "Yo'nalish", "Joriy", "Nazariy", "Amaliy", "Umumiy", "Foiz %", "Holati", "Sana"];
        const rows = data.map((item, idx) => {
            const group = groups?.find(g => (item.groupId && g.id === item.groupId) || g.name === item.groupName);
            const direction = item.direction || group?.direction?.name || group?.courseName || group?.directionName || group?.course?.name || item.groupName || '—';
            return [
                idx + 1,
                `"${item.studentName}"`,
                `"${item.teacherName}"`,
                `"${direction}"`,
                item.currentAverage || 0,
                item.theoryScore || 0,
                item.practiceScore || 0,
                item.totalScore || 0,
                `"${item.percentage || 0}%"`,
                `"${(!item.examStatus || item.examStatus === "O'tdi") ? "o'tdi" : "o'tmadi"}"`,
                `"${new Date(item.createdAt).toLocaleDateString()}"`
            ];
        });

        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Imtihon_Natijalari_${currentMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

    useEffect(() => { 
        fetchStaff(); 
        refreshAllRows(); // Ensure global data like groups/courses is loaded
    }, []);
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
            case '10_DAY': return "1-10 kunlik";
            case '20_DAY': return "11-20 kunlik";
            case 'END_MONTH': return "Oy yakuni";
            case 'EXAM': return "Imtihon";
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
                    {activeType === 'EXAM' && reports.some(r => r.reportType === 'EXAM') && (
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[12px] font-bold transition-all shadow-md active:scale-95"
                        >
                            <DownloadCloud size={14} /> CSV
                        </button>
                    )}
                </div>
            </header>
            
            {/* Filtering Tabs */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide">
                {[
                    { id: 'ALL', label: 'Barchasi', icon: <FileText size={14} /> },
                    { id: '10_DAY', label: '1-10 kunlik', icon: <Calendar size={14} /> },
                    { id: '20_DAY', label: '11-20 kunlik', icon: <Calendar size={14} /> },
                    { id: 'EXAM', label: 'Imtihonlar', icon: <Target size={14} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveType(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
                            activeType === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.id !== 'ALL' && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                                activeType === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                                {reports.filter(r => r.reportType === tab.id).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

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
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {reportsLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                            <RefreshCw size={32} className="animate-spin text-blue-500" />
                            <p className="text-sm font-medium">Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    ) : activeType === 'EXAM' ? (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                                <table className="w-full text-[12px] border-collapse">
                                    <thead className="bg-[#f8f9fa] dark:bg-gray-800 text-gray-700 dark:text-gray-200 uppercase tracking-tight text-[10px] font-black border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center w-10 sticky left-0 bg-[#f8f9fa] dark:bg-gray-800 z-10">№</th>
                                            <th className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-left sticky left-10 bg-[#f8f9fa] dark:bg-gray-800 z-10">F.I.O</th>
                                            <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-left">O'qituvchi</th>
                                            <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-left">Yo'nalish</th>
                                            <th className="px-2 py-3 border border-gray-200 dark:border-gray-700 text-center">Joriy</th>
                                            <th className="px-2 py-3 border border-gray-200 dark:border-gray-700 text-center">Nazariy</th>
                                            <th className="px-2 py-3 border border-gray-200 dark:border-gray-700 text-center">Amaliy</th>
                                            <th className="px-2 py-3 border border-gray-200 dark:border-gray-700 text-center">Umumiy</th>
                                            <th className="px-2 py-3 border border-gray-200 dark:border-gray-700 text-center">Foiz</th>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center">Natija</th>
                                            <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-left">Sana</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                        {flattenedExamData().length > 0 ? (
                                            flattenedExamData().map((item, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center text-gray-500 font-medium sticky left-0 bg-white dark:bg-gray-900 z-10 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">{idx + 1}</td>
                                                    <td className="px-6 py-2.5 border border-gray-100 dark:border-gray-800 font-bold text-gray-900 dark:text-white sticky left-10 bg-white dark:bg-gray-900 z-10 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">
                                                        {item.studentName}
                                                    </td>
                                                    <td className="px-4 py-2.5 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                                                        {item.teacherName}
                                                    </td>
                                                    <td className="px-4 py-2.5 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 italic">
                                                        {(() => {
                                                            const group = groups?.find(g => (item.groupId && g.id === item.groupId) || g.name === item.groupName);
                                                            // Prioritize direction name or course name over group name
                                                            return item.direction || group?.direction?.name || group?.courseName || group?.directionName || group?.course?.name || item.groupName || '—';
                                                        })()}
                                                    </td>
                                                    <td className="px-2 py-2.5 border border-gray-100 dark:border-gray-800 text-center font-bold text-blue-600">{item.currentAverage || 0}</td>
                                                    <td className="px-2 py-2.5 border border-gray-100 dark:border-gray-800 text-center">{item.theoryScore || 0}</td>
                                                    <td className="px-2 py-2.5 border border-gray-100 dark:border-gray-800 text-center">{item.practiceScore || 0}</td>
                                                    <td className="px-2 py-2.5 border border-gray-100 dark:border-gray-800 text-center font-black text-gray-900 dark:text-white">{item.totalScore || 0}</td>
                                                    <td className="px-2 py-2.5 border border-gray-100 dark:border-gray-800 text-center">
                                                        <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md font-bold text-[10px]">
                                                            {item.percentage || 0}%
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center">
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${(!item.examStatus || item.examStatus === "O'tdi")
                                                                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {(!item.examStatus || item.examStatus === "O'tdi") ? "o'tdi" : "o'tmadi"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 border border-gray-100 dark:border-gray-800 text-gray-400 tabular-nums">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="11" className="py-20 text-center text-gray-500">
                                                    Imtihon natijalari mavjud emas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : reports.filter(r => activeType === 'ALL' || r.reportType === activeType).length > 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
                                <table className="w-full text-[12px] border-collapse">
                                    <thead className="bg-[#f8f9fa] dark:bg-gray-800 text-gray-700 dark:text-gray-200 uppercase tracking-tight text-[10px] font-black border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center w-10 sticky left-0 bg-[#f8f9fa] dark:bg-gray-800 z-10">№</th>
                                            <th className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-left sticky left-10 bg-[#f8f9fa] dark:bg-gray-800 z-10">O'quvchi</th>
                                            <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-left">O'qituvchi</th>
                                            <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-left">Guruh</th>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center">Davr</th>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center">Davomat</th>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center">O'zlashtirish</th>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center">Vazifa</th>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center">To'lov</th>
                                            <th className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-left">Xulosa</th>
                                            <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-left">Sana</th>
                                            <th className="px-3 py-3 border border-gray-200 dark:border-gray-700 text-center w-20">Amal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                        {(() => {
                                            const filteredReports = reports.filter(r => activeType === 'ALL' || r.reportType === activeType);
                                            const flatStudents = filteredReports.flatMap(report => 
                                                (report.items || []).map(item => ({
                                                    ...item,
                                                    reportType: report.reportType,
                                                    reportCreatedAt: report.createdAt,
                                                    reportId: report.id,
                                                    parentReport: report,
                                                    teacherName: staffList.find(s => s.id === report.teacherId)?.name || '—'
                                                }))
                                            );

                                            return flatStudents.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center text-gray-500 font-medium sticky left-0 bg-white dark:bg-gray-900 z-10 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">{idx + 1}</td>
                                                    <td className="px-6 py-2.5 border border-gray-100 dark:border-gray-800 font-bold text-gray-900 dark:text-white sticky left-10 bg-white dark:bg-gray-900 z-10 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">
                                                        {item.studentName}
                                                    </td>
                                                    <td className="px-4 py-2.5 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                                                        {item.teacherName}
                                                    </td>
                                                    <td className="px-4 py-2.5 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                                                        {item.groupName || '—'}
                                                    </td>
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${item.reportType === 'END_MONTH'
                                                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                                            : item.reportType === '20_DAY'
                                                                ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400'
                                                                : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                                            }`}>
                                                            {getPeriodLabel(item.reportType)}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center font-medium text-blue-600">
                                                        {isNaN(Number(item.attendanceCount)) || !item.attendanceCount ? item.attendanceCount || '—' : `${item.attendanceCount} kun`}
                                                    </td>
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center font-bold">
                                                        {item.progressScore !== null && item.progressScore !== undefined ? `${item.progressScore} ball` : '—'}
                                                    </td>
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center">
                                                        {item.homeworkStatus ? (
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${item.homeworkStatus === 'Bajarildi' || item.homeworkStatus?.includes('Yaxshi') || item.homeworkStatus === 'Aktiv'
                                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
                                                                : item.homeworkStatus === 'Bajarilmadi' || item.homeworkStatus?.includes('Yomon') || item.homeworkStatus === 'Bajarmaydi'
                                                                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400'
                                                                    : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'
                                                                }`}>
                                                                {item.homeworkStatus}
                                                            </span>
                                                        ) : '—'}
                                                    </td>
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${item.paymentStatus?.includes("To'langan") || item.paymentStatus === 'paid'
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800'
                                                            : 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/30 dark:border-red-800'
                                                            }`}>
                                                            {item.paymentStatus?.includes("To'langan") || item.paymentStatus === 'paid' ? "To'langan" : "To'lanmagan"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-2.5 border border-gray-100 dark:border-gray-800 text-gray-500 max-w-xs truncate italic" title={item.conclusion || ''}>
                                                        {item.conclusion || '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5 border border-gray-100 dark:border-gray-800 text-gray-400 tabular-nums">
                                                        {new Date(item.reportCreatedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-3 py-2.5 border border-gray-100 dark:border-gray-800 text-center">
                                                        <button
                                                            onClick={() => setSelectedReport(item.parentReport)}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-600 transition-colors"
                                                            title="Batafsil ko'rish"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
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