'use client'

import { X } from 'lucide-react'
import type { Label } from '@/types'

interface LabelBadgeProps {
  label: Label
  onRemove?: () => void
  onClick?: () => void
  selected?: boolean
  size?: 'sm' | 'md'
}

export function LabelBadge({ label, onRemove, onClick, selected = false, size = 'sm' }: LabelBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-medium transition ${
        sizeClasses
      } ${
        selected
          ? 'ring-2 ring-violet-500'
          : ''
      } ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        backgroundColor: `${label.color}20`,
        color: label.color,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: label.color }}
      />
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:opacity-70"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

interface LabelDotProps {
  color: string
}

export function LabelDot({ color }: LabelDotProps) {
  return (
    <span
      className="w-2 h-2 rounded-full inline-block"
      style={{ backgroundColor: color }}
    />
  )
}
