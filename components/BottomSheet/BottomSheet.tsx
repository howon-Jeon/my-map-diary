'use client'

import { useEffect } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export default function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  // 시트 열린 상태에서 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        data-testid="bottom-sheet-overlay"
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* 시트 본체 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col">
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 타이틀 (있는 경우) */}
        {title && (
          <div className="px-4 py-2 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="overflow-y-auto flex-1 px-4 pb-8">
          {children}
        </div>
      </div>
    </>
  )
}
