'use client'

import { useState, useEffect, useCallback } from 'react'
import KakaoMap from '@/components/Map/KakaoMap'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import NewPlaceSheet from '@/components/BottomSheet/NewPlaceSheet'
import PlaceDetailSheet from '@/components/BottomSheet/PlaceDetailSheet'
import PlaceListSheet from '@/components/BottomSheet/PlaceListSheet'
import ToastContainer from '@/components/UI/Toast'
import useToast from '@/hooks/useToast'
import { getPlaces } from '@/lib/places'
import { Place, BottomSheetType } from '@/types/place'

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null)
  const { toasts, showToast, dismissToast } = useToast()
  const [pendingCoord, setPendingCoord] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  // 초기 데이터 로드
  useEffect(() => {
    getPlaces()
      .then(setPlaces)
      .catch(() => {
        showToast('인터넷 연결을 확인해주세요.', 'error')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPendingCoord({ lat, lng })
    setActiveSheet('new')
  }, [])

  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedPlace(place)
    setActiveSheet('detail')
  }, [])

  const handlePlaceSaved = useCallback((newPlace: Place) => {
    setPlaces((prev) => [newPlace, ...prev])
    setActiveSheet(null)
    setPendingCoord(null)
  }, [])

  const handlePlaceDeleted = useCallback((id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id))
    setActiveSheet(null)
    setSelectedPlace(null)
  }, [])

  const handlePlaceUpdated = useCallback((updated: Place) => {
    setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setSelectedPlace(updated)
  }, [])

  const handleClose = useCallback(() => {
    setActiveSheet(null)
    setPendingCoord(null)
    setSelectedPlace(null)
  }, [])

  const handleSelectFromList = useCallback((place: Place) => {
    setSelectedPlace(place)
    setActiveSheet('detail')
  }, [])

  const isSheetOpen = activeSheet !== null

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* 토스트 알림 */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* 지도 전체화면 */}
      <KakaoMap
        places={places}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        disabled={isSheetOpen}
      />

      {/* 우하단 FAB: 내 장소 목록 */}
      <button
        type="button"
        aria-label="내 장소 목록"
        onClick={() => setActiveSheet('list')}
        className="fixed bottom-6 right-4 z-30 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-50 transition-colors"
      >
        🗺️
      </button>

      {/* 바텀 시트: 새 장소 등록 */}
      <BottomSheet isOpen={activeSheet === 'new'} onClose={handleClose} title="새 장소 등록">
        {pendingCoord && (
          <NewPlaceSheet
            lat={pendingCoord.lat}
            lng={pendingCoord.lng}
            onSave={handlePlaceSaved}
            onClose={handleClose}
          />
        )}
      </BottomSheet>

      {/* 바텀 시트: 장소 상세 */}
      <BottomSheet isOpen={activeSheet === 'detail'} onClose={handleClose} title="장소 정보">
        {selectedPlace && (
          <PlaceDetailSheet
            place={selectedPlace}
            onUpdate={handlePlaceUpdated}
            onDelete={handlePlaceDeleted}
            onClose={handleClose}
          />
        )}
      </BottomSheet>

      {/* 바텀 시트: 내 장소 목록 */}
      <BottomSheet isOpen={activeSheet === 'list'} onClose={handleClose} title="내 장소 목록">
        <PlaceListSheet places={places} onSelectPlace={handleSelectFromList} />
      </BottomSheet>
    </main>
  )
}
