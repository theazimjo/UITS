import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useStore from '../../store/useStore';
import { sendTeacherReport, getMyTeacherReports, deleteTeacherReport } from '../../services/api';
import {
  FileText, Send, ChevronLeft, ChevronRight, Users,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Award, Star, X, Loader2, Clock, CalendarDays,
  Pencil, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const getPeriodLabel = (type) => {
  switch (type) {
    case '10_DAY': return '1-10 kunlar';
    case '20_DAY': return '11-20 kunlar';
    case 'EXAM': return 'Imtihon';
    default: return type;
  }
};

const TeacherReport = () => {
  const { students: allStudents, loading, refreshAllRows } = useStore();

  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [listFilter, setListFilter] = useState('all'); // 'all', 'pending', 'reported'

  // Table multi-select
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportSummary, setReportSummary] = useState('');
  const [examScores, setExamScores] = useState({});
  const [examComments, setExamComments] = useState({});
  const [theoryScores, setTheoryScores] = useState({});
  const [practiceScores, setPracticeScores] = useState({});
  const [currentAverages, setCurrentAverages] = useState({});
  const [totalScores, setTotalScores] = useState({});
  const [percentages, setPercentages] = useState({});
  const [examStatuses, setExamStatuses] = useState({});
  const [isSending, setIsSending] = useState(false);

  // History & Dates
  const [reports, setReports] = useState([]);
  const [activeDate, setActiveDate] = useState(null); // Which period ID is selected
  const [reportsLoading, setReportsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);

  useEffect(() => {
    refreshAllRows(currentMonth);
    fetchData(currentMonth);
  }, [currentMonth]);

  const fetchData = async (month) => {
    setReportsLoading(true);
    try {
      const repRes = await getMyTeacherReports(month);
      setReports(repRes.data || []);

      // Auto-select based on current day if viewing current month
      const now = new Date();
      const isCurrentMonth = now.toISOString().slice(0, 7) === month;
      if (isCurrentMonth) {
        const day = now.getDate();
        if (day <= 10) setActiveDate('10_DAY');
        else if (day <= 20) setActiveDate('20_DAY');
        else setActiveDate('EXAM');
      } else {
        // Just select 10_DAY by default for other months
        setActiveDate('10_DAY');
      }
    } catch { /* silent */ }
    finally { setReportsLoading(false); }
  };

  const fetchAverages = async () => {
    if (activeDate !== 'EXAM' || selectedGroup === 'all') return;
    try {
      const groupObj = students.find(s => s.groupName === selectedGroup);
      if (!groupObj?.groupId) return;

      const res = await axios.get(`http://localhost:3001/teacher/current-averages`, {
        params: { month: currentMonth, groupId: groupObj.groupId },
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setCurrentAverages(res.data || {});

      // Also pre-fill total scores if we have averages
      const newTotals = { ...totalScores };
      Object.keys(res.data).forEach(sid => {
        const avg = res.data[sid] || 0;
        const theory = theoryScores[sid] || 0;
        const practice = practiceScores[sid] || 0;
        newTotals[sid] = parseFloat((avg + parseFloat(theory) + parseFloat(practice)).toFixed(2));
      });
      setTotalScores(newTotals);
    } catch (e) {
      console.error("Error fetching averages:", e);
    }
  };

  useEffect(() => {
    if (activeDate === 'EXAM' && selectedGroup !== 'all') {
      fetchAverages();
    }
  }, [activeDate, selectedGroup, currentMonth]);

  const changeMonth = (delta) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const students = allStudents || [];
  const uniqueGroups = [...new Set(students.map(s => s.groupName).filter(Boolean))];

  // Get all reported student IDs for the active period (could be spread across multiple reports)
  const reportedStudentIds = new Set(
    reports
      .filter(r => r.reportType === activeDate)
      .flatMap(r => r.items?.map(i => i.studentId) || [])
  );

  const hasReportForPeriod = reports.some(r => r.reportType === activeDate);

  const filteredStudents = students.filter(s => {
    const matchesGroup = selectedGroup === 'all' || s.groupName === selectedGroup;
    const isReported = reportedStudentIds.has(s.id);

    if (listFilter === 'pending') return matchesGroup && !isReported;
    if (listFilter === 'reported') return matchesGroup && isReported;
    return matchesGroup;
  });

  const toggleSelect = (id) => {
    if (reportedStudentIds.has(id)) return; // Prevent re-reporting
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const visibleIds = filteredStudents.filter(s => !reportedStudentIds.has(s.id)).map(s => s.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));

    if (allVisibleSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const period = activeDate;

  const openModal = () => {
    if (!period) return toast.error("Faqat joriy oy uchun hisobot jo'natish mumkin!");
    if (selectedIds.size === 0) return toast.error("Kamida 1 ta o'quvchi tanlang!");
    setIsEditingReport(false);
    setEditingReportId(null);
    setIsModalOpen(true);
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Haqiqatdan ham ushbu hisobotni o\'chirmoqchimisiz?')) return;
    try {
      await deleteTeacherReport(id);
      toast.success('Hisobot o\'chirildi');
      fetchData(currentMonth);
    } catch (e) {
      toast.error('O\'chirishda xatolik yuz berdi');
    }
  };

  const handleEditReport = (report) => {
    // Fill state
    setIsEditingReport(true);
    setEditingReportId(report.id);
    setActiveDate(report.reportType);
    setReportSummary(report.summary || '');

    const pickedIds = new Set(report.items.map(item => item.studentId));
    setSelectedIds(pickedIds);

    const scores = {};
    const comments = {};
    const theories = {};
    const practices = {};
    const averages = {};
    const totals = {};
    const percs = {};
    const statuses = {};

    report.items.forEach(item => {
      if (item.examScore != null) scores[item.studentId] = item.examScore;
      if (item.examComment) comments[item.studentId] = item.examComment;
      if (item.theoryScore != null) theories[item.studentId] = item.theoryScore;
      if (item.practiceScore != null) practices[item.studentId] = item.practiceScore;
      if (item.currentAverage != null) averages[item.studentId] = item.currentAverage;
      if (item.totalScore != null) totals[item.studentId] = item.totalScore;
      if (item.percentage != null) percs[item.studentId] = item.percentage;
      if (item.examStatus) statuses[item.studentId] = item.examStatus;
    });

    setExamScores(scores);
    setExamComments(comments);
    setTheoryScores(theories);
    setPracticeScores(practices);
    setCurrentAverages(averages);
    setTotalScores(totals);
    setPercentages(percs);
    setExamStatuses(statuses);

    setIsModalOpen(true);
  };

  const handleSend = async () => {
    if (!period || selectedIds.size === 0 || isSending) return;
    const selectedStudents = filteredStudents.filter(s => selectedIds.has(s.id));

    const studentNames = {};
    const groupNames = {};
    const groupIds = {};
    selectedStudents.forEach(s => {
      studentNames[s.id] = s.name;
      groupNames[s.id] = s.groupName || '';
      // Try to get groupId from direct property, then from groups array
      groupIds[s.id] = s.groupId || (s.groups && s.groups.length > 0 ? s.groups[0].id : 0);
    });

    try {
      setIsSending(true);
      await sendTeacherReport({
        month: currentMonth,
        reportType: period,
        summary: reportSummary,
        studentIds: Array.from(selectedIds),
        studentNames,
        groupNames,
        groupIds,
        examScores,
        examComments,
        theoryScores,
        practiceScores,
        currentAverages,
        totalScores,
        percentages,
        examStatuses,
        mode: isEditingReport ? 'replace' : 'merge',
        reportId: isEditingReport ? editingReportId : null
      });
      toast.success(isEditingReport ? "Hisobot yangilandi! ✅" : "Hisobot yuborildi! ✅");
      setIsModalOpen(false);
      setSelectedIds(new Set());
      setReportSummary('');
      setExamScores({});
      setExamComments({});
      setTheoryScores({});
      setPracticeScores({});
      setTotalScores({});
      setPercentages({});
      setExamStatuses({});
      fetchData(currentMonth);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Hisobotni yuborishda xatolik yuz berdi!");
    } finally {
      setIsSending(false);
    }
  };

  const [year, month] = currentMonth.split('-').map(Number);
  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f] overflow-hidden">

      {/* Header */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 z-20 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-[19px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Oylik Hisobot</h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 font-medium">Adminga hisobot yuborish</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selection Tabs */}
          <div className="flex items-center p-1 bg-gray-200/80 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/10 shadow-inner mr-2">
            {[
              { id: '10_DAY', label: '1-10' },
              { id: '20_DAY', label: '11-20' },
              { id: 'EXAM', label: 'Imtihon' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setActiveDate(p.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all relative ${activeDate === p.id
                  ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {p.label}
                {reports.some(r => r.reportType === p.id) && (
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Month nav */}
          <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner">
            <button onClick={() => changeMonth(-1)} className="px-2 py-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-gray-600 dark:text-gray-300">
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 text-[12px] font-bold text-[#1d1d1f] dark:text-white min-w-[140px] text-center">
              {monthLabel}
            </span>
            <button onClick={() => changeMonth(1)} className="px-2 py-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-gray-600 dark:text-gray-300">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Group filter */}
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="bg-white/60 dark:bg-black/20 border border-gray-200/50 dark:border-white/10 rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#1d1d1f] dark:text-white outline-none shadow-sm"
          >
            <option value="all">Barcha guruhlar</option>
            {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Period Status Banner */}
        <div className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm backdrop-blur-md ${period
          ? hasReportForPeriod
            ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30'
            : 'bg-blue-50/60 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/30'
          : 'bg-gray-50/60 dark:bg-white/5 border-gray-200/50 dark:border-white/10'
          }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${period
              ? hasReportForPeriod
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'
              : 'bg-gray-100 dark:bg-white/10 text-gray-400'
              }`}>
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">
                {period ? `Tanlangan davr: ${getPeriodLabel(period)}` : "Hisobot davrini tanlang"}
              </p>
              <p className="text-[11px] text-gray-500">
                {period
                  ? hasReportForPeriod
                    ? `ℹ️ Ushbu davr uchun hisobot yuborilgan. Yangi o'quvchilarni tanlab, yana alohida hisobot yuborishingiz mumkin.`
                    : "Hali hisobot yuborilmagan — o'quvchilarni tanlab yuboring"
                  : "Yuqoridan kerakli davrni tanlang"
                }
              </p>
            </div>
          </div>

          {selectedIds.size > 0 && period && (
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl text-[13px] font-semibold transition-all shadow-md border border-blue-800/40"
            >
              <Send size={15} />
              Hisobot Yuborish ({selectedIds.size})
            </button>
          )}
        </div>

        {/* List Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-200/50 dark:bg-black/20 p-1 rounded-xl border border-gray-200/50 dark:border-white/10 w-fit">
          {[
            { id: 'all', label: 'Barchasi', icon: Users },
            { id: 'pending', label: 'Yuborilmaganlar', icon: AlertCircle },
            { id: 'reported', label: 'Yuborilganlar', icon: CheckCircle2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setListFilter(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all
                ${listFilter === tab.id
                  ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
              `}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.id === 'pending' && reportedStudentIds.size < students.length && (
                <span className="ml-1 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-[10px]">
                  {students.length - reportedStudentIds.size}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Students Table */}
        <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-5 py-3 border-b border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length}
                onChange={toggleAll}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
              <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                O'quvchilar ({filteredStudents.length} ta)
              </span>
            </div>
            {selectedIds.size > 0 && (
              <span className="text-[12px] font-semibold text-blue-500">
                {selectedIds.size} tanlangan
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <span className="text-[13px]">Yuklanmoqda...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-[13px]">O'quvchilar topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="bg-gray-100/50 dark:bg-black/30 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10">
                <tr>
                  <th className="pl-5 pr-3 py-3 w-10"></th>
                  <th className="px-3 py-3 font-medium uppercase tracking-wider text-[11px]">Ism-Sharif</th>
                  <th className="px-3 py-3 font-medium uppercase tracking-wider text-[11px]">Guruh</th>
                  <th className="px-3 py-3 font-medium uppercase tracking-wider text-[11px] text-center">To'lov</th>
                  <th className="px-3 py-3 font-medium uppercase tracking-wider text-[11px] text-center">Bugungi davomat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                {filteredStudents.map(s => {
                  const isSelected = selectedIds.has(s.id);
                  const isReported = reportedStudentIds.has(s.id);
                  const today = new Date().getDate();
                  const todayStatus = s.attendance?.[today];
                  const status = typeof todayStatus === 'object' ? todayStatus?.status : todayStatus;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => toggleSelect(s.id)}
                      className={`transition-colors ${isReported ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer'} ${isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50/80'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                      <td className="pl-5 pr-3 py-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                          ? 'bg-blue-500 border-blue-500 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black/20'
                          }`}>
                          {isSelected && <CheckCircle2 size={13} className="text-white" />}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {s.photo ? (
                            <img src={s.photo} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200/50 shadow-sm shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[11px] font-bold text-gray-500 shrink-0">
                              {s.name?.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate max-w-[180px]">
                              {s.name}
                            </span>
                            {reportedStudentIds.has(s.id) && (
                              <span className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                <CheckCircle2 size={10} /> Yuborilgan
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-500 text-[12px]">{s.groupName || '—'}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.isPaid
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-800'
                          }`}>
                          {s.isPaid ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                          {s.isPaid ? "To'langan" : "To'lanmagan"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {status === 'present' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 size={10} /> Keldi
                          </span>
                        ) : status === 'absent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-200 dark:border-red-800">
                            <AlertCircle size={10} /> Kelmadi
                          </span>
                        ) : (
                          <span className="text-gray-300 text-[12px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Report History Section */}
        <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/10 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2.5">
              <Clock size={18} className="text-blue-500" />
              Hisobotlar tarixi
              <span className="text-[12px] font-medium text-gray-400">— {monthLabel}</span>
            </h3>
          </div>

          {reportsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <p className="text-[13px] text-gray-400 font-medium">Hisobotlar yuklanmoqda...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-[14px] font-medium text-gray-400 tracking-tight">Bu oyda hali hisobotlar mavjud emas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/30 dark:divide-white/5">
              {reports
                .filter(r => !activeDate || r.reportType === activeDate)
                .map(report => {
                  const isExam = report.reportType === 'EXAM';
                  const passedCount = report.items?.filter(i => i.examStatus === "O'tdi").length || 0;
                  const totalItems = report.items?.length || 0;

                  return (
                    <div key={report.id} className="transition-all duration-200">
                      <div
                        className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group ${expandedId === report.id ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                        onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${isExam ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'}`}>
                            {isExam ? <Award size={22} strokeWidth={2.5} /> : <FileText size={22} strokeWidth={2.5} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-white tracking-tight">
                                {getPeriodLabel(report.reportType)}
                              </span>
                              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                                {new Date(report.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users size={12} className="opacity-70" /> {totalItems} ta o'quvchi
                              </span>
                              {isExam && (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500">
                                  <CheckCircle2 size={12} /> {passedCount} ta o'tdi
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="opacity-70" /> {new Date(report.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditReport(report); }}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 rounded-xl transition-all"
                              title="Tahrirlash"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-xl transition-all"
                              title="O'chirish"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className={`p-1 rounded-full transition-transform duration-300 ${expandedId === report.id ? 'rotate-180 bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-400'}`}>
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </div>

                      {expandedId === report.id && (
                        <div className="overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/10">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[12px] border-collapse">
                              <thead className="bg-gray-100/50 dark:bg-black/30 border-b border-gray-200/50 dark:border-white/10 uppercase tracking-wider text-[10px] font-bold text-gray-500">
                                <tr>
                                  <th className="px-6 py-3 text-left">O'quvchi</th>
                                  <th className="px-4 py-3 text-left">Guruh</th>
                                  {isExam ? (
                                    <>
                                      <th className="px-2 py-3 text-center">Joriy</th>
                                      <th className="px-2 py-3 text-center">Nazariy</th>
                                      <th className="px-2 py-3 text-center">Amaliy</th>
                                      <th className="px-2 py-3 text-center">Umumiy</th>
                                      <th className="px-2 py-3 text-center">Foiz</th>
                                      <th className="px-4 py-3 text-center">Natija</th>
                                    </>
                                  ) : (
                                    <th className="px-4 py-3 text-center">To'lov Statusi</th>
                                  )}
                                  <th className="px-6 py-3 text-left">Izoh</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {(report.items || []).map(item => (
                                  <tr key={item.id} className="hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-3.5 font-bold text-[#1d1d1f] dark:text-white">{item.studentName}</td>
                                    <td className="px-4 py-3.5 text-gray-500 font-medium">{item.groupName || '—'}</td>

                                    {isExam ? (
                                      <>
                                        <td className="px-2 py-3.5 text-center font-bold text-blue-600 dark:text-blue-400">{item.currentAverage || 0}</td>
                                        <td className="px-2 py-3.5 text-center text-gray-600 dark:text-gray-400">{item.theoryScore || 0}</td>
                                        <td className="px-2 py-3.5 text-center text-gray-600 dark:text-gray-400">{item.practiceScore || 0}</td>
                                        <td className="px-2 py-3.5 text-center font-extrabold text-[#1d1d1f] dark:text-white">{item.totalScore || 0}</td>
                                        <td className="px-2 py-3.5 text-center">
                                          <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                                            {item.percentage || 0}%
                                          </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.examStatus === "O'tdi" || !item.examStatus
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                            : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                            }`}>
                                            {item.examStatus || "O'tdi"}
                                          </span>
                                        </td>
                                      </>
                                    ) : (
                                      <td className="px-4 py-3.5 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.paymentStatus?.includes("To'langan")
                                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                          : item.paymentStatus
                                            ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                            : 'text-gray-400 border-gray-200 dark:border-white/10'
                                          }`}>
                                          {item.paymentStatus || '—'}
                                        </span>
                                      </td>
                                    )}
                                    <td className="px-6 py-3.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium min-w-[150px]">
                                      {item.examComment || item.note || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {report.summary && (
                            <div className="mx-6 my-4 p-4 bg-white/80 dark:bg-black/30 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm">
                              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                <Send size={12} /> Umumiy xulosa
                              </p>
                              <p className="text-[13px] text-[#1d1d1f] dark:text-gray-300 italic font-medium">"{report.summary}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* SEND REPORT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-[#1c1c1e] w-full max-w-[650px] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            style={{ animation: 'scaleIn 0.2s ease-out' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Send size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-white">Hisobot Yuborish</h3>
                  <p className="text-[11px] text-gray-500">{period ? getPeriodLabel(period) : ''} • {selectedIds.size} ta o'quvchi</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Selected Students List */}
            {(() => {
              const isExam = period === 'EXAM';
              return (
                <div className="px-6 pt-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                    {isExam ? "Imtihon natijalari jadvali" : "Tanlangan o'quvchilar"}
                  </p>

                  {isExam ? (
                    <div className="overflow-x-auto border border-gray-100 dark:border-white/5 rounded-2xl">
                      <table className="w-full text-left text-[12px] whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-black/30 text-gray-400 font-bold uppercase tracking-tight text-[10px]">
                          <tr>
                            <th className="px-4 py-3">O'quvchi</th>
                            <th className="px-2 py-3 text-center">Joriy</th>
                            <th className="px-2 py-3 text-center">Nazariy</th>
                            <th className="px-2 py-3 text-center">Amaliy</th>
                            <th className="px-2 py-3 text-center">Umumiy</th>
                            <th className="px-2 py-3 text-center">Foiz %</th>
                            <th className="px-2 py-3 text-center">Natija</th>
                            <th className="px-4 py-3">Izoh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                          {filteredStudents.filter(s => selectedIds.has(s.id)).map(s => {
                            const avg = currentAverages[s.id] || 0;
                            const theory = theoryScores[s.id] || '';
                            const practice = practiceScores[s.id] || '';

                            const calculateTotal = (t, p) => {
                              const total = parseFloat(avg) + (parseFloat(t) || 0) + (parseFloat(p) || 0);
                              return parseFloat(total.toFixed(2));
                            };

                            const handleScoreChange = (sid, type, val) => {
                              if (type === 'theory') {
                                setTheoryScores(prev => ({ ...prev, [sid]: val }));
                                const newTotal = calculateTotal(val, practiceScores[sid]);
                                setTotalScores(prev => ({ ...prev, [sid]: newTotal }));
                              } else {
                                setPracticeScores(prev => ({ ...prev, [sid]: val }));
                                const newTotal = calculateTotal(theoryScores[sid], val);
                                setTotalScores(prev => ({ ...prev, [sid]: newTotal }));
                              }
                            };

                            return (
                              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="px-4 py-3 font-semibold text-[#1d1d1f] dark:text-white">
                                  {s.name}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <input
                                    type="number"
                                    value={currentAverages[s.id] || ''}
                                    onChange={(e) => setCurrentAverages(prev => ({ ...prev, [s.id]: e.target.value }))}
                                    className="w-14 bg-blue-50/50 dark:bg-blue-900/10 border-none rounded text-center font-bold text-blue-600 outline-none"
                                  />
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={theoryScores[s.id] || ''}
                                    onChange={(e) => handleScoreChange(s.id, 'theory', e.target.value)}
                                    className="w-14 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded text-center outline-none"
                                  />
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={practiceScores[s.id] || ''}
                                    onChange={(e) => handleScoreChange(s.id, 'practice', e.target.value)}
                                    className="w-14 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded text-center outline-none"
                                  />
                                </td>
                                <td className="px-2 py-3 text-center font-bold text-[#1d1d1f] dark:text-white">
                                  {totalScores[s.id] || calculateTotal(theoryScores[s.id] || 0, practiceScores[s.id] || 0)}
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <input
                                    type="number"
                                    placeholder="%"
                                    value={percentages[s.id] || ''}
                                    onChange={(e) => setPercentages(prev => ({ ...prev, [s.id]: e.target.value }))}
                                    className="w-14 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded text-center outline-none"
                                  />
                                </td>
                                <td className="px-2 py-3 text-center">
                                  <select
                                    value={examStatuses[s.id] || "O'tdi"}
                                    onChange={(e) => setExamStatuses(prev => ({ ...prev, [s.id]: e.target.value }))}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none transition-all ${(examStatuses[s.id] || "O'tdi") === "O'tdi"
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                      : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                      }`}
                                  >
                                    <option value="O'tdi">O'tdi</option>
                                    <option value="O'tmadi">O'tmadi</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    placeholder="..."
                                    value={examComments[s.id] || ''}
                                    onChange={(e) => setExamComments(prev => ({ ...prev, [s.id]: e.target.value }))}
                                    className="w-full min-w-[100px] bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1 outline-none"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                      {filteredStudents.filter(s => selectedIds.has(s.id)).map(s => (
                        <div key={s.id} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 flex gap-3 flex-col sm:flex-row sm:items-start">
                          <div className="flex items-center gap-3 w-full sm:w-1/2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[11px] font-bold text-blue-600 shrink-0">
                              {s.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white truncate">
                                {s.name}
                                {reportedStudentIds.has(s.id) && (
                                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                                    <CheckCircle2 size={10} /> Yuborilgan
                                  </span>
                                )}
                              </p>
                              <p className="text-[12px] text-gray-400 font-medium">#{s.id} • {s.groupName || 'Guruhsiz'}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                              } shrink-0`}>
                              {s.isPaid ? "To'langan" : "To'lanmagan"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Summary Input */}
            <div className="px-6 pt-4 pb-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Umumiy Xulosa</label>
              <textarea
                value={reportSummary}
                onChange={e => setReportSummary(e.target.value)}
                placeholder="Bu o'quvchilar haqida umumiy fikr yoki izoh yozing..."
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-[13px] text-[#1d1d1f] dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all min-h-[100px] resize-none"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-6 py-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-2xl text-[14px] font-bold transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-60 text-white rounded-2xl text-[14px] font-bold shadow-xl shadow-blue-500/20 transition-all"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {isSending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default TeacherReport;
