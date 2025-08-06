import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4"
      onClick={handleOverlayClick}
    >
      <div className={`bg-white rounded-xl shadow-xl border border-primary-200 max-h-[90vh] overflow-y-auto animate-fade-in ${
        size === 'sm' ? 'w-full max-w-sm' : 
        size === 'lg' ? 'w-full max-w-3xl' : 
        'w-full max-w-xl'
      }`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-0 mb-4">
          <h2 className="text-xl font-semibold text-primary-900">{title}</h2>
          {showCloseButton && (
            <button
              className="flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent text-primary-400 cursor-pointer transition-all hover:bg-primary-100 hover:text-primary-900"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={24} />;
      case 'info':
        return <Info className="text-accent-400 flex-shrink-0 mt-0.5" size={24} />;
      default:
        return <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={24} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="min-w-80">
        <div className="flex items-start gap-4 mb-6">
          {getIcon()}
          <p className="text-primary-900 leading-relaxed flex-1">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-primary-300 rounded-md text-sm font-medium cursor-pointer transition-all text-primary-900 bg-primary-50 hover:bg-primary-100 hover:border-primary-400 min-w-20"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 border rounded-md text-sm font-medium cursor-pointer transition-all text-white min-w-20 ${
              variant === 'danger' 
                ? 'bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600' 
                : variant === 'warning'
                ? 'bg-amber-500 border-amber-500 hover:bg-amber-600 hover:border-amber-600'
                : 'bg-accent-400 border-accent-400 hover:bg-accent-500 hover:border-accent-500'
            }`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export function PromptDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder,
  defaultValue = '',
  confirmText = 'OK',
  cancelText = 'Cancel'
}: PromptDialogProps) {
  const [value, setValue] = React.useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="min-w-80">
        <div className="flex items-start gap-4 mb-6">
          <Info className="text-accent-400 flex-shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <p className="text-primary-900 leading-relaxed mb-4">{message}</p>
            <input
              ref={inputRef}
              type="text"
              className="w-full mt-4 px-3 py-2 border border-primary-200 rounded-md bg-white text-primary-900 text-sm transition-colors focus:outline-none focus:border-accent-400 placeholder:text-primary-400"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-primary-300 rounded-md text-sm font-medium cursor-pointer transition-all text-primary-900 bg-primary-50 hover:bg-primary-100 hover:border-primary-400 min-w-20"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-accent-400 rounded-md text-sm font-medium cursor-pointer transition-all text-white bg-accent-400 hover:bg-accent-500 hover:border-accent-500 min-w-20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={!value.trim()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  buttonText = 'OK'
}: AlertDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={24} />;
      case 'error':
        return <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={24} />;
      case 'info':
        return <Info className="text-accent-400 flex-shrink-0 mt-0.5" size={24} />;
      default:
        return <Info className="text-accent-400 flex-shrink-0 mt-0.5" size={24} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="min-w-80">
        <div className="flex items-start gap-4 mb-6">
          {getIcon()}
          <p className="text-primary-900 leading-relaxed flex-1">{message}</p>
        </div>
        <div className="flex justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-accent-400 rounded-md text-sm font-medium cursor-pointer transition-all text-white bg-accent-400 hover:bg-accent-500 hover:border-accent-500 min-w-20"
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}