import { useState, useCallback } from 'react';

interface ModalState {
  confirm: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  };
  prompt: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (value: string) => void;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
  };
  alert: {
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
  };
}

const initialState: ModalState = {
  confirm: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  },
  prompt: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  },
  alert: {
    isOpen: false,
    title: '',
    message: ''
  }
};

export function useModal() {
  const [modals, setModals] = useState<ModalState>(initialState);

  const showConfirm = useCallback((options: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => {
    setModals(prev => ({
      ...prev,
      confirm: {
        ...options,
        isOpen: true
      }
    }));
  }, []);

  const hideConfirm = useCallback(() => {
    setModals(prev => ({
      ...prev,
      confirm: {
        ...prev.confirm,
        isOpen: false
      }
    }));
  }, []);

  const showPrompt = useCallback((options: {
    title: string;
    message: string;
    onConfirm: (value: string) => void;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
  }) => {
    setModals(prev => ({
      ...prev,
      prompt: {
        ...options,
        isOpen: true
      }
    }));
  }, []);

  const hidePrompt = useCallback(() => {
    setModals(prev => ({
      ...prev,
      prompt: {
        ...prev.prompt,
        isOpen: false
      }
    }));
  }, []);

  const showAlert = useCallback((options: {
    title: string;
    message: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
  }) => {
    setModals(prev => ({
      ...prev,
      alert: {
        ...options,
        isOpen: true
      }
    }));
  }, []);

  const hideAlert = useCallback(() => {
    setModals(prev => ({
      ...prev,
      alert: {
        ...prev.alert,
        isOpen: false
      }
    }));
  }, []);

  // Convenience methods that return promises for easier usage
  const confirm = useCallback((options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      showConfirm({
        ...options,
        onConfirm: () => resolve(true)
      });
      // Set up a timeout to resolve false if the modal is closed without confirming
      setTimeout(() => {
        setModals(prev => {
          if (prev.confirm.isOpen) {
            resolve(false);
          }
          return prev;
        });
      }, 0);
    });
  }, [showConfirm]);

  const prompt = useCallback((options: {
    title: string;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<string | null> => {
    return new Promise((resolve) => {
      showPrompt({
        ...options,
        onConfirm: (value) => resolve(value)
      });
      // Set up a timeout to resolve null if the modal is closed without confirming
      setTimeout(() => {
        setModals(prev => {
          if (prev.prompt.isOpen) {
            resolve(null);
          }
          return prev;
        });
      }, 0);
    });
  }, [showPrompt]);

  const alert = useCallback((options: {
    title: string;
    message: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
  }): Promise<void> => {
    return new Promise((resolve) => {
      showAlert(options);
      const checkClosed = () => {
        setTimeout(() => {
          setModals(prev => {
            if (!prev.alert.isOpen) {
              resolve();
            } else {
              checkClosed();
            }
            return prev;
          });
        }, 100);
      };
      checkClosed();
    });
  }, [showAlert]);

  return {
    modals,
    showConfirm,
    hideConfirm,
    showPrompt,
    hidePrompt,
    showAlert,
    hideAlert,
    confirm,
    prompt,
    alert
  };
}