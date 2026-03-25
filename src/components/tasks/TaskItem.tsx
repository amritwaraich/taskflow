'use client'

import { useState } from 'react'
import {
  Circle,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Plus,
  Calendar,
  Flag,
  Tag,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns'
import type { Task, Label as LabelType } from '@/types'
import { LabelBadge, LabelDot } from '@/components/labels/LabelBadge'
import { getPriorityColor } from '@/components/ui/PriorityPicker'
import { createTask, toggleTaskComplete, deleteTask, addSubTask, moveTaskToTopLevel } from '@/lib/api/tasks'
import { useAppStore } from '@/store/tasks'
import clsx from 'clsx'

interface TaskItemProps {
  task: Task
  depth?: number
  onUpdate?: () => void
  onTaskClick?: (task: Task) => void
  isInbox?: boolean
}

export function TaskItem({ task, depth = 0, onUpdate, onTaskClick, isInbox = false }: TaskItemProps) {
  const [expanded, setExpanded] = useState(depth === 0)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddSubtask, setShowAddSubtask] = useState(false)
  const [newSubtaskContent, setNewSubtaskContent] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const { user, updateTask, removeTask } = useAppStore()

  const hasChildren = task.children && task.children.length > 0
  const canAddChildren = task.layer < 3

  const indentClass = depth === 1 ? 'ml-8' : depth === 2 ? 'ml-16' : ''

  const priorityColors = getPriorityColor(task.priority || 4)

  const formatDueDate = () => {
    if (!task.due_date) return null
    const date = new Date(task.due_date)
    if (isToday(date)) return { text: 'Today', color: 'text-violet-600', bg: 'bg-violet-50' }
    if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-violet-600', bg: 'bg-violet-50' }
    if (isPast(date)) return { text: format(date, 'MMM d'), color: 'text-red-600', bg: 'bg-red-50' }
    if (isThisWeek(date)) return { text: format(date, 'EEE'), color: 'text-gray-600', bg: 'bg-gray-50' }
    return { text: format(date, 'MMM d'), color: 'text-gray-500', bg: 'bg-gray-50' }
  }

  const dueInfo = formatDueDate()
  const labels = task.labels?.map((tl) => tl.label).filter(Boolean) || []

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (user) {
      await toggleTaskComplete(task.id, !task.is_completed)
      updateTask(task.id, {
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null,
      }, task.project_id)
      onUpdate?.()
    }
  }

  const handleDelete = async () => {
    if (user) {
      await deleteTask(task.id)
      removeTask(task.id, task.project_id)
      setShowMenu(false)
      onUpdate?.()
    }
  }

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskContent.trim() || !user) return

    setAddingSubtask(true)
    const result = await addSubTask(task.id, newSubtaskContent.trim(), user.id)
    const data = 'data' in result ? result.data : null
    if (data) {
      updateTask(task.id, {
        children: [...(task.children || []), data],
      }, task.project_id)
      setNewSubtaskContent('')
      setShowAddSubtask(false)
      setExpanded(true)
    }
    setAddingSubtask(false)
    onUpdate?.()
  }

  const handleMoveToTopLevel = async () => {
    if (user) {
      await moveTaskToTopLevel(task.id)
      removeTask(task.id, task.project_id)
      setShowMenu(false)
      onUpdate?.()
    }
  }

  return (
    <div className={indentClass}>
      <div
        className={clsx(
          'group flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition',
          task.is_completed && 'opacity-60'
        )}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={clsx(
            'flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition',
            !hasChildren && !canAddChildren && 'invisible'
          )}
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={clsx(
            'flex-shrink-0 mt-0.5 transition',
            task.is_completed
              ? 'text-violet-600'
              : 'text-gray-400 hover:text-violet-600'
          )}
        >
          {task.is_completed ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Layer indicator */}
        {task.layer > 1 && (
          <span className="flex-shrink-0 mt-1 text-xs text-gray-400 font-mono">
            {task.layer === 2 ? '└─' : '└─└─'}
          </span>
        )}

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onTaskClick?.(task)}
        >
          <p className={clsx(
            'text-sm text-gray-900',
            task.is_completed && 'line-through text-gray-500'
          )}>
            {task.content}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Due date */}
            {dueInfo && (
              <span className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                dueInfo.bg,
                dueInfo.color
              )}>
                <Calendar className="w-3 h-3" />
                {dueInfo.text}
                {task.due_date && isToday(new Date(task.due_date)) && task.due_date.includes('T') && (
                  <span className="text-xs">
                    {format(new Date(task.due_date), 'h:mm a')}
                  </span>
                )}
              </span>
            )}

            {/* Priority */}
            {task.priority && task.priority < 3 && (
              <span className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                priorityColors.bg,
                priorityColors.text
              )}>
                <Flag className="w-3 h-3" />
                P{task.priority}
              </span>
            )}

            {/* Labels */}
            {labels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${label.color}20`, color: label.color }}
              >
                <LabelDot color={label.color} />
                {label.name}
              </span>
            ))}
            {labels.length > 3 && (
              <span className="text-xs text-gray-400">+{labels.length - 3}</span>
            )}

            {/* Children count */}
            {hasChildren && (
              <span className="text-xs text-gray-400">
                {task.children!.length} subtask{task.children!.length > 1 ? 's' : ''}
              </span>
            )}

            {/* Project */}
            {task.project && isInbox && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                {task.project.icon} {task.project.name}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          {/* Add subtask */}
          {canAddChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAddSubtask(!showAddSubtask)
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition"
              title="Add subtask"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Move to top level */}
          {task.layer > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleMoveToTopLevel()
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition"
              title="Move to top level"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1 min-w-40 animate-fadeIn">
                <button
                  onClick={() => {
                    onTaskClick?.(task)
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Edit
                </button>
                {task.layer > 1 && (
                  <button
                    onClick={handleMoveToTopLevel}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Move to top level
                  </button>
                )}
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
      </div>

      {/* Add subtask input */}
      {showAddSubtask && (
        <form onSubmit={handleAddSubtask} className="ml-10 mb-2">
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-violet-200 shadow-sm">
            <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={newSubtaskContent}
              onChange={(e) => setNewSubtaskContent(e.target.value)}
              placeholder="Add subtask..."
              className="flex-1 text-sm outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowAddSubtask(false)
                  setNewSubtaskContent('')
                }
              }}
            />
            {addingSubtask ? (
              <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
            ) : (
              <button
                type="submit"
                disabled={!newSubtaskContent.trim()}
                className="px-2 py-1 text-xs font-medium bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50 transition"
              >
                Add
              </button>
            )}
          </div>
        </form>
      )}

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-1">
          {task.children!.map((child) => (
            <TaskItem
              key={child.id}
              task={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
