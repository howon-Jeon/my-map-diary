'use client'

interface StarRatingProps {
  value: number | null  // 1~5, null = 미선택
  onChange: (rating: number | null) => void
  readonly?: boolean
}

export default function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  return (
    <div className="flex gap-1" role={readonly ? undefined : 'group'} aria-label="별점">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = value !== null && value >= star
        return (
          <button
            key={star}
            type="button"
            role="button"
            data-filled={String(isFilled)}
            aria-label={`별점 ${star}점`}
            disabled={readonly}
            onClick={() => {
              if (readonly) return
              // 이미 선택된 별 클릭 시 해제
              onChange(value === star ? null : star)
            }}
            className={`text-2xl transition-colors ${
              isFilled ? 'text-yellow-400' : 'text-gray-300'
            } ${readonly ? 'cursor-default' : 'hover:text-yellow-300'}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
