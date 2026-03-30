import React, { useState, useEffect } from 'react';
import { Plus, Clock, MapPin } from 'lucide-react';
import { 
  createField, createCourse, createRoom, createGroup 
} from '../services/api';
import Modal from '../components/common/Modal';

const Groups = ({ 
  groups, fields, courses, rooms, staffList, 
  fetchGroups, fetchFields, fetchCourses, fetchRooms 
}) => {
  const [activeTab, setActiveTab] = useState('guruhlar');
  const [modalType, setModalType] = useState(null); 
  const [formData, setFormData] = useState({
    field: { name: '', duration: '' },
    course: { name: '', duration: '', monthlyPrice: '', fieldId: '' },
    room: { name: '', capacity: '' },
    group: { name: '', fieldsId: '', courseId: '', roomId: '', teacherId: '', days: [], startTime: '', endTime: '', startDate: '', endDate: '', monthlyPrice: '' }
  });

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
      if (type === 'field') await createField(formData.field);
      if (type === 'course') await createCourse({ ...formData.course, field: { id: parseInt(formData.course.fieldId) } });
      if (type === 'room') await createRoom(formData.room);
      if (type === 'group') await createGroup({ 
        ...formData.group, 
        course: { id: parseInt(formData.group.courseId) },
        room: { id: parseInt(formData.group.roomId) },
        teacher: { id: parseInt(formData.group.teacherId) }
      });
      setModalType(null); fetchGroups(); fetchFields(); fetchCourses(); fetchRooms();
    } catch (err) { console.error(err); }
  };

  const teachers = staffList.filter(s => s.role?.name?.toLowerCase().includes('o\'qituvchi'));

  return (
    <div className="animate-fade-in px-4 lg:px-8">
      <div className="flex justify-between items-center mb-8 mt-2">
        <div><h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">O'quv tizimi</h2><p className="text-sm text-gray-500">Guruhlar va dars jadvali</p></div>
        <div className="flex gap-4">
          <button onClick={() => setModalType('field')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all">+ Soha</button>
          <button onClick={() => setModalType('course')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-all">+ Kurs</button>
          <button onClick={() => setModalType('group')} className="px-6 py-2.5 bg-purple-600 rounded-xl text-xs font-black uppercase text-white shadow-xl shadow-purple-600/20 active:scale-95 transition-all italic">Guruh yaratish</button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {['guruhlar', 'sohalar', 'xonalar'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === t ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
        ))}
      </div>

      {activeTab === 'guruhlar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          {groups.map(g => (
            <div key={g.id} className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group transition-all hover:border-purple-600/20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/5 rounded-bl-full"></div>
              <div className="flex justify-between items-start mb-6">
                <div><h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{g.name}</h4><p className="text-[10px] text-purple-500 font-black uppercase mt-1 tracking-widest">{g.course?.field?.name} / {g.course?.name}</p></div>
                <div className="text-right"><p className="text-lg font-black text-emerald-400 font-mono tracking-tighter">{g.monthlyPrice} <span className="text-[10px] text-gray-500 font-medium">UZS</span></p></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mb-6 font-bold font-mono uppercase italic">
                <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-3 rounded-2xl"><Clock size={16} className="text-blue-500" /><p className="text-gray-200">{g.startTime} - {g.endTime}</p></div>
                <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-3 rounded-2xl"><MapPin size={16} className="text-emerald-500" /><p className="text-gray-200">{g.room?.name || '—'}</p></div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl flex flex-wrap gap-2 mb-6">
                {['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(day => (
                  <span key={day} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${g.days.includes(day) ? 'bg-purple-600 text-white' : 'bg-black/20 text-gray-700'}`}>{day}</span>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5 font-black uppercase text-[10px] tracking-widest">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-[10px]">{g.teacher?.name?.substring(0, 1)}</div><p className="text-gray-400">{g.teacher?.name}</p></div>
                <p className="text-gray-600 italic">{g.startDate} — {g.endDate}</p>
              </div>
            </div>
          ))}
          {groups.length === 0 && <div className="col-span-2 py-20 text-center text-gray-700 italic text-sm border-2 border-dashed border-white/5 rounded-[2.5rem]">Hali guruhlar mavjud emas</div>}
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={modalType === 'field' ? 'Yangi Soha' : modalType === 'course' ? 'Yangi Kurs' : modalType === 'room' ? 'Yangi Xona' : 'Guruh Yaratish'}>
         {modalType === 'field' && (
          <form onSubmit={(e) => handleSubmit(e, 'field')} className="space-y-6">
            <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Soha Nomi</label><input type="text" required onChange={(e) => setFormData({...formData, field: {...formData.field, name: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="Masalan: Backend"/></div>
            <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Davomiyligi (oy)</label><input type="number" required onChange={(e) => setFormData({...formData, field: {...formData.field, duration: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="9"/></div>
            <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-[0.2em] italic shadow-2xl">SAQLASH</button>
          </form>
        )}
        {modalType === 'course' && (
          <form onSubmit={(e) => handleSubmit(e, 'course')} className="space-y-6">
             <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Sohani tanlang</label><select required onChange={(e) => setFormData({...formData, course: {...formData.course, fieldId: e.target.value}})} className="glass-input w-full p-4 rounded-2xl bg-[#0b0d17]">{fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
             <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Kurs Nomi</label><input type="text" required onChange={(e) => setFormData({...formData, course: {...formData.course, name: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="Masalan: Node.js"/></div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Davomiyligi (oy)</label><input type="number" required onChange={(e) => setFormData({...formData, course: {...formData.course, duration: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="2"/></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Oylik Narxi</label><input type="number" required onChange={(e) => setFormData({...formData, course: {...formData.course, monthlyPrice: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" placeholder="500,000"/></div>
             </div>
             <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase italic shadow-2xl">SAQLASH</button>
          </form>
        )}
        {modalType === 'room' && (
          <form onSubmit={(e) => handleSubmit(e, 'room')} className="space-y-6">
            <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Xona Nomi</label><input type="text" required onChange={(e) => setFormData({...formData, room: {...formData.room, name: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" /></div>
            <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Sig'imi</label><input type="number" onChange={(e) => setFormData({...formData, room: {...formData.room, capacity: e.target.value}})} className="glass-input w-full p-4 rounded-2xl" /></div>
            <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase italic shadow-2xl">SAQLASH</button>
          </form>
        )}
        {modalType === 'group' && (
          <form onSubmit={(e) => handleSubmit(e, 'group')} className="space-y-6 px-1">
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Guruh Nomi</label><input type="text" required onChange={(e) => setFormData({...formData, group: {...formData.group, name: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Kursni tanlang</label><select required onChange={(e) => setFormData({...formData, group: {...formData.group, courseId: e.target.value}})} className="glass-input w-full p-4 rounded-2xl bg-[#0b0d17]">{courses.map(c => <option key={c.id} value={c.id}>{c.field?.name} - {c.name}</option>)}</select></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">O'qituvchi</label><select required onChange={(e) => setFormData({...formData, group: {...formData.group, teacherId: e.target.value}})} className="glass-input w-full p-4 rounded-2xl bg-[#0b0d17]">{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Xona</label><select required onChange={(e) => setFormData({...formData, group: {...formData.group, roomId: e.target.value}})} className="glass-input w-full p-4 rounded-2xl bg-[#0b0d17]">{rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
             </div>
             <div><label className="text-[10px] text-gray-500 font-black mb-3 block uppercase tracking-widest">Kunlar</label><div className="flex flex-wrap gap-2">{['Dush', 'Sesh', 'Chor', 'Paysh', 'Jum', 'Shan'].map(d => <button key={d} type="button" onClick={() => { const days = formData.group.days.includes(d) ? formData.group.days.filter(x => x !== d) : [...formData.group.days, d]; setFormData({...formData, group: {...formData.group, days}}); }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${formData.group.days.includes(d) ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-600'}`}>{d}</button>)}</div></div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Boshlanish vaqti</label><input type="time" required onChange={(e) => setFormData({...formData, group: {...formData.group, startTime: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Tugash vaqti</label><input type="time" required onChange={(e) => setFormData({...formData, group: {...formData.group, endTime: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Boshlanish sanasi</label><input type="date" required onChange={(e) => setFormData({...formData, group: {...formData.group, startDate: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
               <div><label className="text-[10px] text-gray-500 font-black mb-2 block uppercase tracking-widest">Tugash sanasi (Auto)</label><input type="date" required value={formData.group.endDate} onChange={(e) => setFormData({...formData, group: {...formData.group, endDate: e.target.value}})} className="glass-input w-full p-4 rounded-2xl"/></div>
             </div>
             <button type="submit" className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-3xl uppercase italic shadow-2xl tracking-widest text-xs">TASDIQLASH</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Groups;
