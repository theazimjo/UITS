import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // UX yaxshilanishi: Modal ochilganda orqa fon skroll bo'lishini to'xtatish
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Eng yuqori darajadagi portal konteyneri
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-[#0b0d17]/80 backdrop-blur-sm animate-fade-in flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Markazlashtirish va tashqariga bosganda yopish uchun konteyner */}
      <div
        className="w-full flex justify-center min-h-full items-center py-10"
        onClick={onClose}
      >
        {/* Modalning o'zi */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#131520] border border-white/10 rounded-2xl shadow-2xl relative flex flex-col transform transition-all overflow-hidden"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
          }}
        >
          {/* Header qismi */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 bg-white/[0.02] shrink-0">
            <h3 id="modal-title" className="text-xl font-bold text-white tracking-tight">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 bg-transparent hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#131520]"
              aria-label="Yopish"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content qismi */}
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;