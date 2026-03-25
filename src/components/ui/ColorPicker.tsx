'use client'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

const colors = [
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Red', value: '#E03E3E' },
  { name: 'Orange', value: '#D5800A' },
  { name: 'Yellow', value: '#F5A623' },
  { name: 'Green', value: '#26A65B' },
  { name: 'Teal', value: '#16A34A' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Indigo', value: '#4B47D4' },
  { name: 'Purple', value: '#9B59B6' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Gray', value: '#6B7280' },
]

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => onChange(color.value)}
          className={`w-8 h-8 rounded-lg transition-transform ${
            value === color.value ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : 'hover:scale-105'
          }`}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  )
}

export function ColorDot({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' }
  return <span className={`${sizes[size]} rounded-full inline-block`} style={{ backgroundColor: color }} />
}

export function LabelDot({ color }: { color: string }) {
  return <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
}
