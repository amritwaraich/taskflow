'use client'

interface PriorityPickerProps {
  value: number
  onChange: (priority: number) => void
  compact?: boolean
}

const priorities = [
  { value: 1, label: 'P1', color: 'bg-red-500', textColor: 'text-red-600', bgHover: 'hover:bg-red-50', border: 'border-red-200' },
  { value: 2, label: 'P2', color: 'bg-amber-500', textColor: 'text-amber-600', bgHover: 'hover:bg-amber-50', border: 'border-amber-200' },
  { value: 3, label: 'P3', color: 'bg-blue-500', textColor: 'text-blue-600', bgHover: 'hover:bg-blue-50', border: 'border-blue-200' },
  { value: 4, label: 'P4', color: 'bg-gray-400', textColor: 'text-gray-500', bgHover: 'hover:bg-gray-50', border: 'border-gray-200' },
]

export function PriorityPicker({ value, onChange, compact = false }: PriorityPickerProps) {
  const selected = priorities.find(p => p.value === value) || priorities[3]

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {priorities.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`w-5 h-5 rounded-full ${p.value === value ? p.color : 'bg-gray-100'} ${
              p.value !== value ? 'hover:bg-gray-200' : ''
            } transition flex items-center justify-center`}
            title={`Priority ${p.value}`}
          >
            <span className="text-white text-[8px] font-bold">{p.label}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {priorities.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
            p.value === value
              ? `${p.bgHover} ${p.border} ${p.textColor}`
              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${p.color}`} />
          <span className="text-sm font-medium">{p.label}</span>
        </button>
      ))}
    </div>
  )
}

export function getPriorityColor(priority: number) {
  switch (priority) {
    case 1: return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' }
    case 2: return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' }
    case 3: return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' }
    default: return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-400' }
  }
}

export function getPriorityLabel(priority: number) {
  switch (priority) {
    case 1: return 'Urgent'
    case 2: return 'High'
    case 3: return 'Normal'
    default: return 'Low'
  }
}
