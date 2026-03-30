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
  const [activeTab, setActiveTab] = useState('guruhlar');
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [formData, setFormData] = useState({
    field: { name: '', duration: '' },
    course: { name: '', duration: '', monthlyPrice: '', fieldId: '' },
    room: { name: '', capacity: '' },
    group: { name: '', sohaId: '', courseId: '', roomId: '', teacherId: '', days: [], startTime: '', endTime: '', startDate: '', endDate: '', monthlyPrice: '' }
  });

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
        monthlyPrice: item.monthlyPrice
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
          <button onClick={() => { setEditingItem(null); setModalType('field'); setFormData(prev => ({ ...prev, field: { name: '', duration: '' } })); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#1e2030] hover:bg-[#2a2d43] border border-white/5 rounded-xl text-sm font-medium text-gray-200 transition-all">
            <Plus size={16} /> Soha
          </button>
          <button onClick={() => { setEditingItem(null); setModalType('course'); setFormData(prev => ({ ...prev, course: { ...prev.course, fieldId: selectedFieldId || '' } })); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#1e2030] hover:bg-[#2a2d43] border border-white/5 rounded-xl text-sm font-medium text-gray-200 transition-all">
            <Plus size={16} /> Yo'nalish
          </button>
          <button onClick={() => { setEditingItem(null); setModalType('room'); setFormData(prev => ({ ...prev, room: { name: '', capacity: '' } })); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#1e2030] hover:bg-[#2a2d43] border border-white/5 rounded-xl text-sm font-medium text-gray-200 transition-all">
            <Plus size={16} /> Xona
          </button>
          <button onClick={() => { setEditingItem(null); setModalType('group'); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <Plus size={16} /> Guruh yaratish
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[#131520]/50 border border-white/10 rounded-2xl w-fit mb-8 backdrop-blur-md">
        {['guruhlar', 'sohalar', 'xonalar'].map(t => (
          <button
            key={t}
            onClick={() => { setActiveTab(t); if (t !== 'sohalar') setSelectedFieldId(null); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${activeTab === t
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content: Guruhlar */}
      {activeTab === 'guruhlar' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
          {groups.map(g => (
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
                  <div className="text-right hidden sm:block">
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
          {groups.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <Users size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400 text-sm">Hali guruhlar mavjud emas</p>
            </div>
          )}
        </div>
      )}

      {/* Content: Sohalar */}
      {activeTab === 'sohalar' && (
        <div className="animate-fade-in">
          {!selectedFieldId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {fields.map(f => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFieldId(f.id)}
                  className="bg-[#131520] border border-white/10 p-6 rounded-2xl cursor-pointer group hover:border-indigo-500/50 hover:bg-[#1a1c2a] transition-all relative"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(f, 'field'); }} className="p-1.5 bg-white/10 hover:bg-blue-500 text-gray-300 hover:text-white rounded-md transition-colors"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id, 'field'); }} className="p-1.5 bg-white/10 hover:bg-red-500 text-gray-300 hover:text-white rounded-md transition-colors"><Trash2 size={14} /></button>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{f.name}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">{f.duration} oy davomiylik</p>
                    <span className="px-2.5 py-1 bg-white/5 rounded-md text-xs font-medium text-gray-300">
                      {courses.filter(c => (c.fieldId || c.field?.id) == f.id).length} yo'nalish
                    </span>
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                  <BookOpen size={48} className="text-gray-600 mb-4" />
                  <p className="text-gray-400 text-sm">Hali sohalar mavjud emas</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 pb-10">
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setSelectedFieldId(null)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {fields.find(f => f.id === selectedFieldId)?.name}
                  </h3>
                  <p className="text-sm text-indigo-400 font-medium mt-1">Sohasiga oid yo'nalishlar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.filter(c => (c.fieldId || c.field?.id) == selectedFieldId).map(c => (
                  <div key={c.id} className="bg-[#131520] border border-white/10 p-6 rounded-2xl group hover:border-indigo-500/40 transition-all relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEdit(c, 'course')} className="p-1.5 bg-white/5 hover:bg-blue-500 hover:text-white text-gray-400 rounded-md transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(c.id, 'course')} className="p-1.5 bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2">{c.name}</h4>
                    <p className="text-sm text-gray-400 mb-4">{c.duration} oy davomiylik</p>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Oylik to'lov</span>
                      <span className="text-base font-semibold text-emerald-400">{parseInt(c.monthlyPrice).toLocaleString()} UZS</span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => { setEditingItem(null); setModalType('course'); setFormData(prev => ({ ...prev, course: { ...prev.course, fieldId: selectedFieldId } })); }}
                  className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-[#131520] transition-all min-h-[160px]"
                >
                  <Plus size={24} className="mb-2" />
                  <span className="text-sm font-medium">Yangi yo'nalish qo'shish</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content: Xonalar */}
      {activeTab === 'xonalar' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map(r => (
            <div key={r.id} className="bg-[#131520] border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center group hover:border-rose-500/40 hover:bg-[#1a1c2a] transition-all relative">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEdit(r, 'room')} className="p-1.5 bg-white/5 hover:bg-blue-500 hover:text-white text-gray-400 rounded-md transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(r.id, 'room')} className="p-1.5 bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 rounded-md transition-colors"><Trash2 size={14} /></button>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{r.name}</h4>
              <p className="text-sm font-medium text-gray-500 bg-white/5 px-3 py-1 rounded-lg mt-2">
                Sig'imi: {r.capacity} kishi
              </p>
            </div>
          ))}

          <button
            onClick={() => { setEditingItem(null); setModalType('room'); setFormData(prev => ({ ...prev, room: { name: '', capacity: '' } })); }}
            className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-rose-500/40 hover:text-rose-400 hover:bg-[#131520] transition-all min-h-[160px]"
          >
            <Plus size={24} className="mb-2" />
            <span className="text-sm font-medium">Yangi xona qo'shish</span>
          </button>
          
          {rooms.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <MapPin size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400 text-sm">Hali xonalar mavjud emas</p>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <Modal
        isOpen={!!modalType}
        onClose={() => { setModalType(null); setEditingItem(null); }}
        title={editingItem ? `Tahrirlash: ${editingItem.name}` : (modalType === 'field' ? 'Yangi Soha yaratish' : modalType === 'course' ? 'Yangi Yo\'nalish yaratish' : modalType === 'room' ? 'Yangi Xona qo\'shish' : 'Yangi Guruh yaratish')}
      >
        <div className="p-1">
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