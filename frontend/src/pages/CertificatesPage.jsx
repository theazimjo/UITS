import React, { useState, useEffect, useMemo } from 'react';
import {
  getCertificateCourses, getCertificates, getCertificateStats,
  getCertificateImageUrl, createCertificate, deleteCertificate, generateCertificates,
  getNextCertificateId
} from '../services/api';
import toast from 'react-hot-toast';
import {
  Award, Search, Plus, Trash2, Download, Eye, RefreshCw,
  FileText, ChevronRight, X, BookOpen, Users, LayoutDashboard,
  ExternalLink, Calendar, Hash, User
} from 'lucide-react';
import Modal from '../components/common/Modal';

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, byCourse: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

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
      const [coursesRes, certsRes, statsRes] = await Promise.all([
        getCertificateCourses(),
        getCertificates(),
        getCertificateStats()
      ]);
      setCourses(coursesRes.data.courses || []);
      setCertificates(certsRes.data.certificates || []);
      setStats(statsRes.data || { total: 0, byCourse: {} });
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
    if (!newCert.fullName || !newCert.certId || !newCert.date) {
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

  const getCourseColor = (template) => {
    if (!template) return 'bg-gray-500';
    if (template.includes('computer_science')) return 'bg-blue-500';
    if (template.includes('grafik_design')) return 'bg-purple-500';
    if (template.includes('admin')) return 'bg-amber-500';
    if (template.includes('web_design')) return 'bg-cyan-500';
    if (template.includes('front_end')) return 'bg-indigo-500';
    if (template.includes('python')) return 'bg-emerald-500';
    if (template.includes('max3D') || template.includes('3dmax')) return 'bg-orange-500';
    if (template.includes('ms_word')) return 'bg-sky-500';
    if (template.includes('doctor')) return 'bg-rose-500';
    return 'bg-gray-500';
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

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">

      {/* Toolbar */}
      <div className="min-h-[56px] py-3 lg:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4 z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-500 text-white rounded-md shadow-sm">
            <Award size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Sertifikatlar</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Jami {stats.total} ta sertifikat • {courses.length} ta kurs
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm flex-1 lg:min-w-[240px]">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism yoki ID bo'yicha qidirish..."
              className="bg-transparent text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] outline-none border-none w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium bg-[#007aff] hover:bg-[#0066d6] text-white shadow-sm transition-all"
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-[1700px] mx-auto space-y-8 pb-10">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byCourse || {}).slice(0, 6).map(([name, count]) => (
              <div key={name} className="bg-white/60 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-gray-200/50 dark:border-white/10 group hover:-translate-y-1 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                    <Award size={16} />
                  </div>
                  <span className="text-xl font-bold text-black dark:text-white tabular-nums">{count}</span>
                </div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight truncate">{name}</p>
              </div>
            ))}
          </div>

          {/* Certificates Table */}
          <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-white/10">
              <h3 className="text-lg font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <FileText size={22} className="text-amber-500" />
                Sertifikatlar ro'yxati
              </h3>
              <p className="text-[12px] text-gray-500 uppercase font-black tracking-widest mt-1">
                {certificates.length} ta natija
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw size={24} className="animate-spin text-gray-400" />
              </div>
            ) : certificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Award size={48} className="mb-4 opacity-30" />
                <p className="text-[14px] font-medium">Sertifikatlar topilmadi</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${getCourseColor(cert.template)}`}>
                        <Award size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[#1d1d1f] dark:text-white truncate group-hover:text-[#007aff] transition-colors">
                          {cert.fullName}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Hash size={10} />{cert.certId}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                            <Calendar size={10} />{cert.date}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 hidden sm:inline">
                            {getCourseName(cert.template)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openPreview(cert.certId)}
                        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-all"
                        title="Ko'rish"
                      >
                        <Eye size={16} />
                      </button>
                      <a
                        href={getCertificateImageUrl(cert.certId) + '?download=true'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 transition-all"
                        title="Yuklab olish"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={() => handleDelete(cert.id, cert.fullName)}
                        className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-all"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Certificate Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Yangi sertifikat yaratish">
        <div className="space-y-5 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">To'liq ism</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={newCert.fullName}
                onChange={(e) => setNewCert(p => ({ ...p, fullName: e.target.value }))}
                placeholder="Familiya Ism"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[14px] outline-none focus:border-[#007aff] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Sertifikat ID</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={newCert.certId}
                  onChange={(e) => setNewCert(p => ({ ...p, certId: e.target.value }))}
                  placeholder="ID-001001"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[14px] outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Sana</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={newCert.date}
                  onChange={(e) => setNewCert(p => ({ ...p, date: e.target.value }))}
                  placeholder="01.01.2026"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[14px] outline-none focus:border-[#007aff] transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Kurs (Shablon)</label>
            <select
              value={newCert.template}
              onChange={(e) => setNewCert(p => ({ ...p, template: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[14px] outline-none focus:border-[#007aff] transition-colors"
            >
              <option value="">Tanlang...</option>
              {courses.map(c => (
                <option key={c.key} value={c.template}>{courseDisplayNames[c.key] || c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreate}
            className="w-full py-3 bg-[#007aff] hover:bg-[#0066d6] text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Sertifikat yaratish
          </button>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={`Sertifikat: ${previewCertId}`}>
        <div className="flex flex-col items-center gap-4">
          {previewCertId && (
            <img
              src={getCertificateImageUrl(previewCertId)}
              alt={`Sertifikat ${previewCertId}`}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 shadow-lg"
              onError={(e) => { e.target.src = ''; e.target.alt = 'Sertifikat rasmini yuklashda xatolik'; }}
            />
          )}
          <a
            href={getCertificateImageUrl(previewCertId) + '?download=true'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[13px] rounded-xl shadow-md transition-all"
          >
            <Download size={16} />
            Yuklab olish
          </a>
        </div>
      </Modal>
    </div>
  );
};

export default CertificatesPage;
