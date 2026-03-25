'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
} from 'lucide-react'
import type { Section } from '@/types'
import { updateSection, deleteSection } from '@/lib/api/sections'
import { useAppStore } from '@/store/tasks'
import clsx from 'clsx'

interface SectionItemProps {
  section: Section
  tasks: any[]
  onTaskClick?: (task: any) => void
  onRefresh?: () => void
  defaultExpanded?: boolean
}

export function SectionItem({
  section,
  tasks,
  onTaskClick,
  onRefresh,
  defaultExpanded = true,
}: SectionItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showMenu, setShowMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(section.name)
  const { updateSection: updateSectionInStore, removeSection } = useAppStore()

  const incompleteTasks = tasks.filter((t) => !t.is_completed)
  const completedTasks = tasks.filter((t) => t.is_completed)

  const handleRename = async () => {
    if (!name.trim() || name === section.name) {
      setEditing(false)
      return
    }
    const { data } = await updateSection(section.id, { name: name.trim() })
    if (data) {
      updateSectionInStore(section.id, { name: data.name })
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (confirm(`Delete section "${section.name}"? Tasks will be moved to project root.`)) {
      await deleteSection(section.id)
      removeSection(section.id, section.project_id)
      setShowMenu(false)
      onRefresh?.()
    }
  }

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 group mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 cursor-pointer" />

        {editing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setName(section.name)
                setEditing(false)
              }
            }}
            className="flex-1 px-2 py-1 text-sm font-semibold text-gray-900 bg-white border border-violet-300 rounded outline-none"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-gray-700 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            {section.name}
          </span>
        )}

        <span className="text-xs text-gray-400">{incompleteTasks.length}</span>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1 min-w-36 animate-fadeIn">
              <button
                onClick={() => {
                  setEditing(true)
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      {expanded && (
        <div className="space-y-1">
          {incompleteTasks.map((task) => (
            <div key={task.id} className="ml-4">
              {/* Task rendering would go here - imported from TaskItem */}
            </div>
          ))}
          {incompleteTasks.length === 0 && (
            <p className="ml-8 text-xs text-gray-400 py-2">No tasks in this section</p>
          )}
          {completedTasks.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                Completed ({completedTasks.length})
              </summary>
              <div className="mt-1 space-y-1">
                {completedTasks.map((task) => (
                  <div key={task.id} className="ml-4 opacity-50">
                    {/* Completed task rendering */}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
