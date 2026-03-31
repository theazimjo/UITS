import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Plus, Trash2, Calendar, 
  User, BookOpen, DollarSign, ArrowRight, Download
} from 'lucide-react';
import { getPayments, createPayment, deletePayment } from '../services/api';
import Modal from '../components/common/Modal';

const Payments = ({ students = [], groups = [] }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    groupId: '',
    amount: '',
    month: new Date().toISOString().substring(0, 7),
    paymentType: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getPayments();
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        student: { id: parseInt(formData.studentId) },
        group: { id: parseInt(formData.groupId) },
        amount: parseFloat(formData.amount)
      };
      await createPayment(payload);
      await fetchPayments();
      setIsModalOpen(false);
      setFormData({
        studentId: '',
        groupId: '',
        amount: '',
        month: new Date().toISOString().substring(0, 7),
        paymentType: 'CASH',
        paymentDate: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error creating payment:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('To\'lovni o\'chirishni xohlaysizmi?')) {
      try {
        await deletePayment(id);
        await fetchPayments();
      } catch (err) {
        console.error('Error deleting payment:', err);
      }
    }
  };

  const filteredPayments = payments.filter(p => 
    p.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.group?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id === parseInt(formData.studentId));
  const studentGroups = groups.filter(g => g.enrollments?.some(e => (e.studentId || e.student?.id) === parseInt(formData.studentId)));

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#131520] p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <CreditCard size={22} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">To'lovlar <span className="text-indigo-400">boshqaruvi</span></h1>
          </div>
          <p className="text-gray-400 font-medium">Barcha o'quvchilar va guruhlar bo'yicha hisob-kitoblar</p>
        </div>

        <div className="flex items-center gap-4 relative z-10 font-bold">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-xl">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Umumiy tushum</p>
            <p className="text-xl text-emerald-400 font-black">
              {payments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toLocaleString()} <span className="text-xs">UZS</span>
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group font-bold tracking-wide"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Yangi to'lov
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#131520] p-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="O'quvchi yoki guruh nomi bo'yicha qidirish..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 group-hover:border-white/10 focus:border-indigo-500/50 rounded-xl pl-12 pr-4 py-3.5 text-gray-200 outline-none transition-all placeholder:text-gray-600 font-medium"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#131520] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-6">O'quvchi</th>
                <th className="px-8 py-6">Guruh</th>
                <th className="px-8 py-6">Oy / Sana</th>
                <th className="px-8 py-6">Summa</th>
                <th className="px-8 py-6">Turi</th>
                <th className="px-8 py-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex justify-center flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Ma'lumotlar yuklanmoqda...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? filteredPayments.map(p => (
                <tr key={p.id} className="group hover:bg-white/[0.01] transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/10 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {p.student?.name?.substring(0, 1)}
                      </div>
                      <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{p.student?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-indigo-400 transition-colors">
                      <BookOpen size={16} className="opacity-50" />
                      <span className="font-bold">{p.group?.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-white mb-0.5">{p.month}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{p.paymentDate}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="bg-emerald-400/5 border border-emerald-400/10 px-3 py-1.5 rounded-lg w-fit">
                      <span className="text-sm font-black text-emerald-400">
                        {parseInt(p.amount).toLocaleString()} <span className="text-[10px] opacity-70">UZS</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] font-black border border-white/5 group-hover:border-white/20 transition-all uppercase tracking-widest">
                      {p.paymentType}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-3 text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Search size={48} className="text-gray-500 mb-4" />
                      <p className="text-gray-500 font-black uppercase tracking-widest text-sm">To'lovlar topilmadi</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payment Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Yangi to'lovni qayd etish"
      >
        <form onSubmit={handleCreatePayment} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">O'quvchini tanlang</label>
              <select 
                value={formData.studentId} 
                onChange={e => setFormData({ ...formData, studentId: e.target.value, groupId: '' })}
                className="w-full bg-[#0b0d17] border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                required
              >
                <option value="">O'quvchini tanlang</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.phone || '—'})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Guruhni tanlang</label>
              <select 
                value={formData.groupId} 
                onChange={e => {
                  const g = groups.find(x => x.id === parseInt(e.target.value));
                  const minMonth = g?.startDate?.substring(0, 7) || '';
                  let newMonth = formData.month;
                  if (minMonth && newMonth < minMonth) {
                    newMonth = minMonth;
                  }
                  setFormData({ ...formData, groupId: e.target.value, amount: g ? g.monthlyPrice : formData.amount, month: newMonth });
                }}
                className="w-full bg-[#0b0d17] border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold disabled:opacity-50"
                required
                disabled={!formData.studentId}
              >
                <option value="">Guruhni tanlang</option>
                {studentGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              {!formData.studentId && <p className="text-[10px] text-amber-500/70 font-bold mt-2 ml-1">Avval o'quvchini tanlang!</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">To'lov miqdori</label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="number" 
                    value={formData.amount} 
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-[#0b0d17] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-emerald-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-xl"
                    placeholder="250 000"
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">To'lov oyi</label>
                <input 
                  type="month" 
                  value={formData.month} 
                  min={groups.find(g => g.id === parseInt(formData.groupId))?.startDate?.substring(0, 7)}
                  onChange={e => setFormData({ ...formData, month: e.target.value })}
                  className="w-full bg-[#0b0d17] border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">To'lov turi</label>
                <select 
                  value={formData.paymentType} 
                  onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full bg-[#0b0d17] border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  required
                >
                  <option value="CASH">Naqd</option>
                  <option value="CARD">Plastik karta</option>
                  <option value="TRANSFER">O'tkazma</option>
                  <option value="CLICK">Click / Payme</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Sana</label>
                <input 
                  type="date" 
                  value={formData.paymentDate} 
                  onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full bg-[#0b0d17] border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  required 
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5"
            >
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest text-xs"
            >
              To'lovni saqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
