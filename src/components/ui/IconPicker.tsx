'use client'

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

const icons = [
  '📁', '📌', '🎯', '💡', '🔥', '⭐', '🌟', '✨',
  '💪', '🚀', '🎨', '🎵', '🎬', '📚', '💻', '🌐',
  '🏠', '🏢', '✈️', '🚗', '🛒', '💰', '🏥', '🎓',
  '⚽', '🎮', '📷', '🎁', '🌺', '🍀', '🌙', '☀️',
  '❤️', '💜', '💙', '💚', '🧡', '🩷', '🩵', '🤍',
  '🐱', '🐶', '🦊', '🐸', '🦄', '🐼', '🐨', '🦁',
]

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {icons.map((icon) => (
        <button
          key={icon}
          onClick={() => onChange(icon)}
          className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition ${
            value === icon
              ? 'bg-violet-100 ring-2 ring-violet-500'
              : 'hover:bg-gray-100'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
