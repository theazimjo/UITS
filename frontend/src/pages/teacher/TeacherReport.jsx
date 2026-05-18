import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useStore from '../../store/useStore';
import {
  sendTeacherReport, getMyTeacherReports, deleteTeacherReport,
  getAttendanceSummary, getCurrentAverages
} from '../../services/api';
import {
  FileText, Send, ChevronLeft, ChevronRight, Users,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Award, Star, X, Loader2, Clock, CalendarDays,
  Pencil, Trash2, DownloadCloud, Table as TableIcon
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
  const { students: allStudents, groups, loading, refreshAllRows } = useStore();

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
  const [attendanceCounts, setAttendanceCounts] = useState({});
  const [progressScores, setProgressScores] = useState({});
  const [homeworkStatuses, setHomeworkStatuses] = useState({});
  const [studentConclusions, setStudentConclusions] = useState({});
  const [studentNotes, setStudentNotes] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // History & Dates
  const [reports, setReports] = useState([]);
  const [activeDate, setActiveDate] = useState(null); // Which period ID is selected
  const [reportsLoading, setReportsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [activeTab, setActiveTab] = useState('HISTORY'); // 'HISTORY' or 'ANALYTICS'
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState('all'); // 'all', '10_DAY', '20_DAY', 'EXAM'

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
      const groupObj = groups.find(g => g.name === selectedGroup);
      if (!groupObj) return;

      const res = await getCurrentAverages(currentMonth, groupObj.id);
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
      .flatMap(r => r.items?.map(i => String(i.studentId)) || [])
  );

  const hasReportForPeriod = reports.some(r => r.reportType === activeDate);

  const filteredStudents = students.filter(s => {
    const matchesGroup = selectedGroup === 'all' || s.groupName === selectedGroup;
    const isReported = reportedStudentIds.has(s.id);

    if (listFilter === 'pending') return matchesGroup && !isReported;
    if (listFilter === 'reported') return matchesGroup && isReported;
    return matchesGroup;
  });

  const fetchAttendanceSummary = async () => {
    if (activeDate === 'EXAM' || selectedGroup === 'all') return;
    const groupObj = groups.find(g => g.name === selectedGroup);
    if (!groupObj) return;

    setAttendanceLoading(true);
    try {
      const res = await getAttendanceSummary(currentMonth, groupObj.id);

      const newAtts = { ...attendanceCounts };
      Object.keys(res.data).forEach(sid => {
        newAtts[sid] = res.data[sid].absent;
      });
      setAttendanceCounts(newAtts);
    } catch (err) {
      console.error("Failed to fetch attendance summary", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && activeDate !== 'EXAM' && selectedGroup !== 'all') {
      fetchAttendanceSummary();
    }
  }, [isModalOpen, activeDate, selectedGroup]);

  const toggleSelect = (id) => {
    const idStr = String(id);
    if (reportedStudentIds.has(idStr)) return; // Prevent re-reporting
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(idStr) ? next.delete(idStr) : next.add(idStr);
      return next;
    });
  };

  const toggleAll = () => {
    const unselectedVisibleIds = filteredStudents
      .filter(s => !reportedStudentIds.has(String(s.id)))
      .map(s => String(s.id));

    const allVisibleSelected = unselectedVisibleIds.length > 0 &&
      unselectedVisibleIds.every(id => selectedIds.has(id));

    if (allVisibleSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        unselectedVisibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        unselectedVisibleIds.forEach(id => next.add(id));
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

    const pickedIds = new Set(report.items.map(item => String(item.studentId)));
    setSelectedIds(pickedIds);

    const scores = {};
    const comments = {};
    const theories = {};
    const practices = {};
    const averages = {};
    const totals = {};
    const percs = {};
    const statuses = {};
    const atts = {};
    const progs = {};
    const hws = {};
    const concs = {};

    report.items.forEach(item => {
      if (item.examScore != null) scores[item.studentId] = item.examScore;
      if (item.examComment) comments[item.studentId] = item.examComment;
      if (item.theoryScore != null) theories[item.studentId] = item.theoryScore;
      if (item.practiceScore != null) practices[item.studentId] = item.practiceScore;
      if (item.currentAverage != null) averages[item.studentId] = item.currentAverage;
      if (item.totalScore != null) totals[item.studentId] = item.totalScore;
      if (item.percentage != null) percs[item.studentId] = item.percentage;
      if (item.examStatus) statuses[item.studentId] = item.examStatus;

      if (item.attendanceCount != null) atts[item.studentId] = item.attendanceCount;
      if (item.progressScore != null) progs[item.studentId] = item.progressScore;
      if (item.homeworkStatus) hws[item.studentId] = item.homeworkStatus;
      if (item.conclusion) concs[item.studentId] = item.conclusion;
    });

    setExamScores(scores);
    setExamComments(comments);
    setTheoryScores(theories);
    setPracticeScores(practices);
    setCurrentAverages(averages);
    setTotalScores(totals);
    setPercentages(percs);
    setExamStatuses(statuses);
    setAttendanceCounts(atts);
    setProgressScores(progs);
    setHomeworkStatuses(hws);
    setStudentConclusions(concs);

    setIsModalOpen(true);
  };

  const handleSend = async () => {
    if (!period || selectedIds.size === 0 || isSending) return;
    const selectedStudents = students.filter(s => selectedIds.has(String(s.id)));

    const studentNames = {};
    const groupNames = {};
    const groupIds = {};
    selectedStudents.forEach(s => {
      studentNames[s.id] = s.name;
      groupNames[s.id] = s.groupName || (s.groups && s.groups.length > 0 ? s.groups[0].name : '');
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
        theoryScores: theoryScores,
        practiceScores: practiceScores,
        currentAverages: currentAverages,
        totalScores: totalScores,
        percentages: percentages,
        examStatuses,
        attendanceCounts: attendanceCounts,
        progressScores: progressScores,
        homeworkStatuses: homeworkStatuses,
        conclusions: studentConclusions,
        notes: studentNotes,
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
      setAttendanceCounts({});
      setProgressScores({});
      setHomeworkStatuses({});
      setStudentConclusions({});
      fetchData(currentMonth);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Hisobotni yuborishda xatolik yuz berdi!");
    } finally {
      setIsSending(false);
    }
  };

  const handleExportCSV = () => {
    const data = flattenedExamData();
    if (data.length === 0) return toast.error("Eksport qilish uchun ma'lumot yo'q");

    const headers = ["O'quvchi", "Guruh", "Sana", "Joriy", "Nazariy", "Amaliy", "Umumiy", "Foiz", "Natija"];
    const rows = data.map(i => {
      const group = groups?.find(g => (i.groupId && g.id === i.groupId) || g.name === i.groupName);
      const direction = i.direction || group?.direction?.name || group?.courseName || group?.directionName || group?.course?.name || i.groupName || '—';
      return [
        i.studentName,
        direction,
        new Date(i.createdAt).toLocaleDateString(),
        i.currentAverage,
        i.theoryScore,
        i.practiceScore,
        i.totalScore,
        `${i.percentage}%`,
        i.examStatus
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Imtihon_Natijalari_${currentMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const flattenedExamData = () => {
    return reports
      .filter(r => r.reportType === 'EXAM' && (selectedGroup === 'all' || r.items.some(i => i.groupName === selectedGroup)))
      .flatMap(r => r.items.map(item => ({
        ...item,
        createdAt: r.createdAt
      })))
      .filter(item => selectedGroup === 'all' || item.groupName === selectedGroup);
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
                checked={(() => {
                  const unselectedVisibleIds = filteredStudents
                    .filter(s => !reportedStudentIds.has(String(s.id)))
                    .map(s => String(s.id));
                  return unselectedVisibleIds.length > 0 && unselectedVisibleIds.every(id => selectedIds.has(id));
                })()}
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
                  const sId = String(s.id);
                  const isSelected = selectedIds.has(sId);
                  const isReported = reportedStudentIds.has(sId);
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
                            {isReported && (
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
            <div className="flex items-center gap-6">
              <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2.5">
                <Clock size={18} className="text-blue-500" />
                Hisobotlar tarixi
                <span className="text-[12px] font-medium text-gray-400">— {monthLabel}</span>
              </h3>

              <div className="flex items-center p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-inner">
                <button
                  onClick={() => setActiveTab('HISTORY')}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FileText size={14} /> Tarix
                </button>
                <button
                  onClick={() => setActiveTab('ANALYTICS')}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === 'ANALYTICS' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <TableIcon size={14} /> Natijalar (Excel)
                </button>
              </div>
            </div>

            {activeTab === 'ANALYTICS' && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[12px] font-bold transition-all shadow-md active:scale-95"
              >
                <DownloadCloud size={14} /> CSV Yuklash
              </button>
            )}
          </div>
          
          {activeTab === 'HISTORY' && (
            <div className="px-6 py-3 bg-gray-50/50 dark:bg-black/10 border-b border-gray-200/50 dark:border-white/10 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2 shrink-0">Saralash:</span>
              {[
                { id: 'all', label: 'Barchasi' },
                { id: '10_DAY', label: '1-10 kunlar' },
                { id: '20_DAY', label: '11-20 kunlar' },
                { id: 'EXAM', label: 'Imtihonlar' }
              ].map(pTab => (
                <button
                  key={pTab.id}
                  onClick={() => setHistoryPeriodFilter(pTab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all relative shrink-0 ${
                    historyPeriodFilter === pTab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                      : 'bg-white dark:bg-white/5 text-gray-500 hover:text-[#1d1d1f] dark:hover:text-white border border-gray-200 dark:border-white/10'
                  }`}
                >
                  {pTab.label}
                  {reports.some(r => r.reportType === pTab.id) && (
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}

          {reportsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <p className="text-[13px] text-gray-400 font-medium">Hisobotlar yuklanmoqda...</p>
            </div>
          ) : activeTab === 'ANALYTICS' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse bg-white dark:bg-black/20">
                <thead className="bg-[#f2f2f2] text-black uppercase tracking-tight text-[11px] font-bold border-b-2 border-black">
                  <tr>
                    <th className="px-3 py-2 border border-black text-center w-12">№</th>
                    <th className="px-6 py-2 border border-black text-left sticky left-0 bg-[#f2f2f2] z-10">F.I.O</th>
                    <th className="px-4 py-2 border border-black text-left">Yo'nalish</th>
                    <th className="px-4 py-2 border border-black text-center">Joriy</th>
                    <th className="px-4 py-2 border border-black text-center">Nazariy</th>
                    <th className="px-4 py-2 border border-black text-center">Amaliy</th>
                    <th className="px-4 py-2 border border-black text-center">Umumiy</th>
                    <th className="px-4 py-2 border border-black text-center">Foiz %</th>
                    <th className="px-4 py-2 border border-black text-center">Holati</th>
                    <th className="px-6 py-2 border border-black text-left">Imtihon Sanasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                  {flattenedExamData().length > 0 ? flattenedExamData().map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-3 py-2 border border-black text-center font-medium">{idx + 1}</td>
                      <td className="px-6 py-2 border border-black font-black text-[#1d1d1f] dark:text-white sticky left-0 bg-white dark:bg-[#1d1d1f] group-hover:bg-blue-50 transition-colors z-10">
                        {item.studentName}
                      </td>
                      <td className="px-4 py-2 border border-black text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                        {(() => {
                          const group = groups?.find(g => (item.groupId && g.id === item.groupId) || g.name === item.groupName);
                          // Prioritize direction name or course name over group name
                          return item.direction || group?.direction?.name || group?.courseName || group?.directionName || group?.course?.name || item.groupName || '—';
                        })()}
                      </td>
                      <td className="px-4 py-2 border border-black text-center font-bold text-blue-600 dark:text-blue-400">{item.currentAverage || 0}</td>
                      <td className="px-4 py-2 border border-black text-center text-gray-800 dark:text-gray-200">{item.theoryScore || 0}</td>
                      <td className="px-4 py-2 border border-black text-center text-gray-800 dark:text-gray-200">{item.practiceScore || 0}</td>
                      <td className="px-4 py-2 border border-black text-center font-black text-black dark:text-white">{item.totalScore || 0}</td>
                      <td className="px-4 py-2 border border-black text-center font-black">{item.percentage || 0}%</td>
                      <td className="px-4 py-2 border border-black text-center">
                        <span className="text-[12px] font-bold lowercase">
                          {(!item.examStatus || item.examStatus === "O'tdi") ? "o'tdi" : "o'tmadi"}
                        </span>
                      </td>
                      <td className="px-6 py-2 border border-black text-gray-500 font-medium tabular-nums text-[12px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="10" className="py-20 text-center text-gray-400 font-medium italic border border-black">
                        Ushbu guruh yoki oy uchun imtihon natijalari topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (() => {
            const filteredReports = reports.filter(r => historyPeriodFilter === 'all' || r.reportType === historyPeriodFilter);
            const flatStudents = filteredReports.flatMap(report => 
              (report.items || []).map(item => {
                const matchedStudent = students.find(s => String(s.id) === String(item.studentId));
                return {
                  ...item,
                  groupName: item.groupName || matchedStudent?.groupName || (matchedStudent?.groups && matchedStudent.groups.length > 0 ? matchedStudent.groups[0].name : ''),
                  paymentStatus: item.paymentStatus || (matchedStudent?.isPaid ? "To'langan" : "To'lanmagan"),
                  reportType: report.reportType,
                  reportCreatedAt: report.createdAt,
                  reportId: report.id,
                  parentReport: report
                };
              })
            );
            if (flatStudents.length === 0) {
              return (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-[14px] font-medium text-gray-400 tracking-tight">
                    {historyPeriodFilter === 'all'
                      ? 'Bu oyda hali hisobotlar mavjud emas'
                      : 'Tanlangan davr uchun yuborilgan hisobotlar topilmadi'
                    }
                  </p>
                </div>
              );
            }
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border-collapse bg-white dark:bg-black/20">
                  <thead className="bg-gray-100/50 dark:bg-black/30 border-b border-gray-200/50 dark:border-white/10 uppercase tracking-wider text-[10px] font-bold text-gray-500">
                    <tr>
                      <th className="px-6 py-3 text-left">O'quvchi</th>
                      <th className="px-4 py-3 text-left">Guruh</th>
                      {historyPeriodFilter === 'all' && <th className="px-4 py-3 text-center">Davr</th>}
                      {historyPeriodFilter === 'EXAM' ? (
                        <>
                          <th className="px-2 py-3 text-center">Joriy</th>
                          <th className="px-2 py-3 text-center">Nazariy</th>
                          <th className="px-2 py-3 text-center">Amaliy</th>
                          <th className="px-2 py-3 text-center">Umumiy</th>
                          <th className="px-2 py-3 text-center">Foiz</th>
                          <th className="px-4 py-3 text-center">Natija</th>
                        </>
                      ) : (
                        <>
                          <th className="px-3 py-3 text-center">Davomat</th>
                          <th className="px-3 py-3 text-center">To'lov</th>
                          <th className="px-3 py-3 text-center">O'zlashtirish</th>
                          <th className="px-3 py-3 text-center">Vazifa</th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left">Xulosa/Izoh</th>
                      <th className="px-4 py-3 text-center">Sana</th>
                      <th className="px-4 py-3 text-center">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                    {flatStudents.map((item, idx) => {
                      const isRowExam = item.reportType === 'EXAM';
                      return (
                        <tr key={item.id || idx} className="hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-[#1d1d1f] dark:text-white">{item.studentName}</td>
                          <td className="px-4 py-3.5 text-gray-500 font-medium">{item.groupName || '—'}</td>
                          
                          {historyPeriodFilter === 'all' && (
                            <td className="px-4 py-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isRowExam ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}`}>
                                {getPeriodLabel(item.reportType)}
                              </span>
                            </td>
                          )}
                          
                          {historyPeriodFilter === 'EXAM' ? (
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
                            <>
                              {isRowExam ? (
                                <>
                                  <td className="px-3 py-3.5 text-center text-gray-500 font-medium whitespace-nowrap">
                                    N: {item.theoryScore || 0} / A: {item.practiceScore || 0}
                                  </td>
                                  <td className="px-3 py-3.5 text-center font-bold text-blue-600 dark:text-blue-400">
                                    {item.percentage || 0}%
                                  </td>
                                  <td className="px-3 py-3.5 text-center font-extrabold text-gray-700 dark:text-gray-300">
                                    Jami: {item.totalScore || 0}
                                  </td>
                                  <td className="px-3 py-3.5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.examStatus === "O'tdi" || !item.examStatus ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                      {item.examStatus || "O'tdi"}
                                    </span>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-3 py-3.5 text-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px] border border-blue-100">
                                      {isNaN(Number(item.attendanceCount)) || !item.attendanceCount ? item.attendanceCount || '—' : `${item.attendanceCount} kun`}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3.5 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.paymentStatus?.includes("To'langan")
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                      : item.paymentStatus
                                        ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                        : 'text-gray-400 border-gray-200 dark:border-white/10'
                                      }`}>
                                      {item.paymentStatus || '—'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3.5 text-center">
                                    {item.progressScore ? (
                                      <div className="flex items-center justify-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                          <Star key={i} size={10} className={i < item.progressScore ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                                        ))}
                                        <span className="ml-1 font-bold text-amber-600">{item.progressScore}</span>
                                      </div>
                                    ) : '—'}
                                  </td>
                                  <td className="px-3 py-3.5 text-center">
                                    {item.homeworkStatus ? (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.homeworkStatus === 'Aktiv' ? 'bg-emerald-100 text-emerald-600' :
                                        item.homeworkStatus === 'Passiv' ? 'bg-amber-100 text-amber-600' :
                                          'bg-red-100 text-red-600'
                                        }`}>
                                        {item.homeworkStatus}
                                      </span>
                                    ) : '—'}
                                  </td>
                                </>
                              )}
                            </>
                          )}
                          
                          <td className="px-6 py-3.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium min-w-[150px]">
                            <div className="flex flex-col gap-1">
                              {item.conclusion && (
                                <span className={`font-bold ${item.conclusion.includes('Kritik') ? 'text-red-500' : 'text-blue-500'}`}>
                                  {item.conclusion}
                                </span>
                              )}
                              <span className="italic">{item.examComment || item.note || ''}</span>
                              {!item.conclusion && !(item.examComment || item.note) && '—'}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3.5 text-center text-gray-400 font-medium whitespace-nowrap text-[11px]">
                            {new Date(item.reportCreatedAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                          </td>
                          
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditReport(item.parentReport); }}
                                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 rounded-lg transition-all"
                                title="Tahrirlash"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteReport(item.reportId); }}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-all"
                                title="O'chirish"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>

      {/* SEND REPORT FULL-SCREEN VIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#f5f5f7] dark:bg-[#1d1d1f] animate-in fade-in duration-200">
          {/* Header */}
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 px-8 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="flex items-center gap-4 border-l border-gray-200 dark:border-white/10 pl-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Send size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#1d1d1f] dark:text-white tracking-tight">Oylik Hisobot Jo'natish</h3>
                  <p className="text-[13px] text-gray-500 font-medium">
                    {period ? getPeriodLabel(period) : ''} • {selectedIds.size} ta o'quvchi tanlangan
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-xl text-[14px] font-bold transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-60 text-white rounded-xl text-[14px] font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {isSending ? "Yuborilmoqda..." : "Hisobotni Yuborish"}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-[1400px] mx-auto space-y-8">
              {(() => {
                const isExam = period === 'EXAM';
                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[16px] font-bold text-gray-400 uppercase tracking-widest">
                        {isExam ? "Imtihon natijalari jadvali" : "O'quvchilar xulosalari"}
                      </h4>
                    </div>

                    {isExam ? (
                      <div className="bg-white dark:bg-black/20 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[13px] whitespace-nowrap">
                            <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-500 font-bold uppercase tracking-tight text-[11px] border-b border-gray-200/50 dark:border-white/10">
                              <tr>
                                <th className="px-6 py-4">O'quvchi</th>
                                <th className="px-3 py-4 text-center">Joriy</th>
                                <th className="px-3 py-4 text-center">Nazariy</th>
                                <th className="px-3 py-4 text-center">Amaliy</th>
                                <th className="px-3 py-4 text-center">Umumiy</th>
                                <th className="px-3 py-4 text-center">Foiz %</th>
                                <th className="px-3 py-4 text-center">Natija</th>
                                <th className="px-6 py-4">Izoh</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                              {students.filter(s => selectedIds.has(String(s.id))).map(s => {
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
                                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[12px] font-bold text-blue-600 shrink-0">
                                          {s.name?.charAt(0)}
                                        </div>
                                        <div>
                                          <p className="font-bold text-[#1d1d1f] dark:text-white leading-none">{s.name}</p>
                                          <p className="text-[10px] text-gray-400 mt-1">{s.groupName}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                      <input
                                        type="number"
                                        value={currentAverages[s.id] || ''}
                                        onChange={(e) => setCurrentAverages(prev => ({ ...prev, [s.id]: e.target.value }))}
                                        className="w-16 bg-blue-50/50 dark:bg-blue-900/20 border-none rounded-lg py-1.5 text-center font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/30"
                                      />
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={theoryScores[s.id] || ''}
                                        onChange={(e) => handleScoreChange(s.id, 'theory', e.target.value)}
                                        className="w-16 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg py-1.5 text-center outline-none focus:ring-2 focus:ring-blue-500/30"
                                      />
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={practiceScores[s.id] || ''}
                                        onChange={(e) => handleScoreChange(s.id, 'practice', e.target.value)}
                                        className="w-16 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg py-1.5 text-center outline-none focus:ring-2 focus:ring-blue-500/30"
                                      />
                                    </td>
                                    <td className="px-3 py-4 text-center font-black text-[#1d1d1f] dark:text-white text-[15px]">
                                      {totalScores[s.id] || calculateTotal(theoryScores[s.id] || 0, practiceScores[s.id] || 0)}
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                      <input
                                        type="number"
                                        placeholder="%"
                                        value={percentages[s.id] || ''}
                                        onChange={(e) => setPercentages(prev => ({ ...prev, [s.id]: e.target.value }))}
                                        className="w-16 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg py-1.5 text-center outline-none font-bold text-emerald-600"
                                      />
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                      <select
                                        value={examStatuses[s.id] || "O'tdi"}
                                        onChange={(e) => setExamStatuses(prev => ({ ...prev, [s.id]: e.target.value }))}
                                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border outline-none transition-all ${(examStatuses[s.id] || "O'tdi") === "O'tdi"
                                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                          : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                          }`}
                                      >
                                        <option value="O'tdi">O'tdi</option>
                                        <option value="O'tmadi">O'tmadi</option>
                                      </select>
                                    </td>
                                    <td className="px-6 py-4">
                                      <input
                                        type="text"
                                        placeholder="..."
                                        value={examComments[s.id] || ''}
                                        onChange={(e) => setExamComments(prev => ({ ...prev, [s.id]: e.target.value }))}
                                        className="w-full min-w-[200px] bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-[13px] outline-none focus:ring-2 focus:ring-blue-500/30"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-black/20 rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[13px] whitespace-nowrap">
                            <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-500 font-bold uppercase tracking-tight text-[11px] border-b border-gray-200/50 dark:border-white/10">
                              <tr>
                                <th className="px-6 py-4">O'quvchi</th>
                                <th className="px-4 py-4 text-center">Davomat</th>
                                <th className="px-4 py-4 text-center">O'zlashtirish</th>
                                <th className="px-4 py-4 text-center">Vazifa</th>
                                <th className="px-6 py-4">Xulosa</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                              {students.filter(s => selectedIds.has(String(s.id))).map(s => (
                                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[12px] font-bold text-blue-600 shrink-0">
                                        {s.name?.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-[#1d1d1f] dark:text-white leading-none">{s.name}</p>
                                        <p className={`text-[10px] mt-1 font-bold ${s.isPaid ? 'text-emerald-500' : 'text-red-500'}`}>
                                          {s.isPaid ? "To'langan" : "To'lanmagan"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <div className="flex flex-col gap-1.5 items-center justify-center min-w-[120px]">
                                      <select
                                        value={['Kelyapti', 'Kelmayapti', 'Dars qoldiryapti'].includes(attendanceCounts[s.id]) ? attendanceCounts[s.id] : (attendanceCounts[s.id] ? 'Boshqa' : '')}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          if (val === 'Boshqa') {
                                            setAttendanceCounts(prev => ({ ...prev, [s.id]: '' }));
                                          } else {
                                            setAttendanceCounts(prev => ({ ...prev, [s.id]: val }));
                                          }
                                        }}
                                        className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-blue-500/30 font-bold w-full"
                                      >
                                        <option value="">Tanlang...</option>
                                        <option value="Kelyapti">Kelyapti</option>
                                        <option value="Kelmayapti">Kelmayapti</option>
                                        <option value="Dars qoldiryapti">Dars qoldiryapti</option>
                                        <option value="Boshqa">Qo'lda yozish...</option>
                                      </select>
                                      {(!['Kelyapti', 'Kelmayapti', 'Dars qoldiryapti'].includes(attendanceCounts[s.id]) || attendanceCounts[s.id] === '') && (
                                        <input
                                          type="text"
                                          placeholder="Qo'lda kiritish..."
                                          value={attendanceCounts[s.id] || ''}
                                          onChange={(e) => setAttendanceCounts(prev => ({ ...prev, [s.id]: e.target.value }))}
                                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-center text-[12px] outline-none focus:ring-2 focus:ring-blue-500/30 font-bold"
                                        />
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      {[1, 2, 3, 4, 5].map(score => (
                                        <button
                                          key={score}
                                          onClick={() => setProgressScores(prev => ({ ...prev, [s.id]: score }))}
                                          className={`w-7 h-7 rounded-lg text-[12px] font-black transition-all ${progressScores[s.id] === score
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-black/40 text-gray-400 hover:bg-gray-200'
                                            }`}
                                        >
                                          {score}
                                        </button>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <select
                                      value={homeworkStatuses[s.id] || ''}
                                      onChange={(e) => setHomeworkStatuses(prev => ({ ...prev, [s.id]: e.target.value }))}
                                      className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-blue-500/30 font-bold"
                                    >
                                      <option value="">Tanlang...</option>
                                      <option value="Aktiv">Aktiv</option>
                                      <option value="Passiv">Passiv</option>
                                      <option value="Bajarmaydi">Bajarmaydi</option>
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                      <select
                                        value={studentConclusions[s.id] || ''}
                                        onChange={(e) => setStudentConclusions(prev => ({ ...prev, [s.id]: e.target.value }))}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-blue-500/30 font-bold"
                                      >
                                        <option value="">Status tanlang...</option>
                                        <option value="O'zlashtirmoqda">O'zlashtirmoqda</option>
                                        <option value="Qiynalmoqda">Qiynalmoqda</option>
                                        <option value="Kritik: Ota-onasini chaqirish kerak">Kritik: Ota-onasini chaqirish kerak</option>
                                        <option value="Kritik: Tel qilindi">Kritik: Tel qilindi</option>
                                        <option value="Kritik: Ota-onasi chaqirildi">Kritik: Ota-onasi chaqirildi</option>
                                        <option value="Kritik: Qo'shimcha darsga yo'naltirildi">Kritik: Qo'shimcha darsga yo'naltirildi</option>
                                      </select>
                                      <textarea
                                        value={studentNotes[s.id] || ''}
                                        onChange={(e) => setStudentNotes(prev => ({ ...prev, [s.id]: e.target.value }))}
                                        placeholder="Qo'shimcha izoh yoki xulosa..."
                                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-[12px] outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[40px] resize-y"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
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
