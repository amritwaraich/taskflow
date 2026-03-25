'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Calendar, Flag, Tag, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { parse as chronoParse } from 'chrono-node'
import { createTask } from '@/lib/api/tasks'
import { useAppStore } from '@/store/tasks'
import { PriorityPicker } from '@/components/ui/PriorityPicker'
import { DatePicker } from '@/components/ui/DatePicker'
import { LabelBadge } from '@/components/labels/LabelBadge'
import type { Label } from '@/types'

interface QuickAddModalProps {
  onClose: () => void
  onAdd?: () => void
}

export function QuickAddModal({ onClose, onAdd }: QuickAddModalProps) {
  const { user, labels, addTask, quickAddContext } = useAppStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [content, setContent] = useState('')
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [dueString, setDueString] = useState<string | null>(null)
  const [priority, setPriority] = useState<number>(4)
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeField, setActiveField] = useState<'content' | 'date' | 'priority' | 'labels'>('content')

  const contextProjectId = quickAddContext.projectId
  const contextSectionId = quickAddContext.sectionId

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    // Parse natural language input
    const parsed = chronoParse(content)
    if (parsed.length > 0) {
      const date = parsed[0].start.date()
      setDueDate(format(date, "yyyy-MM-dd'T'HH:mm"))
      setDueString(parsed[0].text)
    }

    // Parse priority
    const p1Match = content.match(/\bp1\b/i)
    const p2Match = content.match(/\bp2\b/i)
    const p3Match = content.match(/\bp3\b/i)
    const p4Match = content.match(/\bp4\b/i)
    if (p1Match) setPriority(1)
    else if (p2Match) setPriority(2)
    else if (p3Match) setPriority(3)
    else if (p4Match) setPriority(4)

    // Parse labels from #[name]
    const labelMatches = content.match(/#(\w+)/g)
    if (labelMatches) {
      const labelNames = labelMatches.map((m: string) => m.slice(1).toLowerCase())
      const matched = labels.filter((l) => labelNames.includes(l.name.toLowerCase()))
      setSelectedLabels(matched)
    }
  }, [content, labels])

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async () => {
    if (!content.trim() || !user) return

    setSaving(true)

    // Clean content by removing parsed parts
    let cleanContent = content.trim()
    cleanContent = cleanContent.replace(/\s*#[^\s#]+/g, '').trim()
    cleanContent = cleanContent.replace(/\s*p[1-4]\b/gi, '').trim()

    const { data } = await createTask({
      user_id: user.id,
      content: cleanContent,
      description: null,
      due_date: dueDate,
      due_string: dueString,
      priority: priority as 1 | 2 | 3 | 4,
      project_id: contextProjectId || null,
      section_id: contextSectionId || null,
      position: 0,
      layer: 1,
    })

    if (data) {
      addTask(contextProjectId || null, data)
      onAdd?.()
    }

    setSaving(false)
    onClose()
  }

  const toggleLabel = (label: Label) => {
    const exists = selectedLabels.find((l) => l.id === label.id)
    if (exists) {
      setSelectedLabels(selectedLabels.filter((l) => l.id !== label.id))
    } else {
      setSelectedLabels([...selectedLabels, label])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-24 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content input */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 mt-2 flex-shrink-0" />
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a task... (try: Buy groceries tomorrow at 5pm #shopping p1)"
              className="flex-1 text-lg text-gray-900 outline-none resize-none placeholder:text-gray-400"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
                if (e.key === 'Tab') {
                  e.preventDefault()
                  if (activeField === 'content') setActiveField('date')
                  else if (activeField === 'date') setActiveField('priority')
                  else if (activeField === 'priority') setActiveField('labels')
                }
              }}
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Parsed preview */}
        <div className="px-4 py-2 bg-violet-50 border-b border-violet-100 flex flex-wrap items-center gap-2">
          {dueDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-violet-100 text-violet-700 text-xs font-medium">
              <Calendar className="w-3 h-3" />
              {dueString || format(new Date(dueDate), 'MMM d')}
              {dueDate.includes('T') && (
                <span className="text-violet-500">
                  {format(new Date(dueDate), 'h:mm a')}
                </span>
              )}
            </span>
          )}
          {priority < 3 && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
              priority === 1 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <Flag className="w-3 h-3" />
              P{priority}
            </span>
          )}
          {selectedLabels.map((label) => (
            <LabelBadge key={label.id} label={label} size="sm" />
          ))}
        </div>

        {/* Quick fields */}
        <div className="p-4 space-y-4">
          {/* Date */}
          <div
            onClick={() => setActiveField('date')}
            className={`p-3 rounded-lg border transition ${
              activeField === 'date' ? 'border-violet-300 bg-violet-50' : 'border-gray-200'
            }`}
          >
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              <Calendar className="w-3 h-3 inline mr-1" />
              Due Date
            </label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              onDueStringChange={setDueString}
            />
          </div>

          {/* Priority */}
          <div
            onClick={() => setActiveField('priority')}
            className={`p-3 rounded-lg border transition ${
              activeField === 'priority' ? 'border-violet-300 bg-violet-50' : 'border-gray-200'
            }`}
          >
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              <Flag className="w-3 h-3 inline mr-1" />
              Priority
            </label>
            <PriorityPicker value={priority} onChange={setPriority} />
          </div>

          {/* Labels */}
          <div
            onClick={() => setActiveField('labels')}
            className={`p-3 rounded-lg border transition ${
              activeField === 'labels' ? 'border-violet-300 bg-violet-50' : 'border-gray-200'
            }`}
          >
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              <Tag className="w-3 h-3 inline mr-1" />
              Labels
            </label>
            <div className="relative">
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-violet-300 transition"
              >
                {selectedLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedLabels.map((label) => (
                      <LabelBadge key={label.id} label={label} size="sm" />
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Select labels...</span>
                )}
              </button>

              {showLabelPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-3 w-64 animate-fadeIn">
                  <div className="flex flex-wrap gap-1">
                    {labels.map((label) => {
                      const isSelected = selectedLabels.some((l) => l.id === label.id)
                      return (
                        <button
                          key={label.id}
                          onClick={() => toggleLabel(label)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                            isSelected ? 'ring-2 ring-violet-500' : ''
                          }`}
                          style={{
                            backgroundColor: `${label.color}20`,
                            color: label.color,
                          }}
                        >
                          {label.name}
                        </button>
                      )
                    })}
                  </div>
                  {labels.length === 0 && (
                    <p className="text-sm text-gray-500">No labels yet. Create labels in Settings.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">Enter</kbd> to add,{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">Tab</kbd> to navigate fields,{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">Esc</kbd> to close
          </p>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || saving}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}
