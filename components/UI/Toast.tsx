'use client'

import { Toast as ToastType } from '@/hooks/useToast'

interface ToastContainerProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

const TYPE_STYLES: Record<ToastType['type'], string> = {
  error: 'bg-red-500',
  success: 'bg-green-500',
  info: 'bg-gray-700',
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`${TYPE_STYLES[toast.type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-2`}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="알림 닫기"
            className="text-white/80 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
