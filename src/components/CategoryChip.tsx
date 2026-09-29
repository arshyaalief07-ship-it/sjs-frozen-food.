import { Link } from 'react-router-dom'
import { Category } from '@/types'

const CATEGORY_EMOJI: Record<string, string> = {
  nugget: '🍗',
  sosis: '🌭',
  bakso: '🍡',
  seafood: '🦐',
  kentang: '🍟',
  snack: '🥟',
  'frozen-food-lainnya': '🧊',
}

export default function CategoryChip({
  category,
  active,
  onClick,
  to,
}: {
  category: Category
  active?: boolean
  onClick?: () => void
  to?: string
}) {
  const emoji = CATEGORY_EMOJI[category.slug] ?? '🧊'
  const className = `reveal flex shrink-0 flex-col items-center gap-2 rounded-2xl border px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
    active ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-card' : 'border-slate-100 bg-white text-slate-600'
  }`
  const content = (
    <>
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
      <span className="text-sm font-semibold">{category.name}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={className}>
      {content}
    </button>
  )
}
