import React, { useState, useEffect, useMemo } from 'react';
import {
  getCertificateCourses, getCertificates, getCertificateStats,
  getCertificateImageUrl, createCertificate, deleteCertificate, generateCertificates,
  getNextCertificateId, getAllCertificateRequests, updateCertificateRequestStatus,
  generateBulkCertificates, downloadBulkCertificatesZip
} from '../services/api';
import toast from 'react-hot-toast';
import {
  Award, Search, Plus, Trash2, Download, Eye, RefreshCw,
  FileText, ChevronRight, X, BookOpen, Users, LayoutDashboard,
  ExternalLink, Calendar, Hash, User, Filter, FilterX, HelpCircle,
  GraduationCap, ChevronDown, Check, Phone, MessageSquare, Loader2
} from 'lucide-react';
import Modal from '../components/common/Modal';
import Skeleton from '../components/common/Skeleton';

// Uzbek month names helper
const getMonthNameUz = (m) => {
  const names = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  return names[m - 1] || 'Noma\'lum';
};

const incrementCertId = (certId) => {
  const match = certId.match(/^(.*?)(\d+)$/);
  if (!match) {
    return certId + '1';
  }
  const prefix = match[1];
  const numStr = match[2];
  const nextNum = parseInt(numStr, 10) + 1;
  const nextNumStr = String(nextNum).padStart(numStr.length, '0');
  return prefix + nextNumStr;
};

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, byCourse: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Request States
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'requests'
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [processingReqId, setProcessingReqId] = useState(null);
  const [downloadingZipId, setDownloadingZipId] = useState(null);

  // Filtering states
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewCertId, setPreviewCertId] = useState('');

  // Create form
  const [newCert, setNewCert] = useState({ fullName: '', certId: '', date: '', template: '' });

  // Fetch next ID and date for single creation modal
  useEffect(() => {
    if (isCreateOpen) {
      const todayStr = new Date().toLocaleDateString('ru-RU');
      setNewCert(p => ({ ...p, date: todayStr, fullName: '', template: '' }));
      getNextCertificateId()
        .then(res => {
          if (res.data?.nextId) {
            setNewCert(p => ({ ...p, certId: res.data.nextId }));
          }
        })
        .catch(e => console.error(e));
    }
  }, [isCreateOpen]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [searchDebounced]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [coursesRes, certsRes, statsRes, reqsRes] = await Promise.all([
        getCertificateCourses(),
        getCertificates(),
        getCertificateStats(),
        getAllCertificateRequests()
      ]);
      setCourses(coursesRes.data.courses || []);
      setCertificates(certsRes.data.certificates || []);
      setStats(statsRes.data || { total: 0, byCourse: {} });
      setRequests(reqsRes.data || []);
    } catch (e) {
      console.error('Certificate fetch error:', e);
      toast.error('Sertifikat ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await getCertificates(searchDebounced);
      setCertificates(res.data.certificates || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!newCert.fullName || !newCert.certId || !newCert.date || !newCert.template) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    try {
      await createCertificate(newCert);
      toast.success('Sertifikat yaratildi!');
      setIsCreateOpen(false);
      setNewCert({ fullName: '', certId: '', date: '', template: '' });
      fetchAll();
    } catch (e) {
      const msg = e.response?.data?.error || 'Xatolik yuz berdi';
      toast.error(msg);
    }
  };

  const handleDelete = async (pk, name) => {
    if (!confirm(`"${name}" sertifikatini o'chirmoqchimisiz?`)) return;
    try {
      await deleteCertificate(pk);
      toast.success('Sertifikat o\'chirildi');
      fetchAll();
    } catch (e) {
      toast.error('O\'chirishda xatolik');
    }
  };

  const handleProcessGenerateDirect = async (req) => {
    if (processingReqId) return;
    setProcessingReqId(req.id);
    try {
      const courseObj = courses.find(c => c.template === req.template);
      const courseKey = courseObj ? courseObj.key : 'ks';

      const response = await generateBulkCertificates({
        students: req.students.map(s => ({ fullName: s.name })),
        courseKey: courseKey,
        date: req.issueDate || new Date().toLocaleDateString('ru-RU')
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const dateClean = (req.issueDate || new Date().toLocaleDateString('ru-RU')).replace(/\./g, '_');
      link.setAttribute('download', `sertifikatlar_${courseKey}_${dateClean}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      await updateCertificateRequestStatus(req.id, 'APPROVED');
      toast.success('Sertifikatlar muvaffaqiyatli yaratildi va tasdiqlandi!');
      fetchAll();
    } catch (e) {
      console.error('Bulk generation error:', e);
      const msg = e.response?.data?.error || 'Sertifikat yaratishda xatolik yuz berdi';
      toast.error(msg);
    } finally {
      setProcessingReqId(null);
    }
  };

  const handleRejectRequest = async (id) => {
    if (!confirm('Ushbu so\'rovni rad etmoqchimisiz?')) return;
    try {
      await updateCertificateRequestStatus(id, 'REJECTED');
      toast.success('So\'rov rad etildi');
      fetchAll();
    } catch (e) {
      console.error(e);
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDownloadApprovedZip = async (req) => {
    if (downloadingZipId) return;
    setDownloadingZipId(req.id);
    try {
      // Find matching cert IDs in the certificates list
      const studentNames = (req.students || []).map(s => s.name.trim().toLowerCase());
      const matchingCerts = certificates.filter(cert =>
        cert.template === req.template &&
        studentNames.includes((cert.fullName || '').trim().toLowerCase())
      );

      if (matchingCerts.length === 0) {
        toast.error("Ushbu so'rov uchun generatsiya qilingan sertifikatlar topilmadi. Ular o'chirib yuborilgan bo'lishi mumkin.");
        setDownloadingZipId(null);
        return;
      }

      const certIds = matchingCerts.map(c => c.certId);
      const response = await downloadBulkCertificatesZip(certIds);

      // Trigger browser download
      const blob = new Blob([response.data], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const courseObj = courses.find(c => c.template === req.template);
      const courseKey = courseObj ? courseObj.key : 'ks';
      const dateClean = (req.issueDate || new Date().toLocaleDateString('ru-RU')).replace(/\./g, '_');
      link.setAttribute('download', `sertifikatlar_${courseKey}_${dateClean}_qayta.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Sertifikatlar muvaffaqiyatli yuklab olindi!");
    } catch (e) {
      console.error('Error downloading approved ZIP:', e);
      toast.error("Yuklab olishda xatolik yuz berdi");
    } finally {
      setDownloadingZipId(null);
    }
  };

  const openPreview = (certId) => {
    setPreviewCertId(certId);
    setIsPreviewOpen(true);
  };

  // Map template to readable name
  const getCourseName = (template) => {
    if (!template) return 'Noma\'lum';
    if (template.includes('computer_science')) return 'Kompyuter savodxonligi';
    if (template.includes('grafik_design')) return 'Grafik dizayn';
    if (template.includes('admin')) return 'Admin';
    if (template.includes('web_design')) return 'Web dizayn';
    if (template.includes('front_end')) return 'Web dasturlash';
    if (template.includes('python')) return 'Python';
    if (template.includes('max3D_int')) return '3D Max Interior';
    if (template.includes('max3D_ext')) return '3D Max Exterior';
    if (template.includes('max3D_mod')) return '3D Max Modeling';
    if (template.includes('3dmax')) return '3D Max';
    if (template.includes('ms_word')) return 'MS Word';
    if (template.includes('doctor')) return 'Tibbiyot';
    return 'Boshqa';
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

  // Extract unique months dynamically from certificates list
  const uniqueMonths = useMemo(() => {
    const monthsMap = {};
    certificates.forEach(c => {
      if (!c.date) return;
      const parts = c.date.split('.');
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (!isNaN(m) && !isNaN(y)) {
          const key = `${y}-${String(m).padStart(2, '0')}`;
          monthsMap[key] = { year: y, month: m };
        }
      }
    });

    return Object.keys(monthsMap)
      .sort((a, b) => b.localeCompare(a))
      .map(key => ({
        key,
        label: `${getMonthNameUz(monthsMap[key].month)} ${monthsMap[key].year}`,
        year: monthsMap[key].year,
        month: monthsMap[key].month
      }));
  }, [certificates]);

  // Compute stats on the current (unfiltered) list
  const dynamicStats = useMemo(() => {
    const total = certificates.length;
    const byTemplate = {};
    
    certificates.forEach(c => {
      const t = c.template || 'other';
      byTemplate[t] = (byTemplate[t] || 0) + 1;
    });

    let topCourseTemplate = '';
    let topCourseCount = 0;
    Object.entries(byTemplate).forEach(([t, count]) => {
      if (count > topCourseCount) {
        topCourseCount = count;
        topCourseTemplate = t;
      }
    });

    let thisMonthCount = 0;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    certificates.forEach(c => {
      if (!c.date) return;
      const parts = c.date.split('.');
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (m === currentMonth && y === currentYear) {
          thisMonthCount++;
        }
      }
    });

    return {
      total,
      byTemplate,
      topCourse: getCourseName(topCourseTemplate),
      topCourseCount,
      thisMonthCount
    };
  }, [certificates]);

  // Filter local certificates based on dropdown filters
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      // Course/Template Filter
      const matchesCourse = selectedCourse === 'all' || cert.template === selectedCourse;
      
      // Month Filter
      let matchesMonth = true;
      if (selectedMonth !== 'all' && cert.date) {
        const parts = cert.date.split('.');
        if (parts.length === 3) {
          const m = parseInt(parts[1], 10);
          const y = parseInt(parts[2], 10);
          const certMonthKey = `${y}-${String(m).padStart(2, '0')}`;
          matchesMonth = certMonthKey === selectedMonth;
        } else {
          matchesMonth = false;
        }
      }
      
      return matchesCourse && matchesMonth;
    });
  }, [certificates, selectedCourse, selectedMonth]);

  // Helper: Count certificates for a given course option
  const getCourseCertCount = (template) => {
    if (template === 'all') return certificates.length;
    return dynamicStats.byTemplate[template] || 0;
  };

  const isFilterActive = selectedCourse !== 'all' || selectedMonth !== 'all' || search !== '';

  const clearFilters = () => {
    setSelectedCourse('all');
    setSelectedMonth('all');
    setSearch('');
  };

  const colorStyles = {
    blue: { bg: 'bg-[#007aff]/10', solid: 'bg-[#007aff]', text: 'text-[#007aff]', border: 'group-hover:border-[#007aff]/30' },
    indigo: { bg: 'bg-[#5856d6]/10', solid: 'bg-[#5856d6]', text: 'text-[#5856d6]', border: 'group-hover:border-[#5856d6]/30' },
    emerald: { bg: 'bg-[#34c759]/10', solid: 'bg-[#34c759]', text: 'text-[#34c759]', border: 'group-hover:border-[#34c759]/30' },
    purple: { bg: 'bg-[#af52de]/10', solid: 'bg-[#af52de]', text: 'text-[#af52de]', border: 'group-hover:border-[#af52de]/30' },
    rose: { bg: 'bg-[#ff3b30]/10', solid: 'bg-[#ff3b30]', text: 'text-[#ff3b30]', border: 'group-hover:border-[#ff3b30]/30' },
    orange: { bg: 'bg-[#ff9500]/10', solid: 'bg-[#ff9500]', text: 'text-[#ff9500]', border: 'group-hover:border-[#ff9500]/30' },
  };

  const statsList = [
    {
      label: "Jami sertifikatlar",
      value: loading ? <Skeleton width="50px" height="28px" /> : stats.total,
      icon: <Award size={20} />,
      color: 'orange',
      sub: "Barcha berilgan sertifikatlar"
    },
    {
      label: 'Shu oyda berilgan',
      value: loading ? <Skeleton width="50px" height="28px" /> : dynamicStats.thisMonthCount,
      icon: <Calendar size={20} />,
      color: 'blue',
      sub: `${getMonthNameUz(new Date().getMonth() + 1)} oyi uchun`
    },
    {
      label: 'Eng faol yo\'nalish',
      value: loading ? <Skeleton width="120px" height="28px" /> : (dynamicStats.topCourse || 'Boshqa'),
      icon: <BookOpen size={20} />,
      color: 'purple',
      sub: `${dynamicStats.topCourseCount} ta sertifikat`
    },
    {
      label: 'Yo\'nalishlar soni',
      value: loading ? <Skeleton width="40px" height="28px" /> : Object.keys(dynamicStats.byTemplate).length,
      icon: <GraduationCap size={20} />,
      color: 'emerald',
      sub: "Kamida 1 ta sertifikat bor"
    }
  ];

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      
      {/* macOS Finder-style Toolbar */}
      <div className="min-h-[56px] py-3 lg:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4 z-20 sticky top-0">
        
        {/* Title Area */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="p-1.5 bg-[#ff9500] text-white rounded-md shadow-sm">
            <Award size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Sertifikatlar</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Jami: {filteredCertificates.length} ta sertifikat
            </p>
          </div>
        </div>

        {/* Filters and Actions Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm flex-1 sm:flex-initial sm:min-w-[220px]">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Talaba ismi yoki ID..."
              className="bg-transparent text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] outline-none border-none w-full placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Month selector dropdown */}
          <div className="flex items-center gap-2 bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
            <Calendar size={14} className="text-[#ff9500]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] outline-none border-none pr-6 cursor-pointer focus:ring-0 p-0"
            >
              <option value="all" className="dark:bg-slate-900 text-[#1d1d1f] dark:text-[#f5f5f7]">Barcha oylar</option>
              {uniqueMonths.map(m => (
                <option key={m.key} value={m.key} className="dark:bg-slate-900 text-[#1d1d1f] dark:text-[#f5f5f7]">{m.label}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-white/10 hidden sm:block"></div>

          {/* Clear & Add actions */}
          <div className="flex items-center gap-2">
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
              >
                <FilterX size={14} />
                <span className="hidden sm:inline">Tozalash</span>
              </button>
            )}

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all shadow-sm bg-[#007aff] hover:bg-[#0062cc] text-white border border-[#005bb5]"
            >
              <Plus size={14} />
              <span>Yangi</span>
            </button>

            <button
              onClick={fetchAll}
              disabled={loading}
              className="flex items-center justify-center p-1.5 rounded-md bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-6">
        <div className="max-w-[1200px] mx-auto space-y-6 flex flex-col h-full">

          {/* Main Tab Switcher */}
          <div className="flex border-b border-gray-200 dark:border-white/10 shrink-0 gap-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-3 text-[13px] font-bold transition-all relative ${activeTab === 'list' ? 'text-[#007aff]' : 'text-gray-500 hover:text-[#1d1d1f] dark:hover:text-white'}`}
            >
              Sertifikatlar ro'yxati
              {activeTab === 'list' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007aff] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-3 text-[13px] font-bold transition-all relative flex items-center gap-2 ${activeTab === 'requests' ? 'text-[#007aff]' : 'text-gray-500 hover:text-[#1d1d1f] dark:hover:text-white'}`}
            >
              O'qituvchilar so'rovlari
              {requests.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="px-2 py-0.5 text-[9px] font-black bg-[#ff3b30] text-white rounded-full leading-none">
                  {requests.filter(r => r.status === 'PENDING').length}
                </span>
              )}
              {activeTab === 'requests' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007aff] rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'list' ? (
            <>
              {/* Segmented Control for Course Directions */}
              <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner overflow-x-auto scrollbar-hide shrink-0">
                <button
                  onClick={() => setSelectedCourse('all')}
                  className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap ${
                    selectedCourse === 'all'
                      ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                      : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Barchasi ({getCourseCertCount('all')})
                </button>
                {courses.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedCourse(c.template)}
                    className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap ${
                      selectedCourse === c.template
                        ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                        : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {courseDisplayNames[c.key] || c.name} ({getCourseCertCount(c.template)})
                  </button>
                ))}
              </div>

              {/* Stats Cards Section */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {statsList.map((stat, i) => (
                  <div
                    key={i}
                    className="relative bg-white/60 dark:bg-black/20 backdrop-blur-md p-4 pl-5 rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm flex items-center gap-3.5 group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorStyles[stat.color].solid}`} />
                    <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${colorStyles[stat.color].bg} ${colorStyles[stat.color].text}`}>
                      {stat.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">{stat.label}</p>
                      <h3 className="text-[20px] font-bold text-[#1d1d1f] dark:text-white tracking-tight mt-0.5 leading-tight truncate">{stat.value}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* macOS Finder-style Table Container */}
              <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-gray-100/50 dark:bg-black/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-white/10 sticky top-0 backdrop-blur-xl z-10">
                      <tr>
                        <th className="px-5 py-3 font-bold text-[10.5px] uppercase tracking-wide">Talaba ma'lumotlari</th>
                        <th className="px-5 py-3 font-bold text-[10.5px] uppercase tracking-wide">Sertifikat ID</th>
                        <th className="px-5 py-3 font-bold text-[10.5px] uppercase tracking-wide">Berilgan sana</th>
                        <th className="px-5 py-3 font-bold text-[10.5px] uppercase tracking-wide text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/30 dark:divide-white/5">
                      {loading ? (
                        Array(6).fill(0).map((_, i) => (
                          <tr key={i}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <Skeleton variant="circle" width="36px" height="36px" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton width="140px" height="14px" />
                                  <Skeleton width="90px" height="10px" />
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3"><Skeleton width="100px" height="14px" /></td>
                            <td className="px-5 py-3"><Skeleton width="80px" height="14px" /></td>
                            <td className="px-5 py-3"></td>
                          </tr>
                        ))
                      ) : filteredCertificates.length > 0 ? (
                        filteredCertificates.map((cert) => (
                          <tr
                            key={cert.id}
                            className="hover:bg-[#007aff]/5 dark:hover:bg-white/5 transition-colors group"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] font-medium text-[12px] shadow-sm shrink-0">
                                  {(cert.fullName || 'S').substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#007aff] transition-colors">
                                    {cert.fullName}
                                  </p>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {getCourseName(cert.template)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 font-semibold text-gray-700 dark:text-gray-300 tabular-nums text-[12px]">
                                {cert.certId}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 font-medium text-[12px]">
                              {cert.date}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openPreview(cert.certId)}
                                  className="p-1.5 text-gray-400 hover:text-[#007aff] hover:bg-[#007aff]/10 rounded-lg transition-all cursor-pointer"
                                  title="Ko'rish"
                                >
                                  <Eye size={15} />
                                </button>
                                <a
                                  href={getCertificateImageUrl(cert.certId) + '?download=true'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-gray-400 hover:text-[#34c759] hover:bg-[#34c759]/10 rounded-lg transition-all cursor-pointer"
                                  title="Yuklab olish"
                                >
                                  <Download size={15} />
                                </a>
                                <button
                                  onClick={() => handleDelete(cert.id, cert.fullName)}
                                  className="p-1.5 text-gray-400 hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-lg transition-all cursor-pointer"
                                  title="O'chirish"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-5 py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                                <Award size={24} className="text-gray-400" />
                              </div>
                              <p className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Sertifikatlar topilmadi</p>
                              <p className="text-[12px] text-gray-500 dark:text-gray-400">Tanlangan saralash bo'yicha ma'lumot yo'q.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {!loading && filteredCertificates.length > 0 && (
                  <div className="px-5 py-2 border-t border-gray-200/50 dark:border-white/10 bg-gray-100/40 dark:bg-black/30 shrink-0">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      {filteredCertificates.length} ta natija ko'rsatilmoqda
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {reqLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#007aff] animate-spin" />
                  <p className="text-[12px] text-gray-400 font-medium">So'rovlar yuklanmoqda...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 p-6 shadow-sm">
                  <Award size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">So'rovlar mavjud emas</p>
                  <p className="text-[12px] text-gray-500 mt-1">Hozircha o'qituvchilar tomonidan yuborilgan sertifikat so'rovlari yo'q.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {requests.map((req) => {
                    const statusMap = {
                      PENDING: { label: 'Kutilmoqda', chip: 'bg-amber-500/10 text-amber-600', bar: 'bg-amber-500' },
                      APPROVED: { label: 'Tasdiqlangan', chip: 'bg-emerald-500/10 text-emerald-600', bar: 'bg-emerald-500' },
                      REJECTED: { label: 'Rad etilgan', chip: 'bg-rose-500/10 text-rose-600', bar: 'bg-rose-500' },
                    };
                    const st = statusMap[req.status] || statusMap.PENDING;
                    return (
                    <div
                      key={req.id}
                      className="relative bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[20px] border border-gray-200/50 dark:border-white/10 shadow-sm p-5 pl-6 flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${st.bar}`} />
                      <div>
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div className="min-w-0">
                            <h4 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white leading-tight truncate">
                              {req.groupName}
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                              <BookOpen size={11} className="shrink-0" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{req.courseName}</span>
                            </p>
                          </div>
                          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${st.chip}`}>
                            {st.label}
                          </span>
                        </div>

                        <div className="text-[12px] text-gray-600 dark:text-gray-400 grid grid-cols-1 gap-1.5 mb-4 border-t border-b border-gray-200/50 dark:border-white/5 py-3">
                          <p className="flex items-center gap-2">
                            <User size={12} className="text-gray-400 shrink-0" />
                            Yuboruvchi: <span className="font-semibold text-[#1d1d1f] dark:text-white">{req.teacherName}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar size={12} className="text-gray-400 shrink-0" />
                            Yuborilgan: <span>{new Date(req.createdAt).toLocaleDateString('uz-UZ')}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Hash size={12} className="text-gray-400 shrink-0" />
                            Sertifikat sanasi: <span className="font-bold text-[#007aff] dark:text-[#30a2ff]">{req.issueDate || 'Kiritilmagan'}</span>
                          </p>
                          {req.message && (
                            <p className="italic text-gray-500 dark:text-gray-400 mt-1 flex gap-1.5 bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                              <MessageSquare size={12} className="shrink-0 mt-0.5" />
                              <span>"{req.message}"</span>
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5 mb-5">
                          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                            O'quvchilar ({req.students?.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1 bg-gray-50/50 dark:bg-black/10 rounded-xl">
                            {req.students?.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 text-[11px] font-semibold rounded-lg border border-gray-200/50 dark:border-white/5"
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-200/50 dark:border-white/5 mt-auto">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              disabled={processingReqId !== null}
                              className="flex-1 py-2 text-[12px] font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all disabled:opacity-50"
                            >
                              Rad etish
                            </button>
                            <button
                              onClick={() => handleProcessGenerateDirect(req)}
                              disabled={processingReqId !== null}
                              className="flex-[2] py-2 text-[12px] font-bold bg-[#007aff] hover:bg-[#0062cc] text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {processingReqId === req.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <>
                                  <Award size={14} />
                                  Sertifikat yasash
                                </>
                              )}
                            </button>
                          </>
                        )}
                        {req.status === 'APPROVED' && (
                          <button
                            onClick={() => handleDownloadApprovedZip(req)}
                            disabled={downloadingZipId !== null}
                            className="w-full py-2 text-[12px] font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {downloadingZipId === req.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <>
                                <Download size={13} />
                                Yuklab olish (ZIP)
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE STAFF/CERTIFICATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Yangi sertifikat">
        <div className="space-y-4 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] px-1">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">To'liq ism (F.I.SH)</label>
            <input
              type="text"
              value={newCert.fullName}
              onChange={(e) => setNewCert(p => ({ ...p, fullName: e.target.value }))}
              placeholder="Masalan: Aliyev Vali"
              className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Sertifikat ID</label>
              <input
                type="text"
                value={newCert.certId}
                onChange={(e) => setNewCert(p => ({ ...p, certId: e.target.value }))}
                placeholder="ID-001001"
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Berilgan sana</label>
              <input
                type="text"
                value={newCert.date}
                onChange={(e) => setNewCert(p => ({ ...p, date: e.target.value }))}
                placeholder="01.01.2026"
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Kurs (Shablon)</label>
            <select
              value={newCert.template}
              onChange={(e) => setNewCert(p => ({ ...p, template: e.target.value }))}
              className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:ring-2 focus:ring-[#007aff]/50 outline-none transition-all shadow-inner"
            >
              <option value="">Tanlang...</option>
              {courses.map(c => (
                <option key={c.key} value={c.template}>{courseDisplayNames[c.key] || c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-3 mt-4 border-t border-gray-200/50 dark:border-white/10">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 py-2 text-[13px] font-medium bg-[#007aff] hover:bg-[#0062cc] text-white rounded-md shadow-sm border border-[#005bb5] transition-colors"
            >
              Saqlash
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={`Sertifikat: ${previewCertId}`}>
        <div className="flex flex-col items-center gap-4 px-1">
          {previewCertId && (
            <img
              src={getCertificateImageUrl(previewCertId)}
              alt={`Sertifikat ${previewCertId}`}
              className="w-full rounded-lg border border-gray-200/50 dark:border-white/10 shadow-sm"
              onError={(e) => { e.target.src = ''; e.target.alt = 'Sertifikat rasmini yuklashda xatolik'; }}
            />
          )}
          
          <div className="flex gap-2 w-full pt-3 border-t border-gray-200/50 dark:border-white/10">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors"
            >
              Yopish
            </button>
            <a
              href={getCertificateImageUrl(previewCertId) + '?download=true'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 text-[13px] font-medium bg-[#34c759] hover:bg-[#30b350] text-white rounded-md shadow-sm text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Download size={14} />
              Yuklab olish
            </a>
          </div>
        </div>
      </Modal>


    </div>
  );
};

export default CertificatesPage;
