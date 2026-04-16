import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, ChevronLeft, ChevronRight, 
  Users, CheckCircle2, Clock, Award, ChevronDown, 
  ChevronUp, Search, User, AlertCircle
} from 'lucide-react';
import { getStaff, getMonthlyReports } from '../services/api';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getStaff();
      // Filter only teachers or those who might have reports
      const teachers = (res.data || []).filter(s => 
        s.isActive && (s.role?.name?.toLowerCase().includes('o\'qituvchi') || s.role?.name?.toLowerCase().includes('teacher'))
      );
      setStaffList(teachers);
      if (teachers.length > 0) {
        setSelectedStaffId(teachers[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Xodimlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (staffId, month) => {
    if (!staffId) return;
    try {
      setReportsLoading(true);
      const res = await getMonthlyReports(staffId, month);
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
  }, []);

  useEffect(() => {
    if (selectedStaffId) {
      fetchReports(selectedStaffId, currentMonth);
    }
  }, [selectedStaffId, currentMonth]);

  const changeMonth = (delta) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const getPeriodLabel = (type) => {
    switch (type) {
      case '10_DAY': return '1-10 kunlar';
      case '20_DAY': return '11-20 kunlar';
      case 'END_MONTH': return '21-oy oxiri';
      default: return type;
    }
  };

  const selectedStaff = staffList.find(s => s.id === selectedStaffId);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fade-in pb-24">
      {/* Header & Month Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1d1d1f] dark:text-white tracking-tight leading-tight">
            Hisobotlar Monitoringi
          </h1>
          <p className="text-[15px] text-gray-400 mt-1.5 flex items-center gap-2 font-medium">
            <FileText size={16} /> O'qituvchilar tomonidan yuborilgan oylik hisobotlar
          </p>
        </div>

        <div className="flex items-center bg-white/60 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm backdrop-blur-md">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 py-1.5 flex flex-col items-center min-w-[160px]">
            <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-white uppercase tracking-wider">
              {new Date(currentMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all text-gray-600 dark:text-gray-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : staffList.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white/40 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/10">
          <AlertCircle size={40} className="mb-4 opacity-20" />
          <p>O'qituvchilar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Teacher Tabs */}
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
              {staffList.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`
                    flex items-center gap-3 px-5 py-3 rounded-2xl text-[14px] font-bold transition-all border whitespace-nowrap
                    ${selectedStaffId === staff.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10' 
                      : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5 hover:border-gray-300'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] ${
                    selectedStaffId === staff.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'
                  }`}>
                    {staff.name?.charAt(0)}
                  </div>
                  {staff.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {reportsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {['10_DAY', '20_DAY', 'END_MONTH'].map(type => {
                  const matchingReports = reports.filter(r => r.reportType === type);
                  
                  if (matchingReports.length === 0) {
                    return (
                      <div 
                        key={type}
                        className="bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-200/50 dark:border-white/10 opacity-60 bg-gray-50/50 dark:bg-transparent"
                      >
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-400">
                              {type === 'END_MONTH' ? <Award size={28} /> : <FileText size={28} />}
                            </div>
                            <div>
                              <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">
                                {getPeriodLabel(type)}
                              </h3>
                              <div className="mt-1">
                                <span className="text-[12px] text-gray-400 font-bold bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">Yuborilmagan</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return matchingReports.map(report => {
                    const isExpanded = expandedReportId === report.id;

                    return (
                      <div 
                        key={report.id}
                        className="bg-white dark:bg-white/5 rounded-3xl border border-gray-200/50 dark:border-white/10 overflow-hidden shadow-sm transition-all duration-300"
                      >
                        <div 
                          className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5"
                          onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                              {type === 'END_MONTH' ? <Award size={28} /> : <FileText size={28} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">
                                  {getPeriodLabel(type)}
                                </h3>
                                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 px-1.5 py-0.5 rounded group-hover:scale-105 transition-transform">{report.reportType}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[12px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Yuborilgan</span>
                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <Clock size={12} /> {new Date(report.createdAt).toLocaleString('uz-UZ')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">{report.items?.length || 0} ta o'quvchi</p>
                              <p className="text-[11px] text-gray-400">Jami qamrov</p>
                            </div>
                            <button className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-500">
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-6 pt-0 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/10 animate-slide-down">
                            {report.summary && (
                              <div className="my-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                  <AlertCircle size={14} /> Umumiy xulosa
                                </p>
                                <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                  "{report.summary}"
                                </p>
                              </div>
                            )}

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[13px]">
                                <thead>
                                  <tr className="text-gray-400 border-b border-gray-200 dark:border-white/5">
                                    <th className="py-3 font-semibold px-2">O'quvchi</th>
                                    <th className="py-3 font-semibold px-2">Guruh</th>
                                    <th className="py-3 font-semibold px-2 text-center">Davomat</th>
                                    <th className="py-3 font-semibold px-2 text-center">To'lov</th>
                                    {type === 'END_MONTH' && <th className="py-3 font-semibold px-2 text-center">Imtihon</th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                  {report.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                      <td className="py-4 px-2">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[11px] font-bold text-blue-600">
                                            {item.studentName?.charAt(0)}
                                          </div>
                                          <span className="font-semibold text-[#1d1d1f] dark:text-white">{item.studentName}</span>
                                        </div>
                                      </td>
                                      <td className="py-4 px-2 text-gray-500">{item.groupName}</td>
                                      <td className="py-4 px-2 text-center">
                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                          {item.attendanceCount > 0 ? `${item.attendanceCount} kun` : "Olingan"}
                                        </span>
                                      </td>
                                      <td className="py-4 px-2 text-center">
                                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                          item.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                                        }`}>
                                          {item.paymentStatus === 'paid' ? "To'langan" : "To'lanmagan"}
                                        </span>
                                      </td>
                                      {type === 'END_MONTH' && (
                                        <td className="py-4 px-2 text-center">
                                          <div className="flex flex-col items-center">
                                            <span className="text-[13px] font-bold text-blue-600">{item.examScore ?? '-'}</span>
                                            {item.examComment && (
                                              <span className="text-[10px] text-gray-400 max-w-[120px] truncate" title={item.examComment}>
                                                {item.examComment}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
