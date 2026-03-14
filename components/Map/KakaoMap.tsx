'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { Place } from '@/types/place'
import PlaceMarker from './PlaceMarker'

// Kakao Maps SDK 전역 타입 선언
declare global {
  interface Window {
    kakao: any
  }
}

interface KakaoMapProps {
  places: Place[]
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (place: Place) => void
  disabled?: boolean  // 바텀 시트 열린 상태에서 지도 탭 비활성화
}

export default function KakaoMap({
  places,
  onMapClick,
  onMarkerClick,
  disabled = false,
}: KakaoMapProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // SDK 로드 완료 후 지도 초기화
  const handleScriptLoad = () => {
    if (typeof window === 'undefined' || !window.kakao) return

    window.kakao.maps.load(() => {
      if (!mapContainerRef.current) return

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 기본 중심
        level: 3,
      }

      const map = new window.kakao.maps.Map(mapContainerRef.current, options)
      mapRef.current = map

      // 지도 클릭 이벤트: 빈 공간 탭 시 핀 꽂기
      window.kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
        if (disabled) return
        const latlng = mouseEvent.latLng
        onMapClick(latlng.getLat(), latlng.getLng())
      })

      setIsLoaded(true)
    })
  }

  // places 변경 시 마커 재렌더링
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return
    // PlaceMarker 컴포넌트에서 처리 (useEffect 내 Kakao Marker 생성)
  }, [places, isLoaded])

  return (
    <div className="relative w-full h-full">
      {/* Kakao Map SDK 스크립트 로드 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {/* 지도 컨테이너 */}
      <div
        id="kakao-map"
        ref={mapContainerRef}
        className="w-full h-full"
      />

      {/* 로딩 스피너 (SDK 로드 전) */}
      {!isLoaded && (
        <div
          role="status"
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
        >
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">지도 로딩 중...</span>
        </div>
      )}

      {/* 장소 마커들 */}
      {isLoaded && mapRef.current && places.map((place) => (
        <PlaceMarker
          key={place.id}
          place={place}
          map={mapRef.current}
          onClick={() => onMarkerClick(place)}
        />
      ))}
    </div>
  )
}
