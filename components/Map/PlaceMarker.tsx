'use client'

import { useEffect, useRef } from 'react'
import { Place, PlaceCategory } from '@/types/place'

// 카테고리별 마커 색상
const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  '맛집': '#EF4444',  // red
  '카페': '#8B5CF6',  // purple
  '산책': '#10B981',  // green
  '기타': '#F59E0B',  // amber
}

interface PlaceMarkerProps {
  place: Place
  map: any
  onClick: () => void
}

export default function PlaceMarker({ place, map, onClick }: PlaceMarkerProps) {
  const overlayRef = useRef<any>(null)

  useEffect(() => {
    if (!window.kakao || !map) return

    const position = new window.kakao.maps.LatLng(place.lat, place.lng)
    const color = CATEGORY_COLORS[place.category]

    // ✅ document.createElement 사용: 문자열 대신 DOM 엘리먼트를 content로 넘겨야
    //    el.addEventListener('click', ...) 가 정상 동작함
    const el = document.createElement('div')
    el.style.cssText = `
      width: 28px;
      height: 28px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `
    el.addEventListener('click', onClick)

    const overlay = new window.kakao.maps.CustomOverlay({
      position,
      content: el,
      yAnchor: 0.5,
      xAnchor: 0.5,
    })

    overlay.setMap(map)
    overlayRef.current = overlay

    // 언마운트 시 오버레이 제거
    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null)
        overlayRef.current = null
      }
      el.removeEventListener('click', onClick)
    }
  }, [place, map, onClick])

  // PlaceMarker는 Kakao SDK 오버레이로 직접 DOM에 렌더링되므로 null 반환
  return null
}
