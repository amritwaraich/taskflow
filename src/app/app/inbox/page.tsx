'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, CheckCircle, Circle, Clock, Trash2 } from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { useAppStore } from '@/store/tasks'
import { TaskItem } from '@/components/tasks/TaskItem'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import type { Task } from '@/types'

export default function InboxPage() {
  const { inboxTasks, fetchInboxTasks, user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (user) {
      fetchInboxTasks(user.id).then(() => setLoading(false))
    }
  }, [user, fetchInboxTasks])

  const handleRefresh = useCallback(() => {
    if (user) {
      fetchInboxTasks(user.id)
      setRefreshKey((k) => k + 1)
    }
  }, [user, fetchInboxTasks])

  const incompleteTasks = inboxTasks.filter((t) => !t.is_completed)
  const completedTasks = inboxTasks.filter((t) => t.is_completed)

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-500">{incompleteTasks.length} tasks</p>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : inboxTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Your inbox is empty</h3>
          <p className="text-gray-500">Press Cmd+K to add a task</p>
        </div>
      ) : (
        <>
          {/* Incomplete */}
          <div key={`inbox-${refreshKey}`} className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                depth={0}
                onUpdate={handleRefresh}
                onTaskClick={setSelectedTask}
                isInbox={true}
              />
            ))}
          </div>

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed ({completedTasks.length})
              </h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    depth={0}
                    onUpdate={handleRefresh}
                    onTaskClick={setSelectedTask}
                    isInbox={true}
                  />
                ))}
              </div>
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
