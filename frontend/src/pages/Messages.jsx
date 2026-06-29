import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, CheckCircle, Search } from 'lucide-react';
import { sendNotifications, getUnpaidStudents } from '../services/api';
import toast from 'react-hot-toast';

const Messages = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('ALL'); // 'ALL' (General announcement), 'UNPAID' (Those who haven't paid)
  const [unpaidMonth, setUnpaidMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  
  const [unpaidStudents, setUnpaidStudents] = useState([]);
  const [loadingUnpaid, setLoadingUnpaid] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch unpaid students when month changes or recipientType becomes 'UNPAID'
  useEffect(() => {
    if (recipientType === 'UNPAID') {
      fetchUnpaidStudents();
    }
  }, [recipientType, unpaidMonth]);

  const fetchUnpaidStudents = async () => {
    try {
      setLoadingUnpaid(true);
      const res = await getUnpaidStudents(unpaidMonth);
      setUnpaidStudents(res.data);
      // By default select all of them
      setSelectedStudentIds(res.data.map(s => s.id));
    } catch (err) {
      console.error('Error fetching unpaid students:', err);
      toast.error('To\'lanmagan talabalar ro\'yxatini yuklashda xatolik yuz berdi');
    } finally {
      setLoadingUnpaid(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredUnpaid.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredUnpaid.map(s => s.id));
    }
  };

  const handleStudentSelect = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sid => sid !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const filteredUnpaid = unpaidStudents.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.externalId && s.externalId.toLowerCase().includes(q));
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Sarlavha va xabar matnini to\'ldiring');
      return;
    }

    if (recipientType === 'UNPAID' && selectedStudentIds.length === 0) {
      toast.error('Kamida bitta talabani tanlashingiz kerak');
      return;
    }

    try {
      setSending(true);
      if (recipientType === 'ALL') {
        // Send a general notification (announcement/news)
        await sendNotifications({
          studentIds: [],
          title,
          message,
          isGeneral: true
        });
        toast.success('Umumiy e\'lon muvaffaqiyatli yuborildi');
      } else {
        // Send to selected unpaid students
        await sendNotifications({
          studentIds: selectedStudentIds,
          title,
          message,
          isGeneral: false
        });
        toast.success(`${selectedStudentIds.length} ta talabaga to'lov eslatmasi yuborildi`);
      }
      // Reset form
      setTitle('');
      setMessage('');
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Xabarlarni yuborishda xatolik yuz berdi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Xabarlar bo'limi</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Talabalar va ota-onalarga e'lonlar hamda to'lov eslatmalarini yuborish</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Create Message Form */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 space-y-5 backdrop-blur-md shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Send size={16} className="text-indigo-600 dark:text-indigo-400" />
            Yangi xabar yuborish
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Recipient Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Kimlarga yuboriladi?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRecipientType('ALL')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                    recipientType === 'ALL'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/20'
                  }`}
                >
                  Barchaga (Umumiy yangilik/e'lon)
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('UNPAID')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                    recipientType === 'UNPAID'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/20'
                  }`}
                >
                  To'lamaganlarga (Eslatma)
                </button>
              </div>
            </div>

            {/* If Unpaid, select Month */}
            {recipientType === 'UNPAID' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  Qaysi oy uchun to'lamaganlar?
                </label>
                <input
                  type="month"
                  value={unpaidMonth}
                  onChange={(e) => setUnpaidMonth(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Xabar sarlavhasi (O'zbekcha)</label>
              <input
                type="text"
                placeholder="Masalan: To'lov eslatmasi yoki Yangi guruh ochilishi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Xabar matni</label>
              <textarea
                placeholder="Xabar matnini kiriting..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-[#007aff] hover:bg-[#007aff]/90 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? 'Yuborilmoqda...' : 'Xabarni yuborish'}
            </button>
          </form>
        </div>

        {/* Right Side: Unpaid Students Selection (only visible if recipientType === 'UNPAID') */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-sm">
          {recipientType === 'UNPAID' ? (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">To'lamaganlar ro'yxati</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{unpaidMonth} oyi uchun</p>
                </div>
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unpaidStudents.length} ta o'quvchi
                </span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ism yoki ID bo'yicha qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-600"
                />
              </div>

              {/* Select All */}
              {filteredUnpaid.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-1"
                >
                  {selectedStudentIds.length === filteredUnpaid.length ? "Belgilashni bekor qilish" : "Barchasini belgilash"}
                </button>
              )}

              {/* List Container */}
              <div className="flex-1 overflow-y-auto max-h-[320px] pr-1 space-y-2.5">
                {loadingUnpaid ? (
                  <div className="text-center py-8 text-xs text-gray-500">Yuklanmoqda...</div>
                ) : filteredUnpaid.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500 flex flex-col items-center gap-2">
                    <CheckCircle size={28} className="text-emerald-500" />
                    Barcha o'quvchilar ushbu oy uchun to'lov qilishgan!
                  </div>
                ) : (
                  filteredUnpaid.map(student => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    return (
                      <div
                        key={`${student.id}_${student.group.id}`}
                        onClick={() => handleStudentSelect(student.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-500/5'
                            : 'border-gray-100 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/10'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by parent click
                          className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{student.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {student.group.course?.name} • {student.group.name}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
              <Users size={32} className="text-indigo-600/40" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Umumiy e'lonlar paneli</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto mt-1">
                  Ushbu rejimda yuborilgan xabar barcha ota-onalar va o'quvchilar uchun "Yangiliklar" bo'limida ko'rinadi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
