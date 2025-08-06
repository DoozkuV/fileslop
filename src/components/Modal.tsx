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
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className={`modal-content modal-${size}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseButton && (
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="modal-body">
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
        return <XCircle className="dialog-icon dialog-icon-danger" size={24} />;
      case 'warning':
        return <AlertTriangle className="dialog-icon dialog-icon-warning" size={24} />;
      case 'info':
        return <Info className="dialog-icon dialog-icon-info" size={24} />;
      default:
        return <AlertTriangle className="dialog-icon dialog-icon-warning" size={24} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirm-dialog">
        <div className="confirm-dialog-content">
          {getIcon()}
          <p className="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button
            className="button button-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`button button-${variant}`}
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
      <div className="prompt-dialog">
        <div className="prompt-dialog-content">
          <Info className="dialog-icon dialog-icon-info" size={24} />
          <p className="prompt-dialog-message">{message}</p>
          <input
            ref={inputRef}
            type="text"
            className="prompt-dialog-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="prompt-dialog-actions">
          <button
            className="button button-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className="button button-primary"
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
        return <CheckCircle className="dialog-icon dialog-icon-success" size={24} />;
      case 'error':
        return <XCircle className="dialog-icon dialog-icon-danger" size={24} />;
      case 'warning':
        return <AlertTriangle className="dialog-icon dialog-icon-warning" size={24} />;
      case 'info':
        return <Info className="dialog-icon dialog-icon-info" size={24} />;
      default:
        return <Info className="dialog-icon dialog-icon-info" size={24} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="alert-dialog">
        <div className="alert-dialog-content">
          {getIcon()}
          <p className="alert-dialog-message">{message}</p>
        </div>
        <div className="alert-dialog-actions">
          <button
            className="button button-primary"
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}