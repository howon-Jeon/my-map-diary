import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PlaceDetailSheet from '@/components/BottomSheet/PlaceDetailSheet'
import { Place } from '@/types/place'

jest.mock('@/lib/places', () => ({
  updatePlace: jest.fn().mockResolvedValue({
    id: 'test-id', name: '수정된 맛집', category: '맛집',
    memo: '맛있었다', rating: 4, photo_url: null,
    lat: 37.5665, lng: 126.9780,
    created_at: '2026-03-14T00:00:00Z', updated_at: '2026-03-14T00:00:00Z',
  }),
  deletePlace: jest.fn().mockResolvedValue(undefined),
}))

// next/image mock
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const mockPlace: Place = {
  id: 'test-id',
  name: '테스트 맛집',
  category: '맛집',
  memo: '맛있었다',
  rating: 4,
  photo_url: null,
  lat: 37.5665,
  lng: 126.9780,
  created_at: '2026-03-14T00:00:00Z',
  updated_at: '2026-03-14T00:00:00Z',
}

describe('PlaceDetailSheet', () => {
  it('장소 이름을 렌더링한다', () => {
    render(
      <PlaceDetailSheet
        place={mockPlace}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    )
    expect(screen.getByText('테스트 맛집')).toBeInTheDocument()
  })

  it('수정 버튼 클릭 시 편집 모드로 전환된다', () => {
    render(
      <PlaceDetailSheet
        place={mockPlace}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /수정/i }))
    expect(screen.getByDisplayValue('테스트 맛집')).toBeInTheDocument()
  })

  it('편집 모드에서 저장 시 onUpdate 호출', async () => {
    const mockOnUpdate = jest.fn()
    render(
      <PlaceDetailSheet
        place={mockPlace}
        onUpdate={mockOnUpdate}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /수정/i }))
    fireEvent.change(screen.getByDisplayValue('테스트 맛집'), {
      target: { value: '수정된 맛집' },
    })
    fireEvent.click(screen.getByRole('button', { name: /저장/i }))

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled()
    })
  })

  it('삭제 버튼 클릭 시 확인 후 onDelete 호출', async () => {
    const mockOnDelete = jest.fn()
    window.confirm = jest.fn().mockReturnValue(true)

    render(
      <PlaceDetailSheet
        place={mockPlace}
        onUpdate={jest.fn()}
        onDelete={mockOnDelete}
        onClose={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /삭제/i }))

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('test-id')
    })
  })
})
