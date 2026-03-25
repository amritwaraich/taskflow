'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import { format, isToday, isPast } from 'date-fns'
import { useAppStore } from '@/store/tasks'
import { TaskItem } from '@/components/tasks/TaskItem'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import type { Task } from '@/types'

export default function TodayPage() {
  const { todayTasks, fetchTodayTasks, user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (user) {
      fetchTodayTasks(user.id).then(() => setLoading(false))
    }
  }, [user, fetchTodayTasks])

  const handleRefresh = useCallback(() => {
    if (user) {
      fetchTodayTasks(user.id)
      setRefreshKey((k) => k + 1)
    }
  }, [user, fetchTodayTasks])

  // Separate overdue from today
  const overdueTasks = todayTasks.filter(
    (t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
  )
  const todayTasksOnly = todayTasks.filter(
    (t) => !t.due_date || isToday(new Date(t.due_date))
  )

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <p className="text-gray-500">{today}</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : todayTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">All done for today!</h3>
          <p className="text-gray-500">No tasks due today. Press Cmd+K to add one.</p>
        </div>
      ) : (
        <>
          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                Overdue ({overdueTasks.length})
              </h3>
              <div key={`overdue-${refreshKey}`} className="space-y-2 bg-red-50 rounded-xl p-4">
                {overdueTasks.map((task) => (
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

          {/* Today */}
          {todayTasksOnly.length > 0 && (
            <div key={`today-${refreshKey}`} className="space-y-2">
              {todayTasksOnly.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  depth={0}
                  onUpdate={handleRefresh}
                  onTaskClick={setSelectedTask}
                />
              ))}
            </div>
          )}
        </>
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
