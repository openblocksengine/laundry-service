import React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { X, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { create } from 'zustand';

// Simple store for notifications
export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({ 
    notifications: [...state.notifications, { id: Date.now(), ...notification }] 
  })),
  removeNotification: (id) => set((state) => ({ 
    notifications: state.notifications.filter((n) => n.id !== id) 
  })),
}));

export const NotificationProvider = ({ children }) => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <Toast.Provider swipeDirection="right">
      {children}
      {notifications.map(({ id, title, description, type = 'info' }) => (
        <Toast.Root
          key={id}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-out duration-300"
          onOpenChange={(open) => !open && removeNotification(id)}
        >
          <div className={
            type === 'success' ? 'text-emerald-500' :
            type === 'error' ? 'text-red-500' : 'text-orange-500'
          }>
            {type === 'success' ? <CheckCircle size={24} /> :
             type === 'error' ? <AlertCircle size={24} /> : <Info size={24} />}
          </div>
          <div>
            <Toast.Title className="text-sm font-black text-slate-900 dark:text-white mb-1">
              {title}
            </Toast.Title>
            <Toast.Description className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {description}
            </Toast.Description>
          </div>
          <Toast.Close className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={16} className="text-slate-400" />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-3 w-96 max-w-[100vw] m-0 list-none z-[300] outline-none" />
    </Toast.Provider>
  );
};
