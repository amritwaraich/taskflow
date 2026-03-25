'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Plus,
  MoreHorizontal,
  Edit2,
  Archive,
  Trash2,
} from 'lucide-react'
import { useAppStore } from '@/store/tasks'
import { getProject } from '@/lib/api/projects'
import { getTasks } from '@/lib/api/tasks'
import { SectionList } from '@/components/sections/SectionList'
import { TaskItem } from '@/components/tasks/TaskItem'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { QuickAddModal } from '@/components/tasks/QuickAddModal'
import { ColorDot } from '@/components/ui/ColorPicker'
import type { Project, Task } from '@/types'

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string

  const { user, projects, fetchProjectTasks, sections, fetchSections, setShowQuickAdd, showQuickAdd } = useAppStore()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewStyle, setViewStyle] = useState<'list' | 'board'>('list')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadProject = async () => {
      // Find in store first
      const stored = projects.find((p) => p.id === projectId)
      if (stored) {
        setProject(stored)
        setViewStyle(stored.view_style || 'list')
      } else {
        // Fetch from API
        const { data } = await getProject(projectId)
        if (data) {
          setProject(data)
          setViewStyle(data.view_style || 'list')
        }
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId, projects])

  useEffect(() => {
    if (user && projectId) {
      fetchProjectTasks(projectId).then(() => {
        const projectTasks = useAppStore.getState().tasks[projectId] || []
        setTasks(projectTasks)
        setLoading(false)
      })
      fetchSections(projectId)
    }
  }, [user, projectId, refreshKey])

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useAppStore.subscribe((state) => {
      const projectTasks = state.tasks[projectId] || []
      setTasks(projectTasks)
    })
    return unsubscribe
  }, [projectId])

  const handleRefresh = useCallback(() => {
    if (user && projectId) {
      fetchProjectTasks(projectId)
      fetchSections(projectId)
      setRefreshKey((k) => k + 1)
    }
  }, [user, projectId, fetchProjectTasks, fetchSections])

  const projectSections = sections[projectId] || []

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    )
  }

  const incompleteTasks = tasks.filter((t) => !t.is_completed && !t.parent_id)
  const completedTasks = tasks.filter((t) => t.is_completed && !t.parent_id)

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/app/projects"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{project.icon || '📁'}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <ColorDot color={project.color} size="sm" />
              <span className="text-sm text-gray-500">
                {incompleteTasks.length} tasks
              </span>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewStyle('list')}
            className={`p-2 rounded transition ${
              viewStyle === 'list'
                ? 'bg-white shadow text-violet-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewStyle('board')}
            className={`p-2 rounded transition ${
              viewStyle === 'board'
                ? 'bg-white shadow text-violet-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add */}
        <button
          onClick={() => setShowQuickAdd(true, { projectId })}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <List className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks yet</h3>
          <p className="text-gray-500">Press Add Task or Cmd+K to create one</p>
        </div>
      ) : viewStyle === 'list' ? (
        <div key={`list-${refreshKey}`}>
          {/* Sections */}
          <SectionList
            projectId={projectId}
            tasks={incompleteTasks}
            sections={projectSections}
            onTaskClick={setSelectedTask}
            onRefresh={handleRefresh}
          />

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Completed ({completedTasks.length})
              </h3>
              <div className="space-y-2 opacity-60">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    depth={0}
                    onUpdate={handleRefresh}
                    onTaskClick={setSelectedTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Board view - group by section
        <div className="grid grid-cols-3 gap-4">
          {/* Unsectioned column */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">No Section</h3>
            <div className="space-y-2">
              {incompleteTasks
                .filter((t) => !t.section_id)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition"
                    onClick={() => setSelectedTask(task)}
                  >
                    <p className="text-sm text-gray-900">{task.content}</p>
                    {task.due_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Section columns */}
          {projectSections.map((section) => (
            <div key={section.id} className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">{section.name}</h3>
              <div className="space-y-2">
                {incompleteTasks
                  .filter((t) => t.section_id === section.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition"
                      onClick={() => setSelectedTask(task)}
                    >
                      <p className="text-sm text-gray-900">{task.content}</p>
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleRefresh}
        />
      )}

      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onAdd={handleRefresh}
        />
      )}
    </div>
  )
}
