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
      className="fixed inset-0 z-[9999] bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
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
          className="w-full max-w-2xl bg-white/80 dark:bg-[#1e1e1e]/90 border text-black dark:text-white border-gray-200/50 dark:border-white/10 rounded-xl relative flex flex-col transform transition-all overflow-hidden backdrop-blur-2xl"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)'
          }}
        >
          {/* Header qismi */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] shrink-0">
            <h3 id="modal-title" className="text-[15px] font-semibold tracking-tight">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-md transition-colors focus:outline-none"
              aria-label="Yopish"
            >
              <X size={18} />
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