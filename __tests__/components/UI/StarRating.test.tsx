import { render, screen, fireEvent } from '@testing-library/react'
import StarRating from '@/components/UI/StarRating'

describe('StarRating', () => {
  it('별 5개를 렌더링한다', () => {
    render(<StarRating value={null} onChange={jest.fn()} />)
    const stars = screen.getAllByRole('button')
    expect(stars).toHaveLength(5)
  })

  it('value가 3이면 3번째 별까지 채워진다', () => {
    render(<StarRating value={3} onChange={jest.fn()} />)
    const stars = screen.getAllByRole('button')
    expect(stars[0]).toHaveAttribute('data-filled', 'true')
    expect(stars[2]).toHaveAttribute('data-filled', 'true')
    expect(stars[3]).toHaveAttribute('data-filled', 'false')
  })

  it('별 클릭 시 onChange가 해당 값으로 호출된다', () => {
    const mockOnChange = jest.fn()
    render(<StarRating value={null} onChange={mockOnChange} />)
    const stars = screen.getAllByRole('button')
    fireEvent.click(stars[3])  // 4번째 별 (index 3 = rating 4)
    expect(mockOnChange).toHaveBeenCalledWith(4)
  })

  it('이미 선택된 별을 다시 클릭하면 null(미선택)로 변경된다', () => {
    const mockOnChange = jest.fn()
    render(<StarRating value={4} onChange={mockOnChange} />)
    const stars = screen.getAllByRole('button')
    fireEvent.click(stars[3])  // 이미 선택된 4번째 별 클릭
    expect(mockOnChange).toHaveBeenCalledWith(null)
  })
})
