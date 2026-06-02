import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import {
  getCertificateCourses,
  createCertificateRequest,
  getTeacherCertificateRequests,
  deleteTeacherCertificateRequest
} from '../../services/api';
import toast from 'react-hot-toast';
import {
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  Trash2,
  Loader2,
  Send,
  Clock,
  ChevronRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const TeacherCertificates = () => {
  const { groups: allGroups, loading: storeLoading, refreshAllRows } = useStore();
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Form States
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toLocaleDateString('ru-RU'));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refreshAllRows();
    fetchRequests();
    fetchCourses();
  }, [refreshAllRows]);

  const fetchRequests = async () => {
    setReqLoading(true);
    try {
      const res = await getTeacherCertificateRequests();
      setRequests(res.data || []);
    } catch (e) {
      console.error('Fetch requests error:', e);
      toast.error('So\'rovlarni yuklashda xatolik yuz berdi');
    } finally {
      setReqLoading(false);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await getCertificateCourses();
      setCourses(res.data?.courses || []);
    } catch (e) {
      console.error('Fetch courses error:', e);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Find selected group
  const activeGroups = (allGroups || []).filter(g => !g.isTransferred && (g.status === 'ACTIVE' || g.status === 'WAITING'));
  const currentGroup = activeGroups.find(g => g.id === parseInt(selectedGroupId));
  const activeStudents = currentGroup?.enrollments?.filter(e => e.status === 'ACTIVE' && e.student).map(e => e.student) || [];

  const handleStudentSelect = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === activeStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(activeStudents.map(s => s.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      toast.error('Iltimos, guruhni tanlang');
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error('Kamida bitta o\'quvchini tanlang');
      return;
    }
    if (!selectedTemplate) {
      toast.error('Iltimos, sertifikat shablonini tanlang');
      return;
    }

    setSubmitting(true);
    try {
      const studentsPayload = activeStudents
        .filter(s => selectedStudents.includes(s.id))
        .map(s => ({ id: s.id, name: s.name }));

      await createCertificateRequest({
        groupId: parseInt(selectedGroupId),
        students: studentsPayload,
        template: selectedTemplate,
        message: message || null,
        issueDate: issueDate || new Date().toLocaleDateString('ru-RU')
      });

      toast.success('Sertifikat so\'rovi adminga yuborildi!');
      setSelectedGroupId('');
      setSelectedStudents([]);
      setSelectedTemplate('');
      setMessage('');
      setIssueDate(new Date().toLocaleDateString('ru-RU'));
      fetchRequests();
    } catch (e) {
      console.error('Submit certificate request error:', e);
      const errMsg = e.response?.data?.message || 'So\'rov yuborishda xatolik yuz berdi';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!confirm('Ushbu so\'rovni o\'chirmoqchimisiz?')) return;
    try {
      await deleteTeacherCertificateRequest(id);
      toast.success('So\'rov muvaffaqiyatli o\'chirildi');
      fetchRequests();
    } catch (e) {
      console.error('Delete request error:', e);
      toast.error('So\'rovni o\'chirishda xatolik yuz berdi');
    }
  };

  const courseDisplayNames = {
    ks: 'Kompyuter savodxonligi',
    photo: 'Grafik dizayn (Photoshop)',
    admin: 'Admin',
    web: 'Web dizayn',
    webprogram: 'Web dasturlash (React)',
    py: 'Python Backend',
    max3d_int: '3D Max Interior',
    max3d_ext: '3D Max Exterior',
    max3d_mod: '3D Max Modeling',
    max3d: '3D Max',
    word_data: 'MS Word',
    doctor_data: 'Tibbiyot',
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10">
            Kutilmoqda
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
            Tasdiqlandi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10">
            Rad etildi
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500/10 text-gray-500 border border-gray-500/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f] relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 z-20 shrink-0">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
            <Award size={20} />
          </div>
          <div>
            <h2 className="text-[19px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Sertifikat so'rovi</h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">O'quvchilar uchun sertifikatlar tayyorlashga adminga so'rov yuborish</p>
          </div>
        </div>
      </div>

      {/* Main content body splits into Form side and List side */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Request Form Container */}
          <div className="lg:col-span-5 bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[28px] border border-gray-200/50 dark:border-white/10 p-6 shadow-sm">
            <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white mb-6 flex items-center gap-2">
              <Send size={16} className="text-emerald-500" />
              Yangi so'rov yuborish
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Select Group */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Guruhni tanlang</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                    setSelectedStudents([]);
                  }}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl text-[13px] text-[#1d1d1f] dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">Guruh...</option>
                  {activeGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.course?.name || 'Kurs nomi yo\'q'})</option>
                  ))}
                </select>
              </div>

              {/* Select Template / Course */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Sertifikat shabloni</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl text-[13px] text-[#1d1d1f] dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">Shablon...</option>
                  {courses.map(c => (
                    <option key={c.key} value={c.template}>{courseDisplayNames[c.key] || c.name}</option>
                  ))}
                </select>
              </div>

              {/* Issue Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Berilgan sana</label>
                <input
                  type="text"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  placeholder="Kun.Oy.Yil (masalan: 02.06.2026)"
                  className="w-full px-4 py-3 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl text-[13px] text-[#1d1d1f] dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-sm"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Izoh / Qo'shimcha xabar (Ixtiyoriy)</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Admin uchun qo'shimcha ko'rsatmalar..."
                  className="w-full px-4 py-3 bg-white/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl text-[13px] text-[#1d1d1f] dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none shadow-sm"
                />
              </div>

              {/* Students Selection List */}
              {selectedGroupId && (
                <div className="space-y-2 border-t border-gray-150 dark:border-white/5 pt-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">O'quvchilar ({activeStudents.length})</label>
                    {activeStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-[11px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        {selectedStudents.length === activeStudents.length ? 'Barchasini bekor qilish' : 'Barchasini tanlash'}
                      </button>
                    )}
                  </div>

                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-premium">
                    {activeStudents.length > 0 ? (
                      activeStudents.map(student => (
                        <label
                          key={student.id}
                          className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-white/[0.03] hover:bg-gray-100/50 dark:hover:bg-white/[0.05] rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer select-none transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleStudentSelect(student.id)}
                            className="w-4.5 h-4.5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500/50 cursor-pointer"
                          />
                          <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white truncate">
                            {student.name}
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-6 text-[12px] text-gray-400 font-medium">
                        Ushbu guruhda faol o'quvchilar topilmadi
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Yuborish
                    <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* RIGHT: Previous Requests List Container */}
          <div className="lg:col-span-7 bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[28px] border border-gray-200/50 dark:border-white/10 p-6 shadow-sm flex flex-col min-h-[480px]">
            <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white mb-6 flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" />
              So'rovlar tarixi
            </h3>

            {reqLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-[12px] text-gray-400 font-medium">So'rovlar tarixi yuklanmoqda...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4">
                  <Award className="text-gray-300 dark:text-gray-600" size={28} />
                </div>
                <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white mb-1">Tarix topilmadi</h4>
                <p className="text-[12px] text-gray-400 max-w-xs font-medium">Siz tomondan hali sertifikat so'rovlari yuborilmagan.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-premium max-h-[600px]">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-3xl transition-all hover:scale-[1.01]"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white tracking-tight">{req.groupName}</h4>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">{req.courseName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(req.status)}
                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-1.5 text-gray-450 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="O'chirish"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/40 dark:bg-black/20 rounded-2xl p-3 border border-gray-150/40 dark:border-white/5 space-y-2 mb-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        <Users size={12} className="text-emerald-500" />
                        O'quvchilar ({req.students?.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {req.students?.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/10 text-[11px] font-bold rounded-lg"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {req.message && (
                      <div className="flex items-start gap-2 text-[12px] text-gray-550 dark:text-gray-400 italic bg-gray-50 dark:bg-black/10 p-2.5 rounded-xl">
                        <MessageSquare size={13} className="text-gray-400 mt-0.5 shrink-0" />
                        <span>"{req.message}"</span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-gray-450 dark:text-gray-400 gap-2">
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock size={11} />
                        Sertifikat sanasi: {req.issueDate || 'Kiritilmagan'}
                      </div>
                      <div className="truncate text-right">
                        Yuborilgan: {new Date(req.createdAt).toLocaleDateString('uz-UZ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherCertificates;
