'use client'

import { useState } from 'react'
import { Place, PlaceCategory, NewPlace } from '@/types/place'
import { addPlace, uploadPlacePhoto } from '@/lib/places'
import StarRating from '@/components/UI/StarRating'
import PhotoUpload from '@/components/UI/PhotoUpload'

const CATEGORIES: PlaceCategory[] = ['맛집', '카페', '산책', '기타']

interface NewPlaceSheetProps {
  lat: number
  lng: number
  onSave: (place: Place) => void
  onClose: () => void
}

export default function NewPlaceSheet({ lat, lng, onSave, onClose }: NewPlaceSheetProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<PlaceCategory>('맛집')
  const [memo, setMemo] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoUpload = (file: File) => {
    setPhotoFile(file)
    const preview = URL.createObjectURL(file)
    setPhotoPreview(preview)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setIsSaving(true)
    setError(null)

    try {
      let photoUrl: string | null = null

      if (photoFile) {
        setIsUploading(true)
        photoUrl = await uploadPlacePhoto(photoFile)
        setIsUploading(false)
      }

      const newPlace: NewPlace = {
        name: name.trim(),
        category,
        memo: memo.trim() || null,
        rating,
        photo_url: photoUrl,
        lat,
        lng,
      }

      const saved = await addPlace(newPlace)
      onSave(saved)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
      setIsUploading(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <h3 className="text-base font-medium text-gray-500">
        📍 {lat.toFixed(5)}, {lng.toFixed(5)}
      </h3>

      {/* 이름 입력 */}
      <input
        type="text"
        placeholder="장소 이름을 입력하세요"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* 카테고리 선택 */}
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              category === cat
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 메모 */}
      <textarea
        placeholder="메모나 일기를 남겨보세요 (선택)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />

      {/* 별점 */}
      <div>
        <p className="text-sm text-gray-500 mb-1">별점 (선택)</p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* 사진 첨부 */}
      <PhotoUpload
        onUpload={handlePhotoUpload}
        isUploading={isUploading}
        previewUrl={photoPreview}
      />

      {/* 에러 메시지 */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* 버튼 영역 */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim() || isSaving}
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
