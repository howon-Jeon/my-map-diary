'use client'

import { Place } from '@/types/place'

interface PlaceListSheetProps {
  places: Place[]
  onSelectPlace: (place: Place) => void
}

const CATEGORY_EMOJI: Record<string, string> = {
  '맛집': '🍽️',
  '카페': '☕',
  '산책': '🌿',
  '기타': '📌',
}

export default function PlaceListSheet({ places, onSelectPlace }: PlaceListSheetProps) {
  if (places.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p className="text-4xl mb-3">🗺️</p>
        <p>저장된 장소가 없습니다.</p>
        <p className="text-sm mt-1">지도를 탭해서 첫 장소를 기록해보세요!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 py-4">
      <p className="text-sm text-gray-400">총 {places.length}곳</p>
      {places.map((place) => (
        <button
          key={place.id}
          type="button"
          onClick={() => onSelectPlace(place)}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-left hover:bg-blue-50 transition-colors"
        >
          <span className="text-2xl">{CATEGORY_EMOJI[place.category] ?? '📌'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{place.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {place.category}
              {place.rating ? ` · ${'★'.repeat(place.rating)}` : ''}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
