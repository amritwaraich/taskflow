'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, ChevronRight } from 'lucide-react'
import { format, addDays, isToday, isTomorrow, isThisWeek, startOfWeek, endOfWeek, parseISO, isSameDay } from 'date-fns'
import { useAppStore } from '@/store/tasks'
import { TaskItem } from '@/components/tasks/TaskItem'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import type { Task } from '@/types'

export default function UpcomingPage() {
  const { upcomingTasks, fetchUpcomingTasks, user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUpcomingTasks(user.id).then(() => setLoading(false))
    }
  }, [user, fetchUpcomingTasks])

  const handleRefresh = useCallback(() => {
    if (user) {
      fetchUpcomingTasks(user.id)
      setRefreshKey((k) => k + 1)
    }
  }, [user, fetchUpcomingTasks])

  // Group tasks by day
  const groupTasksByDay = () => {
    const groups: Record<string, Task[]> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = addDays(today, 1)
    const nextWeekStart = startOfWeek(addDays(today, 7))
    const nextWeekEnd = endOfWeek(addDays(today, 7))

    upcomingTasks.forEach((task) => {
      if (!task.due_date) return
      const date = parseISO(task.due_date)
      const key = format(date, 'yyyy-MM-dd')

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(task)
    })

    return groups
  }

  const taskGroups = groupTasksByDay()

  // Get unique days
  const days = Object.keys(taskGroups).sort()

  const formatDayHeader = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isThisWeek(date)) return format(date, 'EEEE')
    return format(date, 'EEE, MMM d')
  }

  const isSelectedDay = (dateStr: string) => {
    if (!selectedDay) return false
    return selectedDay === dateStr
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming</h1>
        <p className="text-gray-500">Next 7 days</p>
      </div>

      {/* Day filter pills */}
      <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200">
        <button
          onClick={() => setSelectedDay(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            !selectedDay
              ? 'bg-violet-100 text-violet-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(isSelectedDay(day) ? null : day)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
              isSelectedDay(day)
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {formatDayHeader(day)}
            <span className="text-xs opacity-60">{taskGroups[day].length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : upcomingTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming tasks</h3>
          <p className="text-gray-500">Press Cmd+K to add tasks with due dates</p>
        </div>
      ) : (
        <div key={`upcoming-${refreshKey}`} className="space-y-6">
          {days
            .filter((day) => !selectedDay || isSelectedDay(day))
            .map((day) => (
              <div key={day}>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  {formatDayHeader(day)}
                  <ChevronRight className="w-4 h-4 opacity-50" />
                  <span className="font-normal text-gray-400">
                    {format(parseISO(day), 'MMMM d')}
                  </span>
                </h3>
                <div className="space-y-2">
                  {taskGroups[day].map((task) => (
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
            ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleRefresh}
        />
      )}
    </div>
  )
}
