'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import type { Section, Task } from '@/types'
import { createSection } from '@/lib/api/sections'
import { SectionItem } from './SectionItem'
import { useAppStore } from '@/store/tasks'
import { TaskItem } from '@/components/tasks/TaskItem'

interface SectionListProps {
  projectId: string
  tasks: Task[]
  sections: Section[]
  onTaskClick?: (task: Task) => void
  onRefresh?: () => void
}

export function SectionList({
  projectId,
  tasks,
  sections,
  onTaskClick,
  onRefresh,
}: SectionListProps) {
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [adding, setAdding] = useState(false)
  const { addSection } = useAppStore()

  // Tasks without a section
  const rootTasks = tasks.filter((t) => !t.section_id && !t.parent_id)

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionName.trim()) return

    setAdding(true)
    const { data } = await createSection({
      project_id: projectId,
      name: newSectionName.trim(),
    })
    if (data) {
      addSection(data)
      setNewSectionName('')
      setShowAddSection(false)
      onRefresh?.()
    }
    setAdding(false)
  }

  return (
    <div>
      {/* Sectionless tasks (project root) */}
      {rootTasks.length > 0 && (
        <div className="mb-6">
          {rootTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              depth={0}
              onUpdate={onRefresh}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => {
        const sectionTasks = tasks.filter(
          (t) => t.section_id === section.id && !t.parent_id
        )
        return (
          <SectionItem
            key={section.id}
            section={section}
            tasks={sectionTasks}
            onTaskClick={onTaskClick}
            onRefresh={onRefresh}
          />
        )
      })}

      {/* Add section */}
      {showAddSection ? (
        <form onSubmit={handleAddSection} className="mt-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Section name..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowAddSection(false)
                  setNewSectionName('')
                }
              }}
            />
            {adding ? (
              <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
            ) : (
              <button
                type="submit"
                disabled={!newSectionName.trim()}
                className="px-3 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition"
              >
                Add
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowAddSection(false)
                setNewSectionName('')
              }}
              className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddSection(true)}
          className="flex items-center gap-2 mt-4 px-3 py-2 text-sm text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add section
        </button>
      )}
    </div>
  )
}
