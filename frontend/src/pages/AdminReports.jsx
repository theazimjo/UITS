import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, ChevronLeft, ChevronRight, 
  Users, Search, User, MoreHorizontal, 
  LayoutDashboard, RefreshCw, ArrowLeft, Info, 
  Download, Printer, X, Eye, Send, MessagesSquare
} from 'lucide-react';
import { getStaff, getMonthlyReports, getAllMonthlyReports } from '../services/api';
import toast from 'react-hot-toast';

// Formal Report Detail Modal
const ReportModal = ({ report, teacher, currentMonth, onClose }) => {
  if (!report) return null;

  const getPeriodLabel = (type) => {
    switch (type) {
      case '10_DAY': return "10-kunlik";
      case '20_DAY': return "20-kunlik";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#f5f5f7] dark:bg-[#111111] w-full max-w-5xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Toolbar */}
        <div className="h-16 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all text-gray-500"
            >
              <X size={20} />
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" />
            <h3 className="font-bold text-[15px] text-gray-700 dark:text-gray-200">Hisobot Tafsilotlari</h3>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-600 dark:text-gray-400 font-bold text-[13px] transition-all">
                <Printer size={16} /> <span>Chop etish</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#007aff] text-white rounded-xl font-bold text-[13px] shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">
                <Download size={16} /> <span>Yuklab olish</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar">
            {/* Professional Document Sheet */}
            <div className="bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 shadow-xl rounded-[2rem] overflow-hidden flex flex-col mx-auto max-w-4xl">
                <div className="p-10 border-b border-gray-100 dark:border-white/5 space-y-6 bg-gradient-to-br from-white to-gray-50/30 dark:from-[#2c2c2e] dark:to-[#1c1c1e]">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-[#007aff] uppercase tracking-widest">RASMIY HISOBOT VARAG'I</p>
                            <h1 className="text-3xl font-black text-[#1d1d1f] dark:text-white tracking-tight leading-none uppercase">
                                {getPeriodLabel(report.reportType)}
                            </h1>
                            <p className="text-[14px] text-gray-400 font-medium">{formatDateLabel(currentMonth)} davri uchun</p>
                        </div>
                        <div className="w-16 h-16 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-center">
                            <FileText size={32} className="text-[#007aff]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-6">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mas'ul o'qituvchi</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#007aff]/10 text-[#007aff] flex items-center justify-center font-black text-[11px]">
                                    {teacher.name?.charAt(0)}
                                </div>
                                <p className="font-bold text-[14px] text-[#1d1d1f] dark:text-white">{teacher.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Topshirilgan vaqt</p>
                            <p className="font-bold text-[14px] text-[#1d1d1f] dark:text-white">
                                {new Date(report.createdAt).toLocaleString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    {report.summary && (
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} className="text-[#007aff]" /> Izoh va xulosa
                            </h4>
                            <div className="p-6 bg-gray-50/50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                "{report.summary}"
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Users size={16} /> O'quvchilar ko'rsatkichlari
                            </h4>
                        </div>
                        
                        <div className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-[13px]">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-white/5 text-gray-400 border-b border-gray-100 dark:border-white/10">
                                        <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Student</th>
                                        <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Guruh</th>
                                        <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-center">Davomat</th>
                                        <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-center">To'lov</th>
                                        {report.reportType === 'END_MONTH' && <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-center">Ball</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {report.items?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-6 font-bold text-[#1d1d1f] dark:text-gray-200">
                                                {item.studentName}
                                            </td>
                                            <td className="py-4 px-6 text-gray-500 font-medium">{item.groupName}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="font-black text-[#007aff]">{item.attendanceCount} k</span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] border ${
                                                    item.paymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'
                                                }`}>
                                                    {item.paymentStatus === 'paid' ? "TO'LOV" : "QARZ"}
                                                </span>
                                            </td>
                                            {report.reportType === 'END_MONTH' && (
                                                <td className="py-4 px-6 text-center font-black text-[#1d1d1f] dark:text-white">
                                                    {item.examScore ?? '—'}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
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
    try {
      setReportsLoading(true);
      if (staffId === 'ALL') {
          const res = await getAllMonthlyReports(month);
          setReports(res.data || []);
      } else {
          const res = await getMonthlyReports(staffId, month);
          setReports(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Hisobotlarni yuklashda xatolik");
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchReports(selectedStaffId, currentMonth);
  }, [selectedStaffId, currentMonth]);

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

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#111111] overflow-hidden">
      
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-8 bg-white/80 dark:bg-black/20 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#007aff] text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <MessagesSquare size={20} />
          </div>
          <h2 className="text-[17px] font-black text-[#1d1d1f] dark:text-white tracking-tight">Monitoring Feed</h2>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-2xl border border-gray-200 dark:border-white/10">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-all"><ChevronLeft size={16} /></button>
                <span className="text-[12px] font-black min-w-[110px] text-center uppercase tracking-widest text-gray-500 dark:text-gray-400">{formatDateLabel(currentMonth)}</span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-all"><ChevronRight size={16} /></button>
            </div>
            <button 
                onClick={() => fetchReports(selectedStaffId, currentMonth)}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-500 hover:text-[#007aff] transition-all"
            >
                <RefreshCw size={18} className={reportsLoading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Teachers as Channels) */}
        <div className="w-72 border-r border-gray-200 dark:border-white/5 py-8 flex flex-col gap-2 px-4 bg-white/50 dark:bg-black/20 shrink-0 overflow-y-auto">
            <button 
                onClick={() => setSelectedStaffId('ALL')}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all mb-4 ${
                    selectedStaffId === 'ALL' ? 'bg-[#007aff] text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5'
                }`}
            >
                <LayoutDashboard size={18} /> Umumiy feed
            </button>

            <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mt-4">O'qituvchilar</p>
            {staffList.map(staff => (
                <button 
                    key={staff.id}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                        selectedStaffId === staff.id 
                            ? 'bg-blue-50 text-[#007aff] dark:bg-blue-900/20' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] ${
                            selectedStaffId === staff.id ? 'bg-[#007aff] text-white' : 'bg-gray-100 dark:bg-white/10'
                    }`}>
                        {staff.name?.charAt(0)}
                    </div>
                    <span className="truncate">{staff.name}</span>
                </button>
            ))}
        </div>

        {/* Chat Feed Area */}
        <div className="flex-1 bg-gray-50 dark:bg-[#121212] flex flex-col items-center overflow-y-auto pt-10 pb-20 px-6 space-y-8 custom-scrollbar relative">
            
            {/* Date Separator */}
            <div className="sticky top-0 z-10 flex justify-center mb-4">
                <span className="px-4 py-1.5 bg-gray-200/80 dark:bg-white/10 backdrop-blur-md rounded-full text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-white/20">
                    {formatDateLabel(currentMonth)}
                </span>
            </div>

            {reportsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                    <div className="w-12 h-12 border-4 border-[#007aff] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[14px] font-bold">Hisobotlar yuklanmoqda...</p>
                </div>
            ) : reports.length > 0 ? (
                <div className="w-full max-w-3xl flex flex-col space-y-12">
                    {reports.map((r) => {
                        const teacher = staffList.find(s => s.id === r.teacherId) || { name: 'Admin' };
                        return (
                            <div key={r.id} className="group relative animate-in slide-in-from-bottom-5 duration-500">
                                {/* Teacher Info & Badge */}
                                <div className="flex items-center gap-3 mb-4 ml-2">
                                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-white/10 shadow-sm flex items-center justify-center font-black text-[#007aff] border border-gray-100 dark:border-white/5">
                                        {teacher.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-black text-[#1d1d1f] dark:text-white leading-none">{teacher.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] font-bold text-gray-400">{new Date(r.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${r.reportType === 'END_MONTH' ? 'text-pink-500' : 'text-[#007aff]'}`}>
                                                {getPeriodLabel(r.reportType)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Bubble Container */}
                                <div 
                                    onClick={() => setSelectedReport(r)}
                                    className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-md group-hover:shadow-xl transition-all duration-300 p-8 cursor-pointer relative overflow-hidden active:scale-[0.98]"
                                >
                                    {/* Student Facepile (Avatars above text) */}
                                    <div className="flex items-center mb-6 pl-1 pt-1">
                                        {r.items?.slice(0, 6).map((item, i) => (
                                            <div 
                                                key={i} 
                                                className={`w-9 h-9 rounded-full border-4 border-white dark:border-[#1c1c1e] flex items-center justify-center font-bold text-[10px] -ml-3 first:ml-0 shadow-sm relative z-[${10-i}] ${
                                                    ['bg-blue-100 text-blue-600', 'bg-pink-100 text-pink-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600'][i % 4]
                                                }`}
                                            >
                                                {item.studentName?.charAt(0)}
                                            </div>
                                        ))}
                                        {r.items?.length > 6 && (
                                            <div className="w-9 h-9 rounded-full border-4 border-white dark:border-[#1c1c1e] bg-gray-100 text-gray-400 flex items-center justify-center font-black text-[10px] -ml-3 shadow-sm">
                                                +{r.items.length - 6}
                                            </div>
                                        )}
                                        <span className="ml-4 text-[12px] font-black text-gray-400 uppercase tracking-widest">O'quvchilar ko'rsatkichlari</span>
                                    </div>

                                    {/* Summary Text Bubble */}
                                    <div className="text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                        {r.summary || "Bu hisobot uchun qisqacha xulosa yozilmagan."}
                                    </div>
                                    
                                    <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                                            <span className="flex items-center gap-2"><Users size={14} /> {r.items?.length || 0} nafar</span>
                                            <span className="flex items-center gap-2"><Eye size={14} /> Batafsil</span>
                                        </div>
                                        <button className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 transition-all">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 py-32">
                    <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl border border-gray-100 dark:border-white/5 animate-pulse">
                        <MessagesSquare size={48} className="text-gray-200" />
                    </div>
                    <p className="text-[17px] font-black text-gray-400 tracking-tight">Feed bo'sh</p>
                    <p className="text-[13px] mt-2 opacity-60">Ushbu davr uchun hech qanday hisobot yuborilmagan.</p>
                </div>
            )}
            
            {/* Input Placeholder for Chat Aesthetics */}
            <div className="fixed bottom-8 left-[calc(50%+144px)] -translate-x-1/2 w-full max-w-xl bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 h-14 rounded-full shadow-2xl flex items-center px-6 gap-4 z-40">
                <div className="flex-1 text-gray-400 text-[14px] font-medium">Monitoring bo'yicha qidiruv yoki filtr...</div>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-400"><Search size={18} /></button>
                    <div className="w-8 h-8 rounded-full bg-[#007aff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30"><Send size={16} /></div>
                </div>
            </div>
        </div>
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
