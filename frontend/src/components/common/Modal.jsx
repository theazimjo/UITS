import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Eng yuqori darajadagi portal konteyneri
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-xl animate-fade-in"
      style={{ overflowScrolling: 'touch' }}
    >
      {/* Markazlashtirish uchun konteyner - items-start islatilishi shart! */}
      <div className="min-h-full py-10 px-4 lg:py-20 flex justify-center items-start" onClick={onClose}>
        
        {/* Modalning o'zi. my-auto olib tashlandi, chunki u tepani kesib qo'yar edi */}
        <div 
          className="glass-card w-full max-w-2xl rounded-[3rem] border border-white/10 p-10 relative shadow-2xl flex flex-col"
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
           {/* Header */}
           <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                  {title}
                </h3>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all transform hover:rotate-90 active:scale-95 border border-white/5"
              >
                <X size={24} />
              </button>
           </div>

           {/* Content */}
           <div className="flex-1 opacity-100">
              {children}
           </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
