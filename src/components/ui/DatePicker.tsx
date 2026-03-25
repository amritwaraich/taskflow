'use client'

import { useState, useRef, useEffect } from 'react'
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday,
  isTomorrow,
  isThisWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns'
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  onDueStringChange?: (dueString: string | null) => void
}

const quickOptions = [
  { label: 'Today', getDate: () => format(new Date(), "yyyy-MM-dd'T'HH:mm") },
  { label: 'Tomorrow', getDate: () => format(addDays(new Date(), 1), "yyyy-MM-dd'T'09:00") },
  { label: 'Next Week', getDate: () => format(addDays(new Date(), 7), "yyyy-MM-dd'T'09:00") },
  { label: 'No Date', getDate: () => null },
]

export function DatePicker({ value, onChange, onDueStringChange }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [time, setTime] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      setTime(format(new Date(value), 'HH:mm'))
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateSelect = (date: Date) => {
    const baseDate = format(date, 'yyyy-MM-dd')
    const dateTime = time ? `${baseDate}T${time}` : `${baseDate}T09:00`
    onChange(dateTime)
    onDueStringChange?.(format(date, 'MMM d'))
    setOpen(false)
  }

  const handleQuickOption = (getDate: () => string | null) => {
    const date = getDate()
    onChange(date)
    if (date) {
      onDueStringChange?.(format(new Date(date), 'MMM d'))
    } else {
      onDueStringChange?.(null)
    }
    setOpen(false)
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (value) {
      const baseDate = format(new Date(value), 'yyyy-MM-dd')
      const dateTime = `${baseDate}T${newTime}`
      onChange(dateTime)
    }
  }

  const clearDate = () => {
    onChange(null)
    onDueStringChange?.(null)
    setTime('')
    setOpen(false)
  }

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const formatDisplay = () => {
    if (!value) return null
    const date = new Date(value)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const getTimeDisplay = () => {
    if (!value) return null
    return format(new Date(value), 'h:mm a')
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition ${
            value
              ? 'border-violet-200 bg-violet-50 text-violet-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          {formatDisplay() || 'Set Date'}
          {getTimeDisplay() && (
            <span className="text-violet-500">{getTimeDisplay()}</span>
          )}
        </button>
        {value && (
          <button
            onClick={clearDate}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-4 w-80 animate-fadeIn">
          {/* Quick options */}
          <div className="flex gap-2 mb-4 pb-4 border-b border-gray-100">
            {quickOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleQuickOption(opt.getDate)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setViewDate(addDays(viewDate, -30))}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-900">
                {format(viewDate, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setViewDate(addDays(viewDate, 30))}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
              {days.map((day) => {
                const isSelected = value && isSameDay(day, new Date(value))
                const isCurrentMonth = day.getMonth() === viewDate.getMonth()
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateSelect(day)}
                    className={`w-9 h-9 rounded-lg text-sm transition ${
                      isSelected
                        ? 'bg-violet-600 text-white'
                        : isCurrentMonth
                        ? 'text-gray-900 hover:bg-gray-100'
                        : 'text-gray-300'
                    } ${isToday(day) && !isSelected ? 'ring-1 ring-violet-300' : ''}`}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
