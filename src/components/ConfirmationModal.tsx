import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#F0F9F6] rounded-none border-2 border-black overflow-hidden"
          >
            <div className={cn(
              "p-6 border-b-2 border-black flex justify-between items-center",
              variant === 'danger' ? "bg-[#2FA084] text-white" : "bg-[#E2E8F0] text-black"
            )}>
              <div className="flex items-center gap-3">
                {variant === 'danger' ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                <h3 className="text-xl font-black tracking-tighter uppercase">{title}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-none transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <p className="text-black font-black text-sm leading-relaxed tracking-tight uppercase">
                {message}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={onClose}
                  className="neo-button bg-white text-black border-2 border-black py-4"
                >
                  {cancelLabel}
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "neo-button py-4",
                    variant === 'danger' ? "bg-[#2FA084] text-white" : "bg-emerald-700 text-white"
                  )}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
