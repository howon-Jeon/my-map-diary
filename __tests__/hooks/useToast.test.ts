import { renderHook, act } from '@testing-library/react'
import useToast from '@/hooks/useToast'

describe('useToast', () => {
  it('초기 상태는 toasts가 빈 배열이다', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toasts).toHaveLength(0)
  })

  it('showToast 호출 시 toast가 추가된다', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('테스트 메시지', 'error')
    })
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('테스트 메시지')
    expect(result.current.toasts[0].type).toBe('error')
  })

  it('dismissToast 호출 시 해당 toast가 제거된다', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('메시지', 'error')
    })
    const id = result.current.toasts[0].id
    act(() => {
      result.current.dismissToast(id)
    })
    expect(result.current.toasts).toHaveLength(0)
  })
})
