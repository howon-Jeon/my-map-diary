'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Place, PlaceCategory } from '@/types/place'
import { deletePlace, updatePlace } from '@/lib/places'
import StarRating from '@/components/UI/StarRating'

const CATEGORIES: PlaceCategory[] = ['맛집', '카페', '산책', '기타']

interface PlaceDetailSheetProps {
  place: Place
  onUpdate: (place: Place) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function PlaceDetailSheet({ place, onUpdate, onDelete, onClose }: PlaceDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(place.name)
  const [editCategory, setEditCategory] = useState<PlaceCategory>(place.category)
  const [editMemo, setEditMemo] = useState(place.memo ?? '')
  const [editRating, setEditRating] = useState<number | null>(place.rating)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSaveEdit = async () => {
    if (!editName.trim()) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await updatePlace(place.id, {
        name: editName.trim(),
        category: editCategory,
        memo: editMemo.trim() || null,
        rating: editRating,
      })
      onUpdate(updated)
      setIsEditing(false)
    } catch {
      setError('수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`"${place.name}"을 삭제할까요?`)) return
    setIsDeleting(true)
    setError(null)
    try {
      await deletePlace(place.id)
      onDelete(place.id)
    } catch {
      setError('삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

  // 편집 모드
  if (isEditing) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setEditCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                editCategory === cat
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <textarea
          value={editMemo}
          onChange={(e) => setEditMemo(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        <StarRating value={editRating} onChange={setEditRating} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={!editName.trim() || isSaving}
            aria-label="저장"
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    )
  }

  // 상세 보기 모드
  return (
    <div className="flex flex-col gap-4 py-4">
      {place.photo_url && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden">
          <Image src={place.photo_url} alt={place.name} fill className="object-cover" />
        </div>
      )}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {place.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(place.created_at)}</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{place.name}</h2>
      </div>
      {place.rating && (
        <StarRating value={place.rating} onChange={() => {}} readonly />
      )}
      {place.memo && (
        <p className="text-gray-600 leading-relaxed">{place.memo}</p>
      )}
      <p className="text-xs text-gray-400">
        📍 {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="삭제"
          className="flex-1 py-3 border border-red-300 text-red-500 rounded-xl disabled:opacity-50"
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="수정"
          className="flex-1 py-3 border border-blue-300 text-blue-500 rounded-xl"
        >
          수정
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
