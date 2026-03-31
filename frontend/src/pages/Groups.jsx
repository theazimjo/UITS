import React, { useState, useEffect } from 'react';
import { Plus, Clock, MapPin, Edit2, Trash2, Calendar, BookOpen, ChevronLeft, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  createField, updateField, deleteField,
  createCourse, updateCourse, deleteCourse,
  createRoom, updateRoom, deleteRoom,
  createGroup, updateGroup, deleteGroup
} from '../services/api';
import Modal from '../components/common/Modal';

const Groups = ({
  groups, fields, courses, rooms, staffList,
  fetchGroups, fetchFields, fetchCourses, fetchRooms
}) => {
  const [activeTab, setActiveTab] = useState('faol');
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [formData, setFormData] = useState({
    field: { name: '', duration: '' },
    course: { name: '', duration: '', monthlyPrice: '', fieldId: '' },
    room: { name: '', capacity: '' },
    group: { name: '', sohaId: '', courseId: '', roomId: '', teacherId: '', days: [], startTime: '', endTime: '', startDate: '', endDate: '', monthlyPrice: '', status: 'WAITING' }
  });

  const getStatusDetails = (status) => {
    switch (status) {
      case 'WAITING': return { label: "Yig'ilmoqda", color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'ACTIVE': return { label: "Faol", color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'COMPLETED': return { label: "Tugatilgan", color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'CANCELLED': return { label: "Bekor qilingan", color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      default: return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
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
      fetchGroups(); fetchFields(); fetchCourses(); fetchRooms();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (formData.group.startDate && formData.group.courseId) {
      const course = courses.find(c => c.id === parseInt(formData.group.courseId));
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
      fetchGroups(); fetchFields(); fetchCourses(); fetchRooms();
    } catch (err) { console.error(err); }
  };

  const teachers = staffList.filter(s => {
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

  return (
    <div className="animate-fade-in p-6 lg:p-10 max-w-[1600px] mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">O'quv tizimi</h2>
          <p className="text-sm text-gray-400 mt-2">Guruhlar, sohalar va xonalarni boshqarish markazi</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setModalType('manage_fields')} className="flex items-center gap-2 px-4 py-2.5 bg-[#1e2030] hover:bg-[#2a2d43] border border-white/5 rounded-xl text-sm font-medium text-gray-200 transition-all">
            <Users size={16} /> Sohalarni boshqarish
          </button>
          <button onClick={() => setModalType('manage_rooms')} className="flex items-center gap-2 px-4 py-2.5 bg-[#1e2030] hover:bg-[#2a2d43] border border-white/5 rounded-xl text-sm font-medium text-gray-200 transition-all">
            <MapPin size={16} /> Xonalarni boshqarish
          </button>
          <button onClick={() => { setEditingItem(null); setModalType('group'); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <Plus size={16} /> Guruh yaratish
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[#131520]/50 border border-white/10 rounded-2xl w-fit mb-8 backdrop-blur-md">
        {[
          { id: 'shakllanyapti', label: 'Shakllanyapti' },
          { id: 'faol', label: 'Faol' },
          { id: 'tugatgan', label: 'Tugatgan' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
        {groups
          .filter(g => {
            if (activeTab === 'shakllanyapti') return g.status === 'WAITING';
            if (activeTab === 'faol') return g.status === 'ACTIVE';
            if (activeTab === 'tugatgan') return g.status === 'COMPLETED';
            return false;
          })
          .map(g => (
            <Link to={`/groups/${g.id}`} key={g.id} className="block no-underline">
              <div className="bg-[#131520] border border-white/10 rounded-2xl p-6 relative group hover:border-indigo-500/40 transition-all duration-300 shadow-xl shadow-black/20 h-full">

                {/* Actions */}
                <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(g, 'group'); }} className="p-2 bg-white/5 hover:bg-blue-500 hover:text-white text-gray-400 rounded-lg transition-colors"><Edit2 size={16} /></button>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(g.id, 'group'); }} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>

                {/* Card Header */}
                <div className="flex justify-between items-start mb-6 pr-20">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{g.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
                      <BookOpen size={14} />
                      <span>{g.course?.field?.name} / {g.course?.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 pr-16 sm:pr-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusDetails(g.status).color}`}>
                      {getStatusDetails(g.status).label}
                    </span>
                    <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-semibold">
                      {parseInt(g.monthlyPrice).toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                    <Clock size={18} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Vaqti</p>
                      <p className="text-sm font-medium text-gray-200">{g.startTime} - {g.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                    <MapPin size={18} className="text-rose-400" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Xona</p>
                      <p className="text-sm font-medium text-gray-200">{g.room?.name || 'Belgilanmagan'}</p>
                    </div>
                  </div>
                </div>

                {/* Days - Minimized to save space if needed, or keep for detail */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-1.5">
                    {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(day => (
                      <span key={day} className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${g.days.includes(day) ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-gray-600 border border-transparent'}`}>
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-5 border-t border-white/10 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                      {g.teacher?.name?.substring(0, 1) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">O'qituvchi</p>
                      <p className="text-sm font-medium text-gray-200">{g.teacher?.name || 'Biriktirilmagan'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg">
                    <Calendar size={12} />
                    <span>{g.startDate}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        {groups.filter(g => {
          if (activeTab === 'shakllanyapti') return g.status === 'WAITING';
          if (activeTab === 'faol') return g.status === 'ACTIVE';
          if (activeTab === 'tugatgan') return g.status === 'COMPLETED';
          return false;
        }).length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
            <Users size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm">Ushbu holatdagi guruhlar mavjud emas</p>
          </div>
        )}
      </div>


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
        <div className="p-1">
          {modalType === 'manage_fields' && (
            <div className="space-y-6">
              {!selectedFieldId ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-400">Barcha sohalar ro'yxati</p>
                    <button 
                      onClick={() => { setModalType('field'); setEditingItem(null); setFormData(prev => ({ ...prev, field: { name: '', duration: '' } })); }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-500 transition-all"
                    >
                      <Plus size={14} /> Yangi soha
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {fields.map(f => (
                      <div 
                        key={f.id} 
                        onClick={() => setSelectedFieldId(f.id)}
                        className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-indigo-500/50 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h5 className="font-semibold text-white">{f.name}</h5>
                            <p className="text-xs text-gray-500">{f.duration} oy • {courses.filter(c => (c.fieldId || c.field?.id) == f.id).length} yo'nalish</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(f, 'field'); }} className="p-2 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition-all"><Edit2 size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id, 'field'); }} className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setSelectedFieldId(null)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all">
                      <ChevronLeft size={16} />
                    </button>
                    <h4 className="font-bold text-white tracking-tight">{fields.find(f => f.id === selectedFieldId)?.name} yo'nalishlari</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-4">
                    {courses.filter(c => (c.fieldId || c.field?.id) == selectedFieldId).map(c => (
                      <div key={c.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div>
                          <h5 className="font-medium text-white">{c.name}</h5>
                          <p className="text-xs text-gray-500">{c.duration} oy • {parseInt(c.monthlyPrice).toLocaleString()} UZS</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(c, 'course')} className="p-2 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(c.id, 'course')} className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => { setEditingItem(null); setModalType('course'); setFormData(prev => ({ ...prev, course: { ...prev.course, fieldId: selectedFieldId } })); }}
                    className="w-full py-2.5 border-2 border-dashed border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-gray-500 hover:text-indigo-400 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Yangi yo'nalish qo'shish
                  </button>
                </div>
              )}
            </div>
          )}

          {modalType === 'manage_rooms' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">Barcha o'quv xonalari</p>
                <button 
                  onClick={() => { setEditingItem(null); setModalType('room'); setFormData(prev => ({ ...prev, room: { name: '', capacity: '' } })); }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-500 transition-all"
                >
                  <Plus size={14} /> Yangi xona
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {rooms.map(r => (
                  <div key={r.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-rose-500/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h5 className="font-semibold text-white">{r.name}</h5>
                        <p className="text-xs text-gray-500">Sig'imi: {r.capacity} kishi</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(r, 'room')} className="p-2 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(r.id, 'room')} className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <div className="text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <MapPin size={32} className="mx-auto text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Xonalar topilmadi</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {modalType === 'field' && (
            <form onSubmit={(e) => handleSubmit(e, 'field')} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Soha Nomi</label>
                <input type="text" required value={formData.field.name} onChange={(e) => setFormData({ ...formData, field: { ...formData.field, name: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Masalan: Backend" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Davomiyligi (oy)</label>
                <input type="number" required value={formData.field.duration} onChange={(e) => setFormData({ ...formData, field: { ...formData.field, duration: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="9" />
              </div>
              <button type="submit" className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                {editingItem ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
          )}

          {modalType === 'course' && (
            <form onSubmit={(e) => handleSubmit(e, 'course')} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Sohani tanlang</label>
                <select required value={formData.course.fieldId} onChange={(e) => setFormData({ ...formData, course: { ...formData.course, fieldId: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  <option value="" disabled>Tanlang...</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Yo'nalish Nomi</label>
                <input type="text" required value={formData.course.name} onChange={(e) => setFormData({ ...formData, course: { ...formData.course, name: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Masalan: Node.js" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Davomiyligi (oy)</label>
                  <input type="number" required value={formData.course.duration} onChange={(e) => setFormData({ ...formData, course: { ...formData.course, duration: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="2" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Oylik Narxi (UZS)</label>
                  <input type="number" required value={formData.course.monthlyPrice} onChange={(e) => setFormData({ ...formData, course: { ...formData.course, monthlyPrice: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="500000" />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                {editingItem ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
          )}

          {modalType === 'room' && (
            <form onSubmit={(e) => handleSubmit(e, 'room')} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Xona Nomi</label>
                <input type="text" required value={formData.room.name} onChange={(e) => setFormData({ ...formData, room: { ...formData.room, name: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Masalan: 101-xona" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Sig'imi (kishi)</label>
                <input type="number" value={formData.room.capacity} onChange={(e) => setFormData({ ...formData, room: { ...formData.room, capacity: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="20" />
              </div>
              <button type="submit" className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                {editingItem ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
          )}

          {modalType === 'group' && (
            <form onSubmit={(e) => handleSubmit(e, 'group')} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Guruh Nomi</label>
                <input type="text" required value={formData.group.name} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, name: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Guruh nomini kiriting" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Sohani tanlang</label>
                  <select
                    required
                    value={formData.group.sohaId}
                    onChange={(e) => setFormData({ ...formData, group: { ...formData.group, sohaId: e.target.value, courseId: '' } })}
                    className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled>Tanlang...</option>
                    {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Yo'nalishni tanlang</label>
                  <select
                    required
                    disabled={!formData.group.sohaId}
                    value={formData.group.courseId}
                    onChange={(e) => setFormData({ ...formData, group: { ...formData.group, courseId: e.target.value } })}
                    className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                  >
                    <option value="" disabled>Tanlang...</option>
                    {courses
                      .filter(c => (c.fieldId || c.field?.id) == formData.group.sohaId)
                      .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                    }
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">O'qituvchi</label>
                  <select required value={formData.group.teacherId} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, teacherId: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                    <option value="" disabled>Tanlang...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Xona</label>
                  <select required value={formData.group.roomId} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, roomId: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                    <option value="" disabled>Tanlang...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Dars kunlari</label>
                <div className="flex flex-wrap gap-2">
                  {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(d => (
                    <button
                      key={d} type="button"
                      onClick={() => { const days = formData.group.days.includes(d) ? formData.group.days.filter(x => x !== d) : [...formData.group.days, d]; setFormData({ ...formData, group: { ...formData.group, days } }); }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${formData.group.days.includes(d) ? 'bg-indigo-600 text-white shadow-md' : 'bg-[#131520] border border-white/10 text-gray-400 hover:bg-white/5'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Boshlanish vaqti</label>
                  <input type="time" required value={formData.group.startTime} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, startTime: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Tugash vaqti</label>
                  <input type="time" required value={formData.group.endTime} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, endTime: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-1.5 block">Guruh Statusi</label>
                <select 
                  required 
                  value={formData.group.status} 
                  onChange={(e) => setFormData({ ...formData, group: { ...formData.group, status: e.target.value } })} 
                  className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="WAITING">Yig'ilmoqda</option>
                  <option value="ACTIVE">Faol</option>
                  <option value="COMPLETED">Tugatilgan</option>
                  <option value="CANCELLED">Bekor qilingan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Boshlanish sanasi</label>
                  <input type="date" required value={formData.group.startDate} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, startDate: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1.5 block">Tugash sanasi</label>
                  <input type="date" required value={formData.group.endDate} onChange={(e) => setFormData({ ...formData, group: { ...formData.group, endDate: e.target.value } })} className="w-full bg-[#131520] border border-white/10 text-gray-400 rounded-xl px-4 py-3 focus:outline-none transition-all [color-scheme:dark]" readOnly title="Avtomatik hisoblanadi" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 text-base">
                {editingItem ? 'O\'zgarishlarni saqlash' : 'Guruhni tasdiqlash'}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Groups;