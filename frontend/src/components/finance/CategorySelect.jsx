import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Plus, Settings } from 'lucide-react';
import { getFinanceCategories } from '../../services/api';

const CategorySelect = ({ value, onChange, type, onManage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    try {
      const { data } = await getFinanceCategories(type);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCategory = categories.find(c => c.name === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-md px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus-within:ring-2 focus-within:ring-blue-500/50 cursor-pointer flex items-center justify-between transition-all"
      >
        <span className={!value ? 'text-gray-400' : ''}>
          {value || 'Kategoriyani tanlang...'}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1d1d1f] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Qidirish..."
                className="w-full bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-md pl-8 pr-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    onChange(cat.name, cat.id);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-[13px] cursor-pointer hover:bg-blue-500 hover:text-white transition-colors ${
                    value === cat.name ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-[12px] text-gray-400 italic">
                Hech narsa topilmadi
              </div>
            )}
          </div>

          <div 
            onClick={() => {
              setIsOpen(false);
              onManage();
            }}
            className="p-2 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer flex items-center justify-center gap-2 text-[12px] font-medium text-blue-600 dark:text-blue-400 transition-colors"
          >
            <Settings size={12} />
            Kategoriyalarni boshqarish
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
