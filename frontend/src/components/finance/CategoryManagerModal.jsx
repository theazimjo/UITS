import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { getFinanceCategories, createFinanceCategory, updateFinanceCategory, deleteFinanceCategory } from '../../services/api';

const CategoryManagerModal = ({ isOpen, onClose, type }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setError('');
    }
  }, [isOpen, type]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await getFinanceCategories(type);
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await createFinanceCategory({ name: newCatName.trim(), type });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      setError('Kategoriyani qo\'shib bo\'lmadi');
    }
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateFinanceCategory(id, { name: editName.trim() });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError('O\'zgartirishda xato yuz berdi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyani o\'chirmoqchimisiz?')) return;
    try {
      const { data } = await deleteFinanceCategory(id);
      if (data.success === false) {
        setError(data.message);
      } else {
        fetchCategories();
        setError('');
      }
    } catch (err) {
      setError('O\'chirish imkonsiz (kategoriya ishlatilayotgan bo\'lishi mumkin)');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1d1d1f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <h3 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-white">
            {type === 'INCOME' ? 'Daromad' : 'Xarajat'} kategoriyalarini boshqarish
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 text-[13px]">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Yangi kategoriya..."
              className="flex-1 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-[14px] outline-none focus:ring-2 focus:ring-blue-500"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
                <div className="py-10 text-center text-gray-400 text-[14px]">Yuklanmoqda...</div>
            ) : categories.map(cat => (
              <div key={cat.id} className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all">
                {editingId === cat.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      className="flex-1 bg-white dark:bg-black/50 border border-blue-500 rounded-md px-2 py-1 text-[13px] outline-none"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <button onClick={() => handleSaveEdit(cat.id)} className="text-green-600 p-1 hover:bg-green-50 rounded">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400 p-1 hover:bg-gray-100 rounded">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-[14px] font-medium text-gray-700 dark:text-gray-300">
                      {cat.name}
                      {cat.isSystem && <span className="ml-2 text-[10px] text-blue-500 border border-blue-500/30 px-1.5 py-0.5 rounded-full">Tizim</span>}
                    </span>
                    {!cat.isSystem && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                          }}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerModal;
