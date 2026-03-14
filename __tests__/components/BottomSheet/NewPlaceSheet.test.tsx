import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewPlaceSheet from '@/components/BottomSheet/NewPlaceSheet'

// lib/places mock
jest.mock('@/lib/places', () => ({
  addPlace: jest.fn().mockResolvedValue({ id: '1', name: '테스트', lat: 0, lng: 0 }),
  uploadPlacePhoto: jest.fn().mockResolvedValue('https://example.com/photo.jpg'),
}))

// PhotoUpload mock (browser-image-compression 의존성 제거)
jest.mock('@/components/UI/PhotoUpload', () => ({
  __esModule: true,
  default: ({ onUpload }: { onUpload: (f: File) => void }) => (
    <button onClick={() => onUpload(new File([''], 'test.jpg', { type: 'image/jpeg' }))}>
      사진 첨부
    </button>
  ),
}))

const defaultProps = {
  lat: 37.5665,
  lng: 126.9780,
  onSave: jest.fn(),
  onClose: jest.fn(),
}

describe('NewPlaceSheet', () => {
  it('이름 입력 필드를 렌더링한다', () => {
    render(<NewPlaceSheet {...defaultProps} />)
    expect(screen.getByPlaceholderText(/장소 이름/i)).toBeInTheDocument()
  })

  it('이름이 비어있으면 저장 버튼이 비활성화된다', () => {
    render(<NewPlaceSheet {...defaultProps} />)
    const saveButton = screen.getByRole('button', { name: /저장/i })
    expect(saveButton).toBeDisabled()
  })

  it('이름 입력 후 저장 버튼이 활성화된다', () => {
    render(<NewPlaceSheet {...defaultProps} />)
    const nameInput = screen.getByPlaceholderText(/장소 이름/i)
    fireEvent.change(nameInput, { target: { value: '맛있는 식당' } })
    const saveButton = screen.getByRole('button', { name: /저장/i })
    expect(saveButton).not.toBeDisabled()
  })

  it('저장 성공 시 onSave 콜백이 호출된다', async () => {
    const mockOnSave = jest.fn()
    render(<NewPlaceSheet {...defaultProps} onSave={mockOnSave} />)

    fireEvent.change(screen.getByPlaceholderText(/장소 이름/i), {
      target: { value: '맛있는 식당' },
    })
    fireEvent.click(screen.getByRole('button', { name: /저장/i }))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    })
  })
})
