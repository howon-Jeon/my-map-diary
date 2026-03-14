'use client'

import Image from 'next/image'
import { useRef } from 'react'
import imageCompression from 'browser-image-compression'

interface PhotoUploadProps {
  onUpload: (file: File) => void
  isUploading: boolean
  previewUrl?: string | null
}

export default function PhotoUpload({ onUpload, isUploading, previewUrl }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1MB 이하로 압축
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    })

    onUpload(compressed as File)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 사진 미리보기 */}
      {previewUrl && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={previewUrl}
            alt="장소 사진 미리보기"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 첨부 버튼 */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        {isUploading ? (
          <>
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>업로드 중...</span>
          </>
        ) : (
          <>
            <span>📷</span>
            <span>사진 첨부 {previewUrl ? '(변경)' : ''}</span>
          </>
        )}
      </button>

      {/* 파일 입력 (숨김) - iOS Safari에서 카메라 직접 연동 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
