import { render, screen, fireEvent } from '@testing-library/react'
import BottomSheet from '@/components/BottomSheet/BottomSheet'

describe('BottomSheet', () => {
  it('isOpen이 false면 렌더링되지 않는다', () => {
    render(
      <BottomSheet isOpen={false} onClose={jest.fn()}>
        <p>내용</p>
      </BottomSheet>
    )
    expect(screen.queryByText('내용')).not.toBeInTheDocument()
  })

  it('isOpen이 true면 children을 렌더링한다', () => {
    render(
      <BottomSheet isOpen={true} onClose={jest.fn()}>
        <p>내용</p>
      </BottomSheet>
    )
    expect(screen.getByText('내용')).toBeInTheDocument()
  })

  it('배경(overlay) 탭 시 onClose가 호출된다', () => {
    const mockOnClose = jest.fn()
    render(
      <BottomSheet isOpen={true} onClose={mockOnClose}>
        <p>내용</p>
      </BottomSheet>
    )
    const overlay = screen.getByTestId('bottom-sheet-overlay')
    fireEvent.click(overlay)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
