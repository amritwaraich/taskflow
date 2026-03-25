'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Flag,
  Tag,
  Trash2,
  Plus,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import type { Task, Label } from '@/types'
import { format } from 'date-fns'
import { DatePicker } from '@/components/ui/DatePicker'
import { PriorityPicker, getPriorityColor } from '@/components/ui/PriorityPicker'
import { LabelBadge } from '@/components/labels/LabelBadge'
import { useAppStore } from '@/store/tasks'
import { updateTask, deleteTask, assignLabels } from '@/lib/api/tasks'

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onUpdate?: () => void
}

export function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
  const { user, labels: allLabels, updateTask: updateTaskInStore, removeTask } = useAppStore()

  const [content, setContent] = useState(task.content)
  const [description, setDescription] = useState(task.description || '')
  const [dueDate, setDueDate] = useState(task.due_date || null)
  const [dueString, setDueString] = useState(task.due_string || null)
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(task.priority || 4)
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(
    task.labels?.map((tl) => tl.label).filter(Boolean) || []
  )
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const priorityColors = getPriorityColor(priority)

  const handleSave = async () => {
    if (!content.trim() || !user) return

    setSaving(true)
    const { data } = await updateTask(task.id, {
      content: content.trim(),
      description: description.trim() || null,
      due_date: dueDate,
      due_string: dueString,
      priority,
    })

    if (data) {
      updateTaskInStore(task.id, data, task.project_id)
      await assignLabels(task.id, selectedLabels.map((l) => l.id))
      onUpdate?.()
    }
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      await deleteTask(task.id)
      removeTask(task.id, task.project_id)
      onUpdate?.()
      onClose()
    }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Task content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-lg font-medium text-gray-900 outline-none resize-none placeholder:text-gray-400"
              rows={2}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description (markdown supported)..."
              className="w-full text-sm text-gray-600 outline-none resize-none placeholder:text-gray-400 bg-gray-50 rounded-lg p-3 border border-gray-200 focus:border-violet-300"
              rows={4}
            />
          </div>

          {/* Due date */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              Due Date
            </label>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              onDueStringChange={setDueString}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              Priority
            </label>
            <PriorityPicker value={priority} onChange={(p: number) => setPriority(p as 1 | 2 | 3 | 4)} />
          </div>

          {/* Labels */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
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
                  <span className="text-gray-500 text-sm">Add labels...</span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showLabelPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-3 w-64 animate-fadeIn">
                  <div className="flex flex-wrap gap-1">
                    {allLabels.map((label) => {
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
                  {allLabels.length === 0 && (
                    <p className="text-sm text-gray-500">No labels yet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Task info */}
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            <p>Layer: {task.layer === 1 ? 'Task' : task.layer === 2 ? 'Subtask' : 'Sub-subtask'}</p>
            <p>Created: {format(new Date(task.created_at), 'MMM d, yyyy h:mm a')}</p>
            {task.project && <p>Project: {task.project.icon} {task.project.name}</p>}
            {task.section && <p>Section: {task.section.name}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
