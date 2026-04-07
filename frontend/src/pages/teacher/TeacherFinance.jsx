import React, { useState, useEffect } from 'react';
import { getTeacherFinance } from '../../services/api';
import { BarChart3, ChevronLeft, ChevronRight, Loader2, TrendingUp, Wallet, Users } from 'lucide-react';

const TeacherFinance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchFinance();
  }, [currentMonth]);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await getTeacherFinance(currentMonth);
      setData(res.data);
    } catch (err) {
      console.error('Finance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta) => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCurrentMonth(d.toISOString().slice(0, 7));
  };

  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const [year, month] = currentMonth.split('-').map(Number);
  const monthLabel = `${monthNames[month - 1]} ${year}`;

  const paymentTypeMap = {
    CASH: 'Naqd', CARD: 'Karta', TRANSFER: "O'tkazma", CLICK: 'Click', PAYME: 'Payme',
    'Naqd': 'Naqd', 'Karta': 'Karta', "O'tkazma": "O'tkazma"
  };

  return (
    <div className="h-full w-full flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      {/* Toolbar */}
      <div className="min-h-[56px] flex items-center justify-between px-6 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm">
            <BarChart3 size={16} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">Moliya</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Guruhlarim to'lovlari</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300">
            <ChevronLeft size={18} />
          </button>
          <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-white min-w-[140px] text-center">{monthLabel}</span>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Total Income Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 mb-6 text-white shadow-xl shadow-emerald-500/20">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <TrendingUp size={18} />
                <span className="text-[12px] font-semibold uppercase tracking-wider">Jami tushum</span>
              </div>
              <p className="text-[32px] font-black leading-none">{(data?.totalIncome || 0).toLocaleString()} <span className="text-[16px] font-normal opacity-70">so'm</span></p>
            </div>

            {/* Group Breakdown */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm p-6 mb-6">
              <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white mb-4">Guruhlar bo'yicha</h3>
              <div className="space-y-3">
                {data?.groups?.map((g) => {
                  const pct = g.activeStudents > 0 ? Math.round((g.paidStudents / g.activeStudents) * 100) : 0;
                  return (
                    <div key={g.id} className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">{g.name}</span>
                        <span className="text-[14px] font-black text-emerald-600 dark:text-emerald-400">{g.totalCollected.toLocaleString()} so'm</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1"><Users size={12} /> {g.paidStudents}/{g.activeStudents} to'lagan</span>
                        <span className="flex items-center gap-1"><Wallet size={12} /> Narxi: {Number(g.monthlyPrice).toLocaleString()}</span>
                      </div>
                      <div className="mt-3 w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {(!data?.groups || data.groups.length === 0) && (
                  <p className="text-center text-gray-400 py-6 text-[13px]">Ma'lumot yo'q</p>
                )}
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-white/5">
                <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white">To'lovlar tarixi</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                      <th className="text-left px-6 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Talaba</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Guruh</th>
                      <th className="text-right px-4 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Summa</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Turi</th>
                      <th className="text-right px-6 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.payments?.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5">
                        <td className="px-6 py-3 font-medium text-[#1d1d1f] dark:text-white">{p.studentName}</td>
                        <td className="px-4 py-3 text-gray-500">{p.groupName}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{Number(p.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md text-[11px] font-semibold">
                            {paymentTypeMap[p.paymentType] || p.paymentType}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-gray-500">{new Date(p.paymentDate).toLocaleDateString('uz')}</td>
                      </tr>
                    ))}
                    {(!data?.payments || data.payments.length === 0) && (
                      <tr><td colSpan={5} className="text-center text-gray-400 py-8">To'lovlar yo'q</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherFinance;
