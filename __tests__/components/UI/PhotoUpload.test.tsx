import { render, screen } from '@testing-library/react'
import PhotoUpload from '@/components/UI/PhotoUpload'

// next/image mock
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

// browser-image-compression mock
jest.mock('browser-image-compression', () => jest.fn())

describe('PhotoUpload', () => {
  it('사진 첨부 버튼을 렌더링한다', () => {
    render(<PhotoUpload onUpload={jest.fn()} isUploading={false} />)
    expect(screen.getByText(/사진 첨부/i)).toBeInTheDocument()
  })

  it('isUploading이 true면 로딩 표시를 보여준다', () => {
    render(<PhotoUpload onUpload={jest.fn()} isUploading={true} />)
    expect(screen.getByText(/업로드 중/i)).toBeInTheDocument()
  })

  it('previewUrl이 있으면 미리보기 이미지를 렌더링한다', () => {
    render(
      <PhotoUpload
        onUpload={jest.fn()}
        isUploading={false}
        previewUrl="https://example.com/photo.jpg"
      />
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', expect.stringContaining('photo.jpg'))
  })
})
