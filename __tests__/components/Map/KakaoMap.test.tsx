/**
 * KakaoMap 컴포넌트 테스트
 * Kakao SDK는 브라우저 전용이므로 mock 처리
 */
import { render, screen } from '@testing-library/react'

// window.kakao mock
const mockMap = {
  addOverlayMapTypeId: jest.fn(),
  setCenter: jest.fn(),
}
const mockLatLng = jest.fn().mockImplementation((lat, lng) => ({ lat, lng }))
const mockMarker = jest.fn().mockImplementation(() => ({
  setMap: jest.fn(),
}))

Object.defineProperty(window, 'kakao', {
  value: {
    maps: {
      Map: jest.fn().mockImplementation(() => mockMap),
      LatLng: mockLatLng,
      Marker: mockMarker,
      // load()는 콜백을 즉시 실행하여 지도 초기화 시뮬레이션
      load: jest.fn().mockImplementation((cb: () => void) => cb()),
      event: { addListener: jest.fn() },
    },
  },
  writable: true,
})

// next/script mock
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ onLoad }: { onLoad?: () => void }) => {
    // onLoad를 즉시 호출하여 SDK 로드 시뮬레이션
    if (onLoad) onLoad()
    return null
  },
}))

import KakaoMap from '@/components/Map/KakaoMap'
import { Place } from '@/types/place'

describe('KakaoMap', () => {
  const mockOnMapClick = jest.fn()
  const mockPlaces: Place[] = []

  it('로딩 스피너를 초기에 렌더링한다', () => {
    render(
      <KakaoMap
        places={mockPlaces}
        onMapClick={mockOnMapClick}
        onMarkerClick={jest.fn()}
      />
    )
    // SDK 로드 전까지 스피너 표시
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('지도 컨테이너 div가 렌더링된다', () => {
    render(
      <KakaoMap
        places={mockPlaces}
        onMapClick={mockOnMapClick}
        onMarkerClick={jest.fn()}
      />
    )
    expect(document.getElementById('kakao-map')).toBeInTheDocument()
  })
})
