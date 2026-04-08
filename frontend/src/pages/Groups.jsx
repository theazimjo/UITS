import React, { useState, useEffect } from 'react';
import { Plus, Clock, MapPin, Edit2, Trash2, Calendar, BookOpen, ChevronLeft, Users, FolderKanban } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createField, updateField, deleteField,
  createCourse, updateCourse, deleteCourse,
  createRoom, updateRoom, deleteRoom,
  createGroup, updateGroup, deleteGroup
} from '../services/api';
import Modal from '../components/common/Modal'; // Assuming Modal has a clean macOS style

import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { getGroups, getFields, getCourses, getRooms } from '../services/api';

const Groups = () => {
  const { 
    groups = [], fields = [], courses = [], rooms = [], staff: staffList = [],
    setGroups: setGlobalGroups, setFields: setGlobalFields, 
    setCourses: setGlobalCourses, setRooms: setGlobalRooms 
  } = useStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('faol');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [formData, setFormData] = useState({
    field: { name: '', duration: '' },
    course: { name: '', duration: '', monthlyPrice: '', fieldId: '' },
    room: { name: '', capacity: '' },
    group: { name: '', sohaId: '', courseId: '', roomId: '', teacherId: '', days: [], startTime: '', endTime: '', startDate: '', endDate: '', monthlyPrice: '', status: 'WAITING' }
  });

  const { 
    groups: globalGroups, 
    fields: globalFields, 
    courses: globalCourses, 
    rooms: globalRooms,
    refreshAllRows,
    loading
  } = useStore();

  const getStatusDetails = (status) => {
    switch (status) {
      case 'WAITING': return { label: "Yig'ilmoqda", color: 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/20' };
      case 'ACTIVE': return { label: "Faol", color: 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/20' };
      case 'COMPLETED': return { label: "Tugatilgan", color: 'bg-[#af52de]/10 text-[#af52de] border-[#af52de]/20' };
      case 'CANCELLED': return { label: "Bekor qilingan", color: 'bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/20' };
      default: return { label: status, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    setModalType(type);
    if (type === 'field') setFormData({ ...formData, field: { name: item.name, duration: item.duration } });
    if (type === 'room') setFormData({ ...formData, room: { name: item.name, capacity: item.capacity } });
    if (type === 'course') setFormData({ ...formData, course: { name: item.name, duration: item.duration, monthlyPrice: item.monthlyPrice, fieldId: item.fieldId } });
    if (type === 'group') setFormData({
      ...formData, group: {
        name: item.name,
        sohaId: item.course?.field?.id || '',
        courseId: item.course?.id || '',
        roomId: item.room?.id || '',
        teacherId: item.teacher?.id || '',
        days: item.days || [],
        startTime: item.startTime,
        endTime: item.endTime,
        startDate: item.startDate,
        endDate: item.endDate,
        monthlyPrice: item.monthlyPrice,
        status: item.status || 'WAITING'
      }
    });
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Haqiqatdan ham o'chirmoqchimisiz?")) return;
    try {
      if (type === 'field') await deleteField(id);
      if (type === 'room') await deleteRoom(id);
      if (type === 'course') await deleteCourse(id);
      if (type === 'group') await deleteGroup(id);
      refreshAllRows();
      toast.success("O'chirildi");
    } catch (err) { 
      console.error(err);
      toast.error("O'chirishda xatolik");
    }
  };

  useEffect(() => {
    if (formData.group.startDate && formData.group.courseId) {
      const course = (courses || []).find(c => c.id === parseInt(formData.group.courseId));
      if (course) {
        const start = new Date(formData.group.startDate);
        const end = new Date(start.setMonth(start.getMonth() + parseInt(course.duration)));
        setFormData(prev => ({
          ...prev,
          group: { ...prev.group, endDate: end.toISOString().split('T')[0], monthlyPrice: course.monthlyPrice }
        }));
      }
    }
  }, [formData.group.startDate, formData.group.courseId, courses]);

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      if (type === 'field') {
        if (editingItem) await updateField(editingItem.id, formData.field);
        else await createField(formData.field);
      }
      if (type === 'course') {
        const coursePayload = { ...formData.course, field: { id: parseInt(formData.course.fieldId || selectedFieldId) } };
        if (editingItem) await updateCourse(editingItem.id, coursePayload);
        else await createCourse(coursePayload);
      }
      if (type === 'room') {
        if (editingItem) await updateRoom(editingItem.id, formData.room);
        else await createRoom(formData.room);
      }
      if (type === 'group') {
        const groupData = {
          ...formData.group,
          course: { id: parseInt(formData.group.courseId) },
          room: { id: parseInt(formData.group.roomId) },
          teacher: { id: parseInt(formData.group.teacherId) }
        };
        if (editingItem) await updateGroup(editingItem.id, groupData);
        else await createGroup(groupData);
      }
      setModalType(null); setEditingItem(null);
      refreshAllRows();
      toast.success("O'zgarishlar saqlandi");
    } catch (err) {
      console.error(err);
      toast.error("Amalni bajarishda xatolik yuzaga keldi");
    }
  };

  const teachers = (staffList || []).filter(s => {
    const roleName = s.role?.name?.toLowerCase() || '';
    return (
      roleName.includes('teacher') ||
      roleName.includes("o'qituvchi") ||
      roleName.includes("o’qituvchi") ||
      roleName.includes("o‘qituvchi") ||
      roleName.includes("ustoz") ||
      roleName.includes("instruktor")
    );
  });

  const filteredGroups = (groups || []).filter(g => {
    // 1. Status Filter
    let statusMatch = false;
    if (activeTab === 'shakllanyapti') statusMatch = g.status === 'WAITING';
    else if (activeTab === 'faol') statusMatch = g.status === 'ACTIVE';
    else if (activeTab === 'tugatgan') statusMatch = g.status === 'COMPLETED';

    // 2. Teacher Filter
    const teacherMatch = !selectedTeacherId || (g.teacher?.id?.toString() === selectedTeacherId);

    return statusMatch && teacherMatch;
  });

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

      {/* macOS Finder-style Toolbar */}
      <div className="min-h-[56px] py-3 lg:py-0 border-b border-gray-200/50 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-md gap-4 z-20">

        {/* Title Area */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="p-1.5 bg-[#5ac8fa] text-white rounded-md shadow-sm">
            <FolderKanban size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">O'quv Tizimi</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Jami guruhlar: {groups.length} ta</p>
          </div>
        </div>

        {/* Center/Right Actions Area */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">

          {/* Teacher Filter Select */}
          <div className="relative">
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="appearance-none pl-8 pr-10 py-1.5 bg-gray-200/80 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-lg text-[12px] font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-all shadow-inner w-full sm:w-[180px]"
            >
              <option value="">Barcha o'qituvchilar</option>
              {(teachers || []).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <Users size={14} />
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-white/10 hidden sm:block"></div>

          {/* Segmented Control for Group Status */}
          <div className="flex items-center bg-gray-200/80 dark:bg-black/40 p-[3px] rounded-lg border border-black/5 dark:border-white/10 shadow-inner w-full sm:w-auto">
            {[
              { id: 'shakllanyapti', label: 'Yig\'ilmoqda' },
              { id: 'faol', label: 'Faol' },
              { id: 'tugatgan', label: 'Tugatgan' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-[12px] font-medium rounded-md transition-all whitespace-nowrap ${activeTab === t.id
                  ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                  : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-white/10 hidden sm:block"></div>

          {/* Manage Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setModalType('manage_fields')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 border border-gray-200/50 dark:border-white/10 shadow-sm transition-all"
            >
              <Users size={14} /> <span>Sohalar</span>
            </button>
            <button
              onClick={() => setModalType('manage_rooms')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 border border-gray-200/50 dark:border-white/10 shadow-sm transition-all"
            >
              <MapPin size={14} /> <span>Xonalar</span>
            </button>
            <button
              onClick={() => { setEditingItem(null); setModalType('group'); }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all shadow-sm bg-[#007aff] hover:bg-[#0062cc] text-white border border-[#005bb5]"
            >
              <Plus size={14} />
              <span>Guruh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area (Grid Layout) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-6">
        <div className="max-w-[1200px] mx-auto h-full">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.map(g => (
              <Link to={`/groups/${g.id}`} key={g.id} className="block no-underline">
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm p-5 relative group hover:shadow-md hover:border-gray-300 dark:hover:border-white/20 transition-all flex flex-col h-full cursor-default">

                  {/* Actions (Hover) */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 dark:bg-black/80 backdrop-blur px-1 py-1 rounded-lg border border-gray-200/50 dark:border-white/10 shadow-sm">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(g, 'group'); }} className="p-1.5 text-gray-500 hover:text-[#007aff] rounded-md transition-colors"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(g.id, 'group'); }} className="p-1.5 text-gray-500 hover:text-[#ff3b30] rounded-md transition-colors"><Trash2 size={14} /></button>
                  </div>

                  {/* Header */}
                  <div className="mb-4 pr-12">
                    <h4 className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1 leading-tight group-hover:text-[#007aff] transition-colors">{g.name}</h4>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400">
                      <BookOpen size={12} />
                      <span>{g.course?.name || 'Yo\'nalish yo\'q'}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusDetails(g.status).color}`}>
                      {getStatusDetails(g.status).label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20">
                      {parseInt(g.monthlyPrice).toLocaleString()} UZS
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4 text-[12px] text-gray-600 dark:text-gray-300 flex-1">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span>{g.startTime} — {g.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{g.room?.name || 'Xona belgilanmagan'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {(g.days || []).map(day => (
                          <span key={day} className="text-[10px] px-1 bg-gray-100 dark:bg-white/10 rounded">{day}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-2.5 pt-3 border-t border-gray-200/50 dark:border-white/10 mt-auto">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[10px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {g.teacher?.name?.substring(0, 1) || 'U'}
                    </div>
                    <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300 truncate">
                      {g.teacher?.name || 'O\'qituvchi yo\'q'}
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white/40 dark:bg-black/10 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
              <FolderKanban size={40} className="mb-3 opacity-50" />
              <p className="text-[14px] font-medium">Ushbu holatdagi guruhlar yo'q</p>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      <Modal
        isOpen={!!modalType}
        onClose={() => { setModalType(null); setEditingItem(null); setSelectedFieldId(null); }}
        title={
          modalType === 'manage_fields' ? 'Sohalarni boshqarish' :
            modalType === 'manage_rooms' ? 'Xonalarni boshqarish' :
              editingItem ? `Tahrirlash: ${editingItem.name}` :
                (modalType === 'field' ? 'Yangi Soha yaratish' :
                  modalType === 'course' ? 'Yangi Yo\'nalish yaratish' :
                    modalType === 'room' ? 'Yangi Xona qo\'shish' : 'Yangi Guruh yaratish')
        }
      >
        <div className="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">

          {/* MANAGE FIELDS */}
          {modalType === 'manage_fields' && (
            <div className="space-y-4">
              {!selectedFieldId ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[12px] font-medium text-gray-500">Barcha sohalar</p>
                    <button
                      onClick={() => { setModalType('field'); setEditingItem(null); setFormData(prev => ({ ...prev, field: { name: '', duration: '' } })); }}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-md transition-colors"
                    >
                      <Plus size={12} /> Yangi soha
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {(fields || []).map(f => (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFieldId(f.id)}
                        className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 p-3 rounded-md flex items-center justify-between group hover:border-[#007aff]/50 cursor-pointer transition-colors"
                      >
                        <div>
                          <h5 className="font-medium text-[13px] text-[#1d1d1f] dark:text-white">{f.name}</h5>
                          <p className="text-[11px] text-gray-500">{f.duration} oy • {(courses || []).filter(c => (c.fieldId || c.field?.id) == f.id).length} yo'nalish</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(f, 'field'); }} className="p-1.5 text-gray-400 hover:text-[#007aff] rounded-md transition-colors"><Edit2 size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id, 'field'); }} className="p-1.5 text-gray-400 hover:text-[#ff3b30] rounded-md transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setSelectedFieldId(null)} className="p-1 bg-gray-100 dark:bg-white/10 rounded-md hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <h4 className="font-medium text-[13px]">{fields.find(f => f.id === selectedFieldId)?.name} yo'nalishlari</h4>
                  </div>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 mb-3">
                    {(courses || []).filter(c => (c.fieldId || c.field?.id) == selectedFieldId).map(c => (
                      <div key={c.id} className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 p-3 rounded-md flex items-center justify-between group transition-colors">
                        <div>
                          <h5 className="font-medium text-[13px] text-[#1d1d1f] dark:text-white">{c.name}</h5>
                          <p className="text-[11px] text-gray-500">{c.duration} oy • {parseInt(c.monthlyPrice || 0).toLocaleString()} UZS</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(c, 'course')} className="p-1.5 text-gray-400 hover:text-[#007aff] rounded-md transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(c.id, 'course')} className="p-1.5 text-gray-400 hover:text-[#ff3b30] rounded-md transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setEditingItem(null); setModalType('course'); setFormData(prev => ({ ...prev, course: { ...prev.course, fieldId: selectedFieldId } })); }}
                    className="w-full py-2 border border-dashed border-gray-300 dark:border-white/20 hover:border-[#007aff]/50 text-gray-500 hover:text-[#007aff] rounded-md text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} /> Yangi yo'nalish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MANAGE ROOMS */}
          {modalType === 'manage_rooms' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[12px] font-medium text-gray-500">Barcha xonalar</p>
                <button
                  onClick={() => { setEditingItem(null); setModalType('room'); setFormData(prev => ({ ...prev, room: { name: '', capacity: '' } })); }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#34c759] hover:bg-[#28a745] text-white rounded-md transition-colors"
                >
                  <Plus size={12} /> Yangi xona
                </button>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {(rooms || []).map(r => (
                  <div key={r.id} className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 p-3 rounded-md flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <h5 className="font-medium text-[13px] text-[#1d1d1f] dark:text-white">{r.name}</h5>
                        <p className="text-[11px] text-gray-500">Sig'imi: {r.capacity} kishi</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(r, 'room')} className="p-1.5 text-gray-400 hover:text-[#007aff] rounded-md transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(r.id, 'room')} className="p-1.5 text-gray-400 hover:text-[#ff3b30] rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>    </div>
            </div>
          )}

          {/* FIELD FORM */}
          {modalType === 'field' && (
            <form onSubmit={(e) => handleSubmit(e, 'field')} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">SOHA NOMI</label>
                <input type="text" required value={formData.field.name} onChange={(e) => setFormData({ ...formData, field: { ...formData.field, name: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" placeholder="Masalan: Dasturlash" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">DAVOMIYLIGI (OY)</label>
                <input type="number" required value={formData.field.duration} onChange={(e) => setFormData({ ...formData, field: { ...formData.field, duration: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" placeholder="9" />
              </div>
              <button type="submit" className="w-full py-2 bg-[#007aff] hover:bg-[#0062cc] text-white font-medium text-[13px] rounded-md transition-colors">
                {editingItem ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
          )}

          {/* COURSE FORM */}
          {modalType === 'course' && (
            <form onSubmit={(e) => handleSubmit(e, 'course')} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">SOHANI TANLANG</label>
                <select required value={formData.course.fieldId} onChange={(e) => setFormData({ ...formData, course: { ...formData.course, fieldId: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner">
                  <option value="" disabled>Tanlang...</option>
                  {(fields || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">YO'NALISH NOMI</label>
                <input type="text" required value={formData.course.name} onChange={(e) => setFormData({ ...formData, course: { ...formData.course, name: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" placeholder="Masalan: Frontend React" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">DAVOMIYLIGI (OY)</label>
                  <input type="number" required value={formData.course.duration} onChange={(e) => setFormData({ ...formData, course: { ...formData.course, duration: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" placeholder="6" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">OYLIK NARX (UZS)</label>
                  <input type="number" required value={formData.course.monthlyPrice} onChange={(e) => setFormData({ ...formData, course: { ...formData.course, monthlyPrice: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" placeholder="500000" />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-[#007aff] hover:bg-[#0062cc] text-white font-medium text-[13px] rounded-md transition-colors">
                {editingItem ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
          )}

          {/* ROOM FORM */}
          {modalType === 'room' && (
            <form onSubmit={(e) => handleSubmit(e, 'room')} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">XONA NOMI</label>
                <input type="text" required value={formData.room.name} onChange={(e) => setFormData({ ...formData, room: { ...formData.room, name: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" placeholder="101-xona" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">SIG'IMI (KISHI)</label>
                <input type="number" value={formData.room.capacity} onChange={(e) => setFormData({ ...formData, room: { ...formData.room, capacity: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" placeholder="15" />
              </div>
              <button type="submit" className="w-full py-2 bg-[#007aff] hover:bg-[#0062cc] text-white font-medium text-[13px] rounded-md transition-colors">
                {editingItem ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
          )}

          {/* GROUP FORM */}
          {modalType === 'group' && (
            <form onSubmit={(e) => handleSubmit(e, 'group')} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">GURUH NOMI</label>
                <input type="text" required value={formData.group.name} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, name: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" placeholder="Guruh nomini kiriting" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">SOHA</label>
                  <select
                    required
                    value={formData.group.sohaId}
                    onChange={(e) => setFormData({ ...formData, group: { ...formData.group, sohaId: e.target.value, courseId: '' } })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner"
                  >
                    <option value="" disabled>Tanlang...</option>
                    {(fields || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">YO'NALISH</label>
                  <select
                    required
                    disabled={!formData.group.sohaId}
                    value={formData.group.courseId}
                    onChange={(e) => setFormData({ ...formData, group: { ...formData.group, courseId: e.target.value } })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner disabled:opacity-50"
                  >
                    <option value="" disabled>Tanlang...</option>
                    {(courses || []).filter(c => (c.fieldId || c.field?.id) == formData.group.sohaId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">O'QITUVCHI</label>
                  <select required value={formData.group.teacherId} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, teacherId: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner">
                    <option value="" disabled>Tanlang...</option>
                    {(teachers || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">XONA</label>
                  <select required value={formData.group.roomId} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, roomId: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner">
                    <option value="" disabled>Tanlang...</option>
                    {(rooms || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">DARS KUNLARI</label>
                <div className="flex flex-wrap gap-1">
                  {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(d => (
                    <button
                      key={d} type="button"
                      onClick={() => { const days = formData.group.days.includes(d) ? formData.group.days.filter(x => x !== d) : [...formData.group.days, d]; setFormData({ ...formData, group: { ...formData.group, days } }); }}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${formData.group.days.includes(d) ? 'bg-[#007aff] text-white shadow-sm' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">BOSHLANISH VAQTI</label>
                  <input type="time" required value={formData.group.startTime} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, startTime: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">TUGASH VAQTI</label>
                  <input type="time" required value={formData.group.endTime} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, endTime: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">GURUH STATUSI</label>
                  <select
                    required
                    value={formData.group.status}
                    onChange={(e) => setFormData({ ...formData, group: { ...formData.group, status: e.target.value } })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner"
                  >
                    <option value="WAITING">Yig'ilmoqda</option>
                    <option value="ACTIVE">Faol</option>
                    <option value="COMPLETED">Tugatilgan</option>
                    <option value="CANCELLED">Bekor qilingan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">BOSHLANISH SANA</label>
                  <input type="date" required value={formData.group.startDate} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, startDate: e.target.value } })} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">TUGASH SANASI</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.group.endDate} 
                    onChange={(e) => setFormData({ ...formData, group: { ...formData.group, endDate: e.target.value } })} 
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#007aff]/50 transition-colors shadow-inner" 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 mt-2">
                <button type="button" onClick={() => { setModalType(null); setEditingItem(null); }} className="flex-1 py-2 text-[13px] font-medium bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white rounded-md transition-colors">Bekor qilish</button>
                <button type="submit" className="flex-1 py-2 text-[13px] font-medium bg-[#007aff] hover:bg-[#0062cc] text-white rounded-md shadow-sm border border-[#005bb5] transition-colors">{editingItem ? 'Saqlash' : 'Tasdiqlash'}</button>
              </div>
            </form>
          )}

        </div>
      </Modal>

    </div>
  );
};

export default Groups;